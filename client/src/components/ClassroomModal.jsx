import React, { useState, useEffect, useRef } from 'react';
import { eventBus } from '../utils/eventBus.js';
import { getLocationById, LOCATIONS } from '../data/locations.js';
import { classroomSocket } from '../services/classroomSocket.js';
import { classroomMedia } from '../services/classroomMediaService.js';
import { campusAudio } from '../services/campusAudio.js';
import ClassroomWhiteboard from './ClassroomWhiteboard.jsx';
import {
  X,
  BookOpen,
  Accessibility,
  Monitor,
  Volume2,
  Check,
  Shield,
  User,
  GraduationCap,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Hand,
  MessageSquare,
  HelpCircle,
  Users,
  Radio,
  Download,
  PenTool
} from './Icons.jsx';

export default function ClassroomModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const [selectedClassroomIndex, setSelectedClassroomIndex] = useState(0);

  // Role: 'student' | 'teacher'
  const [userRole, setUserRole] = useState('student');
  const [userName, setUserName] = useState('Aditya Sharma');
  const [userRollNo, setUserRollNo] = useState('2023CSE018');

  // Media states
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [permissionError, setPermissionError] = useState('');

  // Active view: 'stage' (presentation & 2D classroom) | 'whiteboard'
  const [centerView, setCenterView] = useState('stage');
  // Right tab: 'chat' | 'qa' | 'participants' | 'specs'
  const [rightTab, setRightTab] = useState('chat');

  // Classroom Live Room State
  const [sessionStatus, setSessionStatus] = useState('live'); // 'idle' | 'live' | 'ended'
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSeated, setIsSeated] = useState(false);
  const [seatType, setSeatType] = useState('wheelchair');
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null);
  const [answerInputText, setAnswerInputText] = useState('');

  const localVideoRef = useRef(null);
  const screenShareVideoRef = useRef(null);
  const chatBottomRef = useRef(null);

  // 1. Listen for Classroom Open from Campus Map or Interaction Panel
  useEffect(() => {
    const off = eventBus.on('classroom:open', async (e) => {
      let loc = e.detail?.location;
      if (!loc) {
        const id = e.detail?.locationId || 'lecture-hall-complex';
        loc = getLocationById(id) || LOCATIONS.find((l) => l.classrooms?.length > 0);
      }

      if (loc && loc.classrooms?.length > 0) {
        const crIdx = e.detail?.classroomIndex || 0;
        const cr = loc.classrooms[crIdx] || loc.classrooms[0];

        setLocation(loc);
        setSelectedClassroomIndex(crIdx);
        setIsOpen(true);
        setCenterView('stage');
        setRightTab('chat');
        setIsSeated(false);

        // Join Classroom Media & Isolated Socket Room
        const currentUser = {
          identity: userRole === 'teacher' ? 'prof_rk_sharma' : `student_${userRollNo.toLowerCase()}`,
          name: userRole === 'teacher' ? 'Dr. R. K. Sharma (Professor)' : userName,
          role: userRole,
          rollNo: userRollNo
        };

        await classroomMedia.enterRoom(cr.id, currentUser);
      }
    });

    return off;
  }, [userRole, userName, userRollNo]);

  // 2. Setup Socket & Media Listeners
  useEffect(() => {
    if (!isOpen) return;

    // Audio level speaking indicator
    classroomMedia.onAudioLevelChange = ({ isSpeaking }) => {
      setIsSpeaking(isSpeaking);
    };

    classroomMedia.onPermissionError = (msg) => {
      setPermissionError(msg);
      setTimeout(() => setPermissionError(''), 4000);
    };

    // Socket Room Initial State
    const unsubJoined = classroomSocket.on('room_joined', (data) => {
      if (data.roomParticipants) setParticipants(data.roomParticipants);
      if (data.messages) setMessages(data.messages);
      if (data.questions) setQuestions(data.questions);
      if (data.classroom?.status) setSessionStatus(data.classroom.status);
    });

    // Participant updates
    const unsubPartJoined = classroomSocket.on('participant_joined', ({ participant }) => {
      setParticipants((prev) => {
        const exists = prev.some((p) => p.identity === participant.identity);
        return exists ? prev : [...prev, participant];
      });
    });

    const unsubPartLeft = classroomSocket.on('participant_left', ({ identity }) => {
      setParticipants((prev) => prev.filter((p) => p.identity !== identity));
    });

    // Chat
    const unsubChat = classroomSocket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });

    // Q&A
    const unsubQAdd = classroomSocket.on('question_added', (q) => {
      setQuestions((prev) => [q, ...prev]);
    });

    const unsubQAnswer = classroomSocket.on('question_answered', (q) => {
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? q : item)));
    });

    // Hand Raised
    const unsubHandRaised = classroomSocket.on('hand_raised', (hand) => {
      campusAudio.playHandRaisePing();
      setParticipants((prev) =>
        prev.map((p) => (p.identity === hand.identity ? { ...p, isHandRaised: true } : p))
      );
    });

    const unsubHandLowered = classroomSocket.on('hand_lowered', ({ identity }) => {
      if (identity === (userRole === 'teacher' ? 'prof_rk_sharma' : `student_${userRollNo.toLowerCase()}`)) {
        setIsHandRaised(false);
      }
      setParticipants((prev) =>
        prev.map((p) => (p.identity === identity ? { ...p, isHandRaised: false } : p))
      );
    });

    // Session control
    const unsubSessionStarted = classroomSocket.on('session_started', ({ classroom }) => {
      setSessionStatus('live');
    });

    const unsubSessionEnded = classroomSocket.on('session_ended', () => {
      setSessionStatus('ended');
    });

    // Teacher moderation
    const unsubRemoved = classroomSocket.on('removed_from_class', () => {
      alert('You have been removed from this classroom session by the instructor.');
      handleClose();
    });

    return () => {
      unsubJoined?.();
      unsubPartJoined?.();
      unsubPartLeft?.();
      unsubChat?.();
      unsubQAdd?.();
      unsubQAnswer?.();
      unsubHandRaised?.();
      unsubHandLowered?.();
      unsubSessionStarted?.();
      unsubSessionEnded?.();
      unsubRemoved?.();
    };
  }, [isOpen, userRole, userRollNo]);

  if (!isOpen || !location) return null;

  const classrooms = location.classrooms || [];
  const currentClassroom = classrooms[selectedClassroomIndex] || classrooms[0];
  const slides = currentClassroom?.slides || [
    { title: 'Lecture Session', content: 'Smart interactive display active. Ready for coursework presentations.' },
    { title: 'A* Pathfinding on Campus Grid', content: 'f(n) = g(n) + h(n)\nAdmissible heuristic guarantees optimal path.' }
  ];
  const activeSlide = slides[activeSlideIndex] || slides[0];

  // Room switcher
  const handleSelectRoom = async (idx) => {
    setSelectedClassroomIndex(idx);
    setActiveSlideIndex(0);
    setIsSeated(false);

    const cr = classrooms[idx];
    if (cr) {
      await classroomMedia.exitRoom();
      const currentUser = {
        identity: userRole === 'teacher' ? 'prof_rk_sharma' : `student_${userRollNo.toLowerCase()}`,
        name: userRole === 'teacher' ? 'Dr. R. K. Sharma (Professor)' : userName,
        role: userRole,
        rollNo: userRollNo
      };
      await classroomMedia.enterRoom(cr.id, currentUser);
    }
  };

  // Exit classroom & teardown all media tracks
  const handleClose = async () => {
    await classroomMedia.exitRoom();
    setIsOpen(false);
    setIsSeated(false);
    setIsMicMuted(true);
    setIsCameraOn(false);
    setIsScreenSharing(false);
  };

  // Controls
  const handleToggleMic = async () => {
    const unmuted = await classroomMedia.toggleMicrophone();
    setIsMicMuted(!unmuted);
  };

  const handleToggleCamera = async () => {
    const stream = await classroomMedia.toggleCamera();
    if (stream) {
      setIsCameraOn(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } else {
      setIsCameraOn(false);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }
  };

  const handleToggleScreenShare = async () => {
    const stream = await classroomMedia.toggleScreenShare();
    if (stream) {
      setIsScreenSharing(true);
      if (screenShareVideoRef.current) {
        screenShareVideoRef.current.srcObject = stream;
      }
    } else {
      setIsScreenSharing(false);
      if (screenShareVideoRef.current) {
        screenShareVideoRef.current.srcObject = null;
      }
    }
  };

  const handleToggleHand = () => {
    if (isHandRaised) {
      classroomSocket.lowerHand(userRole === 'teacher' ? 'prof_rk_sharma' : `student_${userRollNo.toLowerCase()}`);
      setIsHandRaised(false);
    } else {
      classroomSocket.raiseHand(userRollNo);
      setIsHandRaised(true);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    classroomSocket.sendChatMessage(chatInput.trim());
    setChatInput('');
  };

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    classroomSocket.askQuestion(newQuestionText.trim(), userRollNo);
    setNewQuestionText('');
  };

  const handleAnswerSubmit = (qId) => {
    if (!answerInputText.trim()) return;
    classroomSocket.answerQuestion(qId, answerInputText.trim());
    setAnsweringQuestionId(null);
    setAnswerInputText('');
  };

  const handleStartClass = () => {
    classroomSocket.startSession(
      currentClassroom.currentClass?.subject || 'Lecture',
      currentClassroom.currentClass?.topic || 'Interactive Coursework'
    );
  };

  const handleEndClass = () => {
    if (window.confirm('Are you sure you want to conclude and end this live class session?')) {
      classroomSocket.endSession();
    }
  };

  const handleDownloadAttendance = () => {
    window.open(`/api/classrooms/${currentClassroom.id}/attendance?format=csv`, '_blank');
  };

  const handlePlayChime = () => {
    campusAudio.playBellChime();
    setAudioPlayed(true);
    setTimeout(() => setAudioPlayed(false), 2000);
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="flex h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl glass-panel shadow-2xl border border-white/10 bg-slate-950">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 px-5 py-2.5 bg-navy-900/90 gap-2">
          {/* Left: Building & Audio Isolation Status */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  IIIT Bhopal Interactive Metaverse
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                  <Radio size={10} className="animate-pulse" />
                  <span>Audio Isolated: {currentClassroom.id.toUpperCase()}</span>
                </span>
              </div>
              <h2 className="font-display text-base font-bold text-parchment leading-tight">
                {currentClassroom.name} · <span className="text-cyan-300">{location.name}</span>
              </h2>
            </div>
          </div>

          {/* Center: Live Status & Role Switcher */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                sessionStatus === 'live'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-white/10 bg-white/5 text-parchment/60'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  sessionStatus === 'live' ? 'bg-emerald-400 animate-ping' : 'bg-parchment/40'
                }`}
              />
              <span className="uppercase text-[10px] tracking-wider">
                {sessionStatus === 'live' ? 'Lecture in Progress' : 'Class Scheduled'}
              </span>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center rounded-xl bg-navy-950 p-1 border border-white/10">
              <button
                onClick={() => setUserRole('student')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  userRole === 'student'
                    ? 'bg-cyan-500 text-navy-950 shadow-sm'
                    : 'text-parchment/60 hover:text-parchment'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setUserRole('teacher')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  userRole === 'teacher'
                    ? 'bg-gold-500 text-navy-950 shadow-sm'
                    : 'text-parchment/60 hover:text-parchment'
                }`}
              >
                Teacher (Instructor)
              </button>
            </div>
          </div>

          {/* Right: Chime & Exit */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayChime}
              title="Ring class bell chime"
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                audioPlayed
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                  : 'border-white/10 bg-navy-800 text-parchment/70 hover:text-gold-400'
              }`}
            >
              <Volume2 size={14} />
              <span className="hidden sm:inline">{audioPlayed ? 'Bell Rang!' : 'Bell'}</span>
            </button>

            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500 hover:text-white transition"
              title="Exit Classroom and return to campus"
            >
              <X size={15} />
              <span>Exit Class</span>
            </button>
          </div>
        </div>

        {/* Room Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-2 bg-navy-950/80">
          <div className="flex items-center gap-1 overflow-x-auto">
            <span className="text-[11px] font-semibold text-parchment/50 uppercase tracking-wider mr-2 shrink-0">
              Select Hall:
            </span>
            {classrooms.map((cr, idx) => (
              <button
                key={cr.id}
                onClick={() => handleSelectRoom(idx)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                  selectedClassroomIndex === idx
                    ? 'bg-cyan-500 text-navy-950 shadow-md font-bold'
                    : 'text-parchment/70 hover:bg-white/5 hover:text-parchment'
                }`}
              >
                <Monitor size={12} />
                <span>{cr.name}</span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Stage vs Whiteboard */}
          <div className="flex items-center gap-1 rounded-xl bg-navy-900 p-1 border border-white/10 shrink-0">
            <button
              onClick={() => setCenterView('stage')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                centerView === 'stage'
                  ? 'bg-cyan-500 text-navy-950 font-bold'
                  : 'text-parchment/70 hover:text-parchment'
              }`}
            >
              <Monitor size={12} />
              <span>Lecture Stage</span>
            </button>

            <button
              onClick={() => setCenterView('whiteboard')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                centerView === 'whiteboard'
                  ? 'bg-cyan-500 text-navy-950 font-bold'
                  : 'text-parchment/70 hover:text-parchment'
              }`}
            >
              <PenTool size={12} />
              <span>Smart Whiteboard</span>
            </button>
          </div>
        </div>

        {/* Permission Error Banner */}
        {permissionError && (
          <div className="bg-red-500/20 border-b border-red-500/40 px-4 py-1.5 text-center text-xs font-semibold text-red-200">
            ⚠️ {permissionError}. Please allow media permissions in your browser.
          </div>
        )}

        {/* Main Body: Stage/Whiteboard on Left, Interactive Dashboards on Right */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Main Left Stage */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-gradient-to-b from-navy-950 via-slate-950 to-navy-950">
            {centerView === 'whiteboard' ? (
              <div className="h-full min-h-[420px]">
                <ClassroomWhiteboard classroomId={currentClassroom.id} isTeacher={userRole === 'teacher'} />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Active Subject & Instructor Banner */}
                {currentClassroom.currentClass && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-sm">
                        {currentClassroom.currentClass.code}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          Live Lecture Topic
                        </span>
                        <h3 className="text-sm font-bold text-parchment">
                          {currentClassroom.currentClass.subject}: {currentClassroom.currentClass.topic}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-semibold text-gold-400">
                        {currentClassroom.currentClass.faculty}
                      </span>
                      <div className="text-[10px] text-parchment/50">
                        {currentClassroom.currentClass.time}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2D Classroom Stage & Video Grid */}
                <div className="rounded-3xl border border-white/10 bg-navy-900/60 p-4 space-y-4">
                  {/* Presentation / Screen Share Viewer or Smart Board */}
                  {isScreenSharing ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-cyan-400 bg-black shadow-2xl">
                      <video
                        ref={screenShareVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-contain"
                      />
                      <div className="absolute top-3 left-3 rounded-lg bg-navy-950/80 px-2.5 py-1 text-[11px] font-bold text-cyan-300 border border-cyan-400/30">
                        🖥️ Live Screen Broadcast · {userRole === 'teacher' ? 'Instructor Stream' : 'Student Share'}
                      </div>
                    </div>
                  ) : (
                    /* Smartboard Display */
                    <div className="rounded-2xl border-2 border-slate-700 bg-slate-900 p-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-400" />
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          <span className="h-2 w-2 rounded-full bg-green-400" />
                          <span className="text-[10px] font-mono font-bold text-cyan-400 ml-1">
                            IIIT-BHOPAL // SMART_DISPLAY_4K
                          </span>
                        </div>
                        <span className="text-[10px] text-parchment/50 font-mono">
                          Slide {activeSlideIndex + 1} of {slides.length}
                        </span>
                      </div>

                      <div className="py-4">
                        <h4 className="font-display text-base font-bold text-gold-400">
                          {activeSlide.title}
                        </h4>
                        <p className="mt-2 text-xs sm:text-sm font-mono text-parchment/90 whitespace-pre-line leading-relaxed">
                          {activeSlide.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                        <button
                          disabled={activeSlideIndex === 0}
                          onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
                          className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] disabled:opacity-30 hover:bg-white/20"
                        >
                          ◀ Prev
                        </button>
                        <button
                          disabled={activeSlideIndex === slides.length - 1}
                          onClick={() => setActiveSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
                          className="rounded-lg bg-cyan-500 text-navy-950 font-bold px-2.5 py-1 text-[11px] disabled:opacity-30 hover:bg-cyan-400"
                        >
                          Next ▶
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Stage Podium & Participants Media Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Instructor Podium Card */}
                    <div
                      className={`relative flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition ${
                        isSpeaking && userRole === 'teacher'
                          ? 'border-emerald-400 ring-2 ring-emerald-400/50 bg-emerald-500/10'
                          : 'border-gold-500/40 bg-navy-800/80'
                      }`}
                    >
                      <div className="relative mb-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20 text-gold-400 border border-gold-400/40 font-bold">
                          {userRole === 'teacher' && isCameraOn ? (
                            <video
                              ref={localVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <GraduationCap size={24} />
                          )}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-navy-950 ${
                            !isMicMuted && userRole === 'teacher' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                        Instructor
                      </span>
                      <span className="text-xs font-semibold text-parchment">
                        {currentClassroom.currentClass?.faculty || 'Faculty Desk'}
                      </span>
                    </div>

                    {/* Student 1 (Current User if Student) */}
                    <div
                      className={`relative flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition ${
                        isSpeaking && userRole === 'student'
                          ? 'border-emerald-400 ring-2 ring-emerald-400/50 bg-emerald-500/10'
                          : isHandRaised
                          ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-500/10'
                          : 'border-cyan-500/30 bg-navy-800/60'
                      }`}
                    >
                      <div className="relative mb-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 font-bold">
                          {userRole === 'student' && isCameraOn ? (
                            <video
                              ref={localVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <User size={22} />
                          )}
                        </div>
                        {isHandRaised && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-navy-950">
                            <Hand size={11} />
                          </span>
                        )}
                        <span
                          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-navy-950 ${
                            !isMicMuted && userRole === 'student' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-cyan-300">You ({userRole})</span>
                      <span className="text-xs font-semibold text-parchment truncate max-w-full">
                        {userName}
                      </span>
                    </div>

                    {/* Virtual Classmates */}
                    {['Rohan Mehra (CSE)', 'Sneha Patil (ECE)'].map((name, i) => (
                      <div
                        key={i}
                        className="relative flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-navy-800/40 p-3 text-center opacity-80"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-parchment/60 border border-white/10 mb-1">
                          <User size={20} />
                        </div>
                        <span className="text-[10px] text-parchment/40">Active Attendee</span>
                        <span className="text-xs font-medium text-parchment/80">{name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Student Desks & Wheelchair Row */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-parchment/60 mb-2">
                      <span className="font-semibold text-cyan-300 flex items-center gap-1">
                        <Accessibility size={13} /> Row 1: Priority Wheelchair Accessible Desks
                      </span>
                      <span>Total Capacity: {currentClassroom.capacity} seats</span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((seatNum) => {
                        const isSelected = isSeated && seatType === 'wheelchair' && seatNum === 2;
                        return (
                          <button
                            key={seatNum}
                            onClick={() => {
                              setIsSeated(true);
                              setSeatType('wheelchair');
                            }}
                            className={`rounded-xl border p-2 text-center transition flex flex-col items-center justify-center gap-0.5 ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-500/30 text-cyan-200 ring-2 ring-cyan-400'
                                : 'border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-400 text-parchment/80'
                            }`}
                          >
                            <Accessibility size={14} className="text-cyan-400" />
                            <span className="text-[10px] font-bold">Desk {seatNum}</span>
                            <span className="text-[8px] text-cyan-300">♿ LAN+Power</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Chat, Q&A, Participants, Specs */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-navy-950 flex flex-col">
            {/* Sidebar Tabs */}
            <div className="flex items-center justify-around border-b border-white/10 bg-navy-900/60 p-1 text-xs">
              <button
                onClick={() => setRightTab('chat')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold rounded-xl transition ${
                  rightTab === 'chat'
                    ? 'bg-cyan-500 text-navy-950 font-bold shadow-sm'
                    : 'text-parchment/70 hover:text-parchment'
                }`}
              >
                <MessageSquare size={13} />
                <span>Chat</span>
              </button>

              <button
                onClick={() => setRightTab('qa')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold rounded-xl transition ${
                  rightTab === 'qa'
                    ? 'bg-cyan-500 text-navy-950 font-bold shadow-sm'
                    : 'text-parchment/70 hover:text-parchment'
                }`}
              >
                <HelpCircle size={13} />
                <span>Q&A ({questions.length})</span>
              </button>

              <button
                onClick={() => setRightTab('participants')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold rounded-xl transition ${
                  rightTab === 'participants'
                    ? 'bg-cyan-500 text-navy-950 font-bold shadow-sm'
                    : 'text-parchment/70 hover:text-parchment'
                }`}
              >
                <Users size={13} />
                <span>Roster ({participants.length || 3})</span>
              </button>

              <button
                onClick={() => setRightTab('specs')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-semibold rounded-xl transition ${
                  rightTab === 'specs'
                    ? 'bg-cyan-500 text-navy-950 font-bold shadow-sm'
                    : 'text-parchment/70 hover:text-parchment'
                }`}
              >
                <Accessibility size={13} />
                <span>Specs</span>
              </button>
            </div>

            {/* Tab 1: Room Chat */}
            {rightTab === 'chat' && (
              <div className="flex flex-1 flex-col overflow-hidden p-4">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  {messages.map((m) => {
                    const isMe = m.sender === userName || (userRole === 'teacher' && m.role === 'teacher');
                    return (
                      <div
                        key={m.id}
                        className={`rounded-2xl p-2.5 border ${
                          m.role === 'system'
                            ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-200'
                            : isMe
                            ? 'border-gold-500/30 bg-gold-500/10 text-parchment ml-4'
                            : 'border-white/5 bg-navy-900/80 text-parchment mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-parchment/50 mb-1">
                          <span className="font-bold text-gold-400">{m.sender}</span>
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendChat} className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message to classroom..."
                    className="flex-1 rounded-xl border border-white/10 bg-navy-900 px-3 py-2 text-xs text-parchment focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-navy-950 hover:bg-cyan-400 transition"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: Q&A System */}
            {rightTab === 'qa' && (
              <div className="flex flex-1 flex-col overflow-hidden p-4">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  {questions.map((q) => (
                    <div key={q.id} className="rounded-2xl border border-white/10 bg-navy-900/70 p-3 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-parchment/50">
                        <span className="font-bold text-cyan-300">{q.studentName} ({q.rollNo})</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold ${q.answered ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {q.answered ? 'Resolved' : 'Pending Answer'}
                        </span>
                      </div>
                      <p className="font-medium text-parchment">{q.question}</p>

                      {q.answered && (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-200">
                          <span className="font-bold text-gold-400">Ans ({q.answeredBy}):</span> {q.answer}
                        </div>
                      )}

                      {userRole === 'teacher' && !q.answered && (
                        <div className="pt-2 border-t border-white/10">
                          {answeringQuestionId === q.id ? (
                            <div className="space-y-1.5">
                              <textarea
                                value={answerInputText}
                                onChange={(e) => setAnswerInputText(e.target.value)}
                                placeholder="Type instructor explanation..."
                                className="w-full rounded-xl border border-white/10 bg-navy-950 p-2 text-xs text-parchment focus:outline-none"
                                rows={2}
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => setAnsweringQuestionId(null)}
                                  className="rounded-lg bg-navy-800 px-2 py-1 text-[10px]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleAnswerSubmit(q.id)}
                                  className="rounded-lg bg-gold-500 text-navy-950 px-2.5 py-1 text-[10px] font-bold"
                                >
                                  Submit Answer
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAnsweringQuestionId(q.id)}
                              className="rounded-lg bg-gold-500/20 text-gold-300 px-2.5 py-1 text-[10px] font-bold hover:bg-gold-500 hover:text-navy-950 transition"
                            >
                              Answer Question
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAskQuestion} className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Ask professor a question..."
                    className="flex-1 rounded-xl border border-white/10 bg-navy-900 px-3 py-2 text-xs text-parchment focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-gold-500 px-3 py-2 text-xs font-bold text-navy-950 hover:bg-gold-400 transition"
                  >
                    Ask
                  </button>
                </form>
              </div>
            )}

            {/* Tab 3: Participants & Teacher Moderation */}
            {rightTab === 'participants' && (
              <div className="flex flex-1 flex-col overflow-y-auto p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-parchment">Connected Roster</span>
                  <button
                    onClick={handleDownloadAttendance}
                    className="flex items-center gap-1 rounded-lg bg-navy-800 px-2 py-1 text-[10px] font-semibold text-parchment/80 hover:text-gold-400"
                    title="Export attendance CSV log"
                  >
                    <Download size={11} />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {participants.map((p) => (
                    <div
                      key={p.identity}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-navy-900/60 p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                          {p.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-parchment flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {p.isTeacher && (
                              <span className="rounded bg-gold-500/20 px-1 text-[9px] font-bold text-gold-400">
                                Faculty
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-parchment/40">{p.rollNo || p.role}</span>
                        </div>
                      </div>

                      {userRole === 'teacher' && !p.isTeacher && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => classroomSocket.muteParticipant(p.identity)}
                            className="rounded px-2 py-1 text-[9px] bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white"
                          >
                            Mute
                          </button>
                          <button
                            onClick={() => classroomSocket.removeParticipant(p.identity)}
                            className="rounded px-2 py-1 text-[9px] bg-white/10 text-parchment/60 hover:bg-red-600 hover:text-white"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Specifications & Accessibility */}
            {rightTab === 'specs' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Floor & Specifications
                  </span>
                  <h4 className="font-bold text-parchment text-sm">{currentClassroom.name}</h4>
                  <p className="text-parchment/60">{currentClassroom.floor} · {currentClassroom.type}</p>
                </div>

                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-2">
                  <div className="flex items-center justify-between text-cyan-300 font-bold text-xs">
                    <span className="flex items-center gap-1">
                      <Accessibility size={14} /> PwD Accessibility
                    </span>
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px]">100% Verified</span>
                  </div>
                  {currentClassroom.accessibilityFeatures?.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-parchment/80">
                      <Check size={12} className="text-cyan-400" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h5 className="font-bold uppercase tracking-wider text-parchment/60 text-[10px] mb-2">
                    Installed Multimedia Equipment
                  </h5>
                  <div className="space-y-1.5">
                    {currentClassroom.equipment?.map((eq, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl bg-navy-900/60 p-2 text-parchment/80 border border-white/5">
                        <Monitor size={12} className="text-gold-400" />
                        <span>{eq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Control Dock: Microphone, Camera, Screen Share, Hand, Teacher Start/End */}
        <div className="flex flex-wrap items-center justify-between border-t border-white/10 bg-navy-900/90 px-5 py-3 gap-3">
          {/* Audio & Video Controls */}
          <div className="flex items-center gap-2">
            {/* Microphone Toggle */}
            <button
              onClick={handleToggleMic}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition shadow-md ${
                !isMicMuted
                  ? 'bg-emerald-500 text-navy-950 ring-2 ring-emerald-400/50'
                  : 'bg-navy-800 text-red-300 border border-red-500/30 hover:bg-navy-700'
              }`}
            >
              {!isMicMuted ? <Mic size={15} /> : <MicOff size={15} />}
              <span>{!isMicMuted ? 'Mic On' : 'Unmute Mic'}</span>
            </button>

            {/* Camera Toggle */}
            <button
              onClick={handleToggleCamera}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition shadow-md ${
                isCameraOn
                  ? 'bg-cyan-500 text-navy-950 ring-2 ring-cyan-400/50'
                  : 'bg-navy-800 text-parchment/70 border border-white/10 hover:bg-navy-700'
              }`}
            >
              {isCameraOn ? <Video size={15} /> : <VideoOff size={15} />}
              <span>{isCameraOn ? 'Cam On' : 'Turn On Cam'}</span>
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={handleToggleScreenShare}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition shadow-md ${
                isScreenSharing
                  ? 'bg-amber-400 text-navy-950 ring-2 ring-amber-400/50'
                  : 'bg-navy-800 text-parchment/70 border border-white/10 hover:bg-navy-700'
              }`}
            >
              <ScreenShare size={15} />
              <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
            </button>
          </div>

          {/* Student Interaction Controls: Raise Hand */}
          {userRole === 'student' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleHand}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition shadow-md ${
                  isHandRaised
                    ? 'bg-amber-400 text-navy-950 ring-2 ring-amber-300 animate-pulse'
                    : 'bg-navy-800 text-parchment/80 border border-white/10 hover:bg-navy-700'
                }`}
              >
                <Hand size={15} />
                <span>{isHandRaised ? 'Hand Raised ✋' : 'Raise Hand'}</span>
              </button>
            </div>
          )}

          {/* Teacher Controls: Start / End Live Session */}
          {userRole === 'teacher' && (
            <div className="flex items-center gap-2">
              {sessionStatus !== 'live' ? (
                <button
                  onClick={handleStartClass}
                  className="flex items-center gap-1.5 rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 hover:bg-emerald-400 shadow-md transition"
                >
                  <Radio size={14} />
                  <span>Start Live Lecture</span>
                </button>
              ) : (
                <button
                  onClick={handleEndClass}
                  className="flex items-center gap-1.5 rounded-2xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 shadow-md transition"
                >
                  <X size={14} />
                  <span>End Live Lecture</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
