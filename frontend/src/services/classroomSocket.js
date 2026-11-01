/**
 * Classroom WebSocket Client for IIIT Bhopal Metaverse
 * Scoped strictly to the active classroom room ID.
 */

class ClassroomSocketClient {
  constructor() {
    this.socket = null;
    this.currentRoomId = null;
    this.currentClassroomId = null;
    this.currentUser = null;
    this.listeners = new Map();
    this.reconnectTimer = null;
    this.isConnected = false;
  }

  getWsUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // If running under Vite dev proxy or production
    return `${protocol}//${window.location.host}/ws/classroom`;
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.getWsUrl();
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.isConnected = true;
          if (this.currentClassroomId && this.currentUser) {
            this.send('join_room', {
              classroomId: this.currentClassroomId,
              user: this.currentUser
            });
          }
          this.emit('connection_status', { connected: true });
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.emit(data.type, data.payload);
          } catch (e) {
            console.error('[ClassroomSocket] Failed to parse message', e);
          }
        };

        this.socket.onclose = () => {
          this.isConnected = false;
          this.emit('connection_status', { connected: false });
        };

        this.socket.onerror = (err) => {
          console.warn('[ClassroomSocket] WebSocket connection issue', err);
          this.isConnected = false;
          resolve(); // Resolve so UI can gracefully fallback
        };
      } catch (err) {
        console.warn('[ClassroomSocket] Error opening socket', err);
        resolve();
      }
    });
  }

  async join(classroomId, user) {
    this.currentClassroomId = classroomId;
    this.currentUser = user;

    if (!this.isConnected) {
      await this.connect();
    }

    this.send('join_room', {
      classroomId,
      user
    });
  }

  leave() {
    if (this.isConnected && this.socket) {
      this.send('leave_room', {
        classroomId: this.currentClassroomId,
        identity: this.currentUser?.identity
      });
    }
    this.currentRoomId = null;
    this.currentClassroomId = null;
  }

  disconnect() {
    this.leave();
    if (this.socket) {
      try {
        this.socket.close();
      } catch {}
      this.socket = null;
    }
    this.isConnected = false;
  }

  send(type, payload = {}) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const list = this.listeners.get(event);
    if (list) {
      list.delete(callback);
      if (list.size === 0) this.listeners.delete(event);
    }
  }

  emit(event, data) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[ClassroomSocket] Error in listener for ${event}:`, e);
        }
      });
    }
  }

  // Helper senders
  sendChatMessage(text) {
    this.send('chat_message', { text });
  }

  sendWhiteboardStroke(stroke) {
    this.send('whiteboard_draw', stroke);
  }

  clearWhiteboard() {
    this.send('whiteboard_clear', {});
  }

  lockWhiteboard(isLocked) {
    this.send('whiteboard_lock', { isLocked });
  }

  raiseHand(rollNo) {
    this.send('hand_raise', { rollNo });
  }

  lowerHand(identity) {
    this.send('hand_lower', { identity });
  }

  acknowledgeHand(identity) {
    this.send('hand_acknowledge', { identity });
  }

  askQuestion(question, rollNo) {
    this.send('question_ask', { question, rollNo });
  }

  answerQuestion(questionId, answer) {
    this.send('question_answer', { questionId, answer });
  }

  updateMedia(isMuted, isCameraOn, isScreenSharing) {
    this.send('media_state_change', { isMuted, isCameraOn, isScreenSharing });
  }

  startSession(subject, topic) {
    this.send('session_start', { subject, topic });
  }

  endSession() {
    this.send('session_end', {});
  }

  muteParticipant(identity) {
    this.send('moderation_mute', { identity });
  }

  removeParticipant(identity) {
    this.send('moderation_remove', { identity });
  }

  sendSignal(targetIdentity, signalType, signalData) {
    this.send('webrtc_signal', {
      targetIdentity,
      signalType,
      signalData
    });
  }
}

export const classroomSocket = new ClassroomSocketClient();
