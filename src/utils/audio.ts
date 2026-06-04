"use client";

let audioCtx: AudioContext | null = null;
let globalMuted = false;

// Initialize or resume the Web Audio Context
export const initAudio = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch((err) => {
      console.warn("Failed to resume audio context:", err);
    });
  }

  return audioCtx;
};

// Retrieve mute status (checking localStorage to persist user selection)
export const getMuted = (): boolean => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("love-bird-muted");
    if (saved !== null) {
      globalMuted = saved === "true";
    }
  }
  return globalMuted;
};

// Update mute status
export const setMuted = (muted: boolean) => {
  globalMuted = muted;
  if (typeof window !== "undefined") {
    localStorage.setItem("love-bird-muted", String(muted));
  }
};

// Synthesize a cute pop sound when the button moves
export const playPopSound = () => {
  if (getMuted()) return;
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  // A rapid pitch sweep gives that cute bubble "pop" effect
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(700, now + 0.07);
  
  // Fast envelope: quick attack, steep decay
  gainNode.gain.setValueAtTime(0.12, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
  
  osc.start(now);
  osc.stop(now + 0.08);
};

// Synthesize a sweet music-box/chime arpeggio for YES clicked
export const playChimeSound = () => {
  if (getMuted()) return;
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Sweet romantic chord arpeggio (C5 - E5 - G5 - C6)
  const notes = [523.25, 659.25, 783.99, 1046.50];
  
  notes.forEach((freq, idx) => {
    // Delay each note slightly to form a cascading arpeggio
    const noteTime = now + idx * 0.08;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Triangle oscillator provides a warm, music-box-like timbre
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, noteTime);
    
    // Fade-in (attack) and long decay (sustain/release) to sound like bells
    gainNode.gain.setValueAtTime(0, noteTime);
    gainNode.gain.linearRampToValueAtTime(0.12, noteTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.55);
    
    osc.start(noteTime);
    osc.stop(noteTime + 0.6);
  });
};
