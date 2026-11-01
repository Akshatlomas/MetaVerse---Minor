import React, { useRef, useState, useEffect } from 'react';
import { classroomSocket } from '../services/classroomSocket.js';
import { PenTool, Eraser, Lock, Unlock, Download, RotateCcw } from './Icons.jsx';

const COLORS = ['#f8fafc', '#38bdf8', '#fbbf24', '#34d399', '#f87171', '#c084fc'];
const STROKE_WIDTHS = [2, 4, 8, 14];

export default function ClassroomWhiteboard({ classroomId, isTeacher = false }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [color, setColor] = useState('#38bdf8');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [points, setPoints] = useState([]);

  // Draw a received stroke on the canvas
  const drawStrokeOnCanvas = (stroke) => {
    const canvas = canvasRef.current;
    if (!canvas || !stroke || !stroke.points || stroke.points.length < 2) return;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.strokeStyle = stroke.tool === 'eraser' ? '#0f172a' : stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    // Setup socket listeners for synchronized drawing
    const unsubDraw = classroomSocket.on('whiteboard_draw', (stroke) => {
      drawStrokeOnCanvas(stroke);
    });

    const unsubClear = classroomSocket.on('whiteboard_clear', () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    });

    const unsubLock = classroomSocket.on('whiteboard_lock_changed', ({ isLocked }) => {
      setIsLocked(isLocked);
    });

    // Initialize Canvas background
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement.clientWidth || 800;
      canvas.height = canvas.parentElement.clientHeight || 450;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      unsubDraw?.();
      unsubClear?.();
      unsubLock?.();
    };
  }, []);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    if (isLocked && !isTeacher) return;
    const pt = getCanvasCoords(e);
    setIsDrawing(true);
    setPoints([pt]);
  };

  const draw = (e) => {
    if (!isDrawing || (isLocked && !isTeacher)) return;
    const pt = getCanvasCoords(e);
    const newPoints = [...points, pt];
    setPoints(newPoints);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (newPoints.length >= 2) {
      const p1 = newPoints[newPoints.length - 2];
      const p2 = newPoints[newPoints.length - 1];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (points.length >= 2) {
      const strokeData = {
        tool,
        color,
        lineWidth,
        points,
        role: isTeacher ? 'teacher' : 'student'
      };
      classroomSocket.sendWhiteboardStroke(strokeData);
    }
    setPoints([]);
  };

  const handleClear = () => {
    if (!isTeacher) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      classroomSocket.clearWhiteboard();
    }
  };

  const handleToggleLock = () => {
    if (!isTeacher) return;
    const next = !isLocked;
    setIsLocked(next);
    classroomSocket.lockWhiteboard(next);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `iiit-whiteboard-${classroomId}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-inner">
      {/* Top Whiteboard Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-navy-900/90 px-4 py-2 text-xs">
        {/* Tool Selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool('pen')}
            disabled={isLocked && !isTeacher}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 font-semibold transition ${
              tool === 'pen'
                ? 'bg-cyan-500 text-navy-950 shadow-sm'
                : 'text-parchment/70 hover:bg-white/10'
            }`}
          >
            <PenTool size={13} />
            <span>Pen</span>
          </button>

          <button
            onClick={() => setTool('eraser')}
            disabled={isLocked && !isTeacher}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 font-semibold transition ${
              tool === 'eraser'
                ? 'bg-amber-400 text-navy-950 shadow-sm'
                : 'text-parchment/70 hover:bg-white/10'
            }`}
          >
            <Eraser size={13} />
            <span>Eraser</span>
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setTool('pen');
              }}
              style={{ backgroundColor: c }}
              className={`h-5 w-5 rounded-full border transition transform ${
                color === c && tool === 'pen'
                  ? 'scale-125 border-white ring-2 ring-cyan-400'
                  : 'border-white/20 hover:scale-110'
              }`}
            />
          ))}
        </div>

        {/* Stroke Widths */}
        <div className="flex items-center gap-1.5">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => setLineWidth(w)}
              className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                lineWidth === w
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                  : 'border-white/10 text-parchment/50 hover:bg-white/5'
              }`}
            >
              <span style={{ height: w, width: w }} className="rounded-full bg-current" />
            </button>
          ))}
        </div>

        {/* Action Controls & Teacher Moderation */}
        <div className="flex items-center gap-1.5">
          {isTeacher && (
            <button
              onClick={handleToggleLock}
              className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 font-semibold transition ${
                isLocked
                  ? 'border-red-500 bg-red-500/20 text-red-300'
                  : 'border-white/10 bg-navy-800 text-parchment/70 hover:text-parchment'
              }`}
              title="Lock/Unlock student drawing access"
            >
              {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
              <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
            </button>
          )}

          {isTeacher && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 rounded-xl border border-white/10 bg-navy-800 px-2.5 py-1 text-parchment/70 hover:bg-red-500/20 hover:text-red-300 transition"
              title="Clear entire whiteboard"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-navy-800 px-2.5 py-1 text-parchment/70 hover:text-gold-400 transition"
            title="Download Whiteboard PNG"
          >
            <Download size={12} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Lock Status Warning for Students */}
      {isLocked && !isTeacher && (
        <div className="absolute top-12 left-4 z-10 flex items-center gap-1.5 rounded-xl bg-red-500/20 border border-red-500/40 px-3 py-1 text-xs text-red-200 backdrop-blur-md">
          <Lock size={12} />
          <span>Instructor locked student drawing</span>
        </div>
      )}

      {/* Canvas Area */}
      <div className="relative flex-1 bg-slate-950 cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="h-full w-full touch-none"
        />
      </div>
    </div>
  );
}
