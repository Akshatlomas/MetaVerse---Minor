import { classroomSocket } from './classroomSocket.js';
import { campusAudio } from './campusAudio.js';

/**
 * WebRTC and LiveKit Hybrid Media Service for IIIT Bhopal Virtual Classrooms.
 * Handles audio isolation, microphone, camera, and screen sharing streams.
 */

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

class ClassroomMediaService {
  constructor() {
    this.currentRoomId = null;
    this.currentClassroomId = null;
    this.localAudioStream = null;
    this.localVideoStream = null;
    this.screenStream = null;
    this.isMicMuted = true;
    this.isCameraOn = false;
    this.isScreenSharing = false;

    // peerIdentity -> RTCPeerConnection
    this.peerConnections = new Map();
    // peerIdentity -> MediaStream (remote)
    this.remoteStreams = new Map();
    // peerIdentity -> HTMLAudioElement
    this.remoteAudioElements = new Map();

    this.audioContext = null;
    this.micAnalyser = null;
    this.audioLevelInterval = null;
    this.onAudioLevelChange = null;
    this.onRemoteStreamsChange = null;
    this.onPermissionError = null;

    this.setupSignaling();
  }

  setupSignaling() {
    classroomSocket.on('webrtc_signal', async (payload) => {
      const { fromIdentity, signalType, signalData } = payload;
      if (!fromIdentity) return;

      try {
        if (signalType === 'offer') {
          await this.handleOffer(fromIdentity, signalData);
        } else if (signalType === 'answer') {
          await this.handleAnswer(fromIdentity, signalData);
        } else if (signalType === 'ice_candidate') {
          await this.handleIceCandidate(fromIdentity, signalData);
        }
      } catch (err) {
        console.warn('[ClassroomMedia] Error processing WebRTC signal:', err);
      }
    });

    classroomSocket.on('participant_left', ({ identity }) => {
      this.closePeer(identity);
    });
  }

  async enterRoom(classroomId, user) {
    this.currentClassroomId = classroomId;
    this.currentRoomId = `iiit-classroom-${classroomId.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`;
    this.user = user;

    // 1. Mute campus outdoor ambience immediately
    campusAudio.muteForClassroom();
    campusAudio.playDoorTransition();

    // 2. Fetch LiveKit Token from server
    try {
      const res = await fetch(`/api/classrooms/${classroomId}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: user.identity,
          name: user.name,
          role: user.role
        })
      });
      const tokenData = await res.json();
      this.tokenData = tokenData;
    } catch (err) {
      console.warn('[ClassroomMedia] Token fetch failed, proceeding in peer-to-peer mode:', err);
    }

    // 3. Join Socket room
    await classroomSocket.join(classroomId, user);
  }

  async exitRoom() {
    // 1. Stop all local microphone and camera tracks
    if (this.localAudioStream) {
      this.localAudioStream.getTracks().forEach((t) => t.stop());
      this.localAudioStream = null;
    }
    if (this.localVideoStream) {
      this.localVideoStream.getTracks().forEach((t) => t.stop());
      this.localVideoStream = null;
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }

    // 2. Teardown audio level analyser
    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval);
      this.audioLevelInterval = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    // 3. Close all remote peer connections & stop remote audio
    this.peerConnections.forEach((pc, identity) => {
      this.closePeer(identity);
    });
    this.peerConnections.clear();
    this.remoteStreams.clear();

    // 4. Leave socket room
    classroomSocket.leave();

    this.isMicMuted = true;
    this.isCameraOn = false;
    this.isScreenSharing = false;
    this.currentRoomId = null;
    this.currentClassroomId = null;

    // 5. Restore campus ambient sounds
    campusAudio.resumeFromClassroom();
  }

  getOrCreatePeer(peerIdentity) {
    if (this.peerConnections.has(peerIdentity)) {
      return this.peerConnections.get(peerIdentity);
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Add local tracks if available
    if (this.localAudioStream) {
      this.localAudioStream.getTracks().forEach((t) => pc.addTrack(t, this.localAudioStream));
    }
    if (this.localVideoStream) {
      this.localVideoStream.getTracks().forEach((t) => pc.addTrack(t, this.localVideoStream));
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => pc.addTrack(t, this.screenStream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        classroomSocket.sendSignal(peerIdentity, 'ice_candidate', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0] || new MediaStream([event.track]);
      this.remoteStreams.set(peerIdentity, stream);

      // Play remote audio through isolated audio element
      if (event.track.kind === 'audio') {
        let audioEl = this.remoteAudioElements.get(peerIdentity);
        if (!audioEl) {
          audioEl = new Audio();
          audioEl.autoplay = true;
          this.remoteAudioElements.set(peerIdentity, audioEl);
        }
        audioEl.srcObject = stream;
        audioEl.play().catch(() => {});
      }

      this.onRemoteStreamsChange?.(new Map(this.remoteStreams));
    };

    this.peerConnections.set(peerIdentity, pc);
    return pc;
  }

  closePeer(peerIdentity) {
    const pc = this.peerConnections.get(peerIdentity);
    if (pc) {
      try {
        pc.close();
      } catch {}
      this.peerConnections.delete(peerIdentity);
    }

    const audioEl = this.remoteAudioElements.get(peerIdentity);
    if (audioEl) {
      audioEl.pause();
      audioEl.srcObject = null;
      this.remoteAudioElements.delete(peerIdentity);
    }

    this.remoteStreams.delete(peerIdentity);
    this.onRemoteStreamsChange?.(new Map(this.remoteStreams));
  }

  async handleOffer(fromIdentity, offer) {
    const pc = this.getOrCreatePeer(fromIdentity);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    classroomSocket.sendSignal(fromIdentity, 'answer', answer);
  }

  async handleAnswer(fromIdentity, answer) {
    const pc = this.peerConnections.get(fromIdentity);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async handleIceCandidate(fromIdentity, candidate) {
    const pc = this.peerConnections.get(fromIdentity);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  async callPeer(peerIdentity) {
    const pc = this.getOrCreatePeer(peerIdentity);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    classroomSocket.sendSignal(peerIdentity, 'offer', offer);
  }

  // --- Microphone & Speaking Indicator ---

  async toggleMicrophone() {
    if (this.isMicMuted) {
      // Unmute: Request microphone if not already acquired
      try {
        if (!this.localAudioStream) {
          this.localAudioStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true }
          });
          this.setupAudioAnalyser(this.localAudioStream);

          // Add audio tracks to all active peer connections
          this.localAudioStream.getAudioTracks().forEach((track) => {
            this.peerConnections.forEach((pc) => {
              pc.addTrack(track, this.localAudioStream);
            });
          });
        } else {
          this.localAudioStream.getAudioTracks().forEach((t) => (t.enabled = true));
        }

        this.isMicMuted = false;
        classroomSocket.updateMedia(this.isMicMuted, this.isCameraOn, this.isScreenSharing);
        return true;
      } catch (err) {
        console.warn('[ClassroomMedia] Microphone permission denied or unavailable:', err);
        this.onPermissionError?.('Microphone access denied by browser');
        return false;
      }
    } else {
      // Mute microphone
      if (this.localAudioStream) {
        this.localAudioStream.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      this.isMicMuted = true;
      classroomSocket.updateMedia(this.isMicMuted, this.isCameraOn, this.isScreenSharing);
      return false;
    }
  }

  setupAudioAnalyser(stream) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.micAnalyser = this.audioContext.createAnalyser();
      this.micAnalyser.fftSize = 64;
      source.connect(this.micAnalyser);

      const buffer = new Uint8Array(this.micAnalyser.frequencyBinCount);

      if (this.audioLevelInterval) clearInterval(this.audioLevelInterval);
      this.audioLevelInterval = setInterval(() => {
        if (!this.isMicMuted && this.micAnalyser) {
          this.micAnalyser.getByteFrequencyData(buffer);
          let sum = 0;
          for (let i = 0; i < buffer.length; i++) sum += buffer[i];
          const average = sum / buffer.length;
          const isSpeaking = average > 18;
          this.onAudioLevelChange?.({ average, isSpeaking });
        } else {
          this.onAudioLevelChange?.({ average: 0, isSpeaking: false });
        }
      }, 120);
    } catch {}
  }

  // --- Camera Video ---

  async toggleCamera() {
    if (!this.isCameraOn) {
      try {
        if (!this.localVideoStream) {
          this.localVideoStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { max: 24 } }
          });

          this.localVideoStream.getVideoTracks().forEach((track) => {
            this.peerConnections.forEach((pc) => {
              pc.addTrack(track, this.localVideoStream);
            });
          });
        } else {
          this.localVideoStream.getVideoTracks().forEach((t) => (t.enabled = true));
        }

        this.isCameraOn = true;
        classroomSocket.updateMedia(this.isMicMuted, this.isCameraOn, this.isScreenSharing);
        return this.localVideoStream;
      } catch (err) {
        console.warn('[ClassroomMedia] Camera permission denied or unavailable:', err);
        this.onPermissionError?.('Camera access denied by browser');
        return null;
      }
    } else {
      if (this.localVideoStream) {
        this.localVideoStream.getVideoTracks().forEach((t) => {
          t.enabled = false;
          t.stop();
        });
        this.localVideoStream = null;
      }
      this.isCameraOn = false;
      classroomSocket.updateMedia(this.isMicMuted, this.isCameraOn, this.isScreenSharing);
      return null;
    }
  }

  // --- Screen Sharing ---

  async toggleScreenShare() {
    if (!this.isScreenSharing) {
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always', frameRate: { max: 30 } },
          audio: true
        });

        // When user clicks browser native "Stop Sharing"
        this.screenStream.getVideoTracks()[0].onended = () => {
          this.stopScreenShare();
        };

        this.screenStream.getTracks().forEach((track) => {
          this.peerConnections.forEach((pc) => {
            pc.addTrack(track, this.screenStream);
          });
        });

        this.isScreenSharing = true;
        classroomSocket.updateMedia(this.isMicMuted, this.isCameraOn, this.isScreenSharing);
        return this.screenStream;
      } catch (err) {
        console.warn('[ClassroomMedia] Screen share cancelled or denied:', err);
        return null;
      }
    } else {
      this.stopScreenShare();
      return null;
    }
  }

  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
    this.isScreenSharing = false;
    classroomSocket.updateMedia(this.isMicMuted, this.isCameraOn, this.isScreenSharing);
  }
}

export const classroomMedia = new ClassroomMediaService();
