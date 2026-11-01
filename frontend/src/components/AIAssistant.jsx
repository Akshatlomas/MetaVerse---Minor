import React, { useState, useRef, useEffect } from 'react';
import { askAssistant } from '../services/aiService.js';
import { eventBus } from '../utils/eventBus.js';
import { Volume2, VolumeX, Send, Sparkles, Navigation } from './Icons.jsx';

const SUGGESTIONS = [
  'Where is the library?',
  'Enter Classrooms',
  'Take me to CCF computer labs',
  'Show wheelchair accessible ramps',
  'Where can I eat?'
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Namaste! I'm your IIIT Bhopal Campus AI Guide. Ask me for directions, classrooms, lab facilities, or PwD accessibility ramps across the campus."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const runAction = (action) => {
    if (!action) return;
    if (action.action === 'navigate' && action.destination) {
      eventBus.emit('location:focus', { locationId: action.destination });
      eventBus.emit('navigate:request', { destinationId: action.destination });
    } else if (action.action === 'show_location' && action.location) {
      eventBus.emit('location:focus', { locationId: action.location });
    }
  };

  const send = async (text) => {
    const message = text ?? input;
    if (!message.trim()) return;

    setMessages((m) => [...m, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);

    try {
      const result = await askAssistant(message);
      setMessages((m) => [...m, { role: 'assistant', text: result.reply, action: result.action }]);
      runAction(result.action);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: "I'm currently running in local fallback mode. Please ask about campus buildings, classrooms, or library navigation." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pointer-events-auto absolute bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 flex h-[490px] w-[360px] max-w-[90vw] flex-col rounded-3xl glass-panel shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-navy-900/90">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-500/20 text-gold-400 border border-gold-500/30">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs font-bold text-parchment">IIIT Bhopal AI Guide</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-parchment/50">NLP Navigation Assistant</span>
              </div>
            </div>

            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setOpen(false);
              }}
              className="rounded-full p-1.5 text-parchment/40 hover:bg-white/5 hover:text-parchment"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-xs">
            {messages.map((m, i) => (
              <div key={i} className="space-y-1">
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'ml-auto bg-gold-500 text-navy-950 font-semibold'
                      : 'border border-white/5 bg-navy-800/90 text-parchment/95'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.action && m.action.action === 'navigate' && (
                    <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-gold-400">
                      <span className="flex items-center gap-1">
                        <Navigation size={11} /> Waypoints Plotted
                      </span>
                      <span>Follow Gold Path</span>
                    </div>
                  )}
                </div>

                {m.role === 'assistant' && (
                  <div className="flex items-center gap-2 pl-2">
                    <button
                      onClick={() => speakText(m.text)}
                      className="text-[10px] text-parchment/40 hover:text-gold-400 flex items-center gap-1"
                      title="Read aloud"
                    >
                      {isSpeaking ? <VolumeX size={11} /> : <Volume2 size={11} />}
                      <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-parchment/50 italic">
                <span className="h-2 w-2 rounded-full bg-gold-400 animate-ping" />
                <span>Consulting campus knowledge base…</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1 px-3 pb-2 bg-navy-950/60">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-xl border border-white/10 bg-navy-900/80 px-2 py-1 text-[10px] text-parchment/70 hover:border-gold-400 hover:text-gold-400 transition"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-white/10 bg-navy-900/90 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about campus..."
              className="flex-1 rounded-xl border border-white/10 bg-navy-950 px-3.5 py-2 text-xs text-parchment placeholder:text-parchment/40 focus:border-gold-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-500 text-navy-950 transition hover:bg-gold-400 disabled:opacity-40"
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-gold-500 to-amber-400 text-navy-950 text-xl font-bold shadow-2xl transition hover:scale-105 active:scale-95 border border-gold-300"
        aria-label="Toggle AI assistant"
      >
        {open ? '✕' : '🤖'}
      </button>
    </div>
  );
}
