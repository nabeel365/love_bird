"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Volume2, VolumeX } from "lucide-react";
import confetti from "canvas-confetti";
import { playPopSound, playChimeSound, getMuted, setMuted, initAudio } from "@/utils/audio";
import HeartBackground from "@/components/HeartBackground";
import VideoModal from "@/components/VideoModal";

interface Reaction {
  id: number;
  text: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  expiresAt: number;
}

const PLAYFUL_EMOJIS = [
  "😂 Nice try!",
  "😝 Nope!",
  "🙈 Not happening!",
  "🏃 Catch me first!",
  "😜 Think again!",
  "💨 Too slow!",
  "🤭 Try harder!",
  "🤣 Almost got me!",
  "🤪 Whoops!",
  "🙅 No way!",
  "😏 Try the other button!",
  "🐒 Missed me!",
];

export default function Home() {
  const [escapeCount, setEscapeCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isNoFloating, setIsNoFloating] = useState(false);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });

  const yesButtonRef = useRef<HTMLButtonElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);
  const floatingNoButtonRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync mute state on mount
  useEffect(() => {
    setIsMuted(getMuted());
  }, []);

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    initAudio(); // Initialize audio context on click if not already
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
  };

  // Helper to trigger the escape behavior
  const escapeNoButton = (clientX: number, clientY: number) => {
    initAudio(); // Resume audio context if needed
    playPopSound();

    const noBtn = isNoFloating ? floatingNoButtonRef.current : noButtonRef.current;
    if (!noBtn) return;

    const noRect = noBtn.getBoundingClientRect();
    const btnWidth = noRect.width || 120;
    const btnHeight = noRect.height || 50;

    // Capture current position before moving to spawn a reaction bubble there
    const prevX = noRect.left + btnWidth / 2;
    const prevY = noRect.top + btnHeight / 2;

    let targetX = 0;
    let targetY = 0;
    let attempts = 0;
    let overlapsYes = true;

    const yesBtn = yesButtonRef.current;
    const yesRect = yesBtn ? yesBtn.getBoundingClientRect() : null;

    // Loop to find coordinates that stay inside screen and don't overlap YES button
    while (overlapsYes && attempts < 35) {
      attempts++;

      // Pick random point inside viewport (leaving 25px margin)
      targetX = Math.random() * (window.innerWidth - btnWidth - 50) + 25;
      targetY = Math.random() * (window.innerHeight - btnHeight - 50) + 25;

      if (yesRect) {
        // Expand YES boundary by 85px to avoid tight crowding
        const yesPadding = 85;
        const yesLeft = yesRect.left - yesPadding;
        const yesRight = yesRect.right + yesPadding;
        const yesTop = yesRect.top - yesPadding;
        const yesBottom = yesRect.bottom + yesPadding;

        const overlapsHorizontal = targetX + btnWidth > yesLeft && targetX < yesRight;
        const overlapsVertical = targetY + btnHeight > yesTop && targetY < yesBottom;

        overlapsYes = overlapsHorizontal && overlapsVertical;
      } else {
        overlapsYes = false;
      }
    }

    // If it still overlaps after attempts (small screens), pick one of the outer corners
    if (overlapsYes) {
      const corners = [
        { x: 25, y: 25 },
        { x: window.innerWidth - btnWidth - 25, y: 25 },
        { x: 25, y: window.innerHeight - btnHeight - 25 },
        { x: window.innerWidth - btnWidth - 25, y: window.innerHeight - btnHeight - 25 }
      ];
      const selected = corners[Math.floor(Math.random() * corners.length)];
      targetX = selected.x;
      targetY = selected.y;
    }

    // Set absolute coordinate state and switch flag to start render absolute
    setNoPos({ x: targetX, y: targetY });
    setIsNoFloating(true);
    setEscapeCount((prev) => prev + 1);

    // Spawn floating reaction with random explosion direction
    const randomReaction = PLAYFUL_EMOJIS[Math.floor(Math.random() * PLAYFUL_EMOJIS.length)];
    const angle = Math.random() * Math.PI * 2; // Random direction 0 to 360 deg
    const floatDistance = Math.random() * 50 + 65; // Random distance between 65px and 115px
    const tx = Math.cos(angle) * floatDistance;
    const ty = Math.sin(angle) * floatDistance;

    const newReaction: Reaction = {
      id: Date.now(),
      text: randomReaction,
      x: prevX,
      y: prevY,
      tx,
      ty,
      expiresAt: Date.now() + 1500, // Vanish after 1.5 seconds (well within 3s!)
    };
    setReactions((prev) => [...prev, newReaction]);
  };

  // Tracking cursor coordinates to escape BEFORE mouse actually hovers
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const noBtn = isNoFloating ? floatingNoButtonRef.current : noButtonRef.current;
      if (!noBtn) return;

      const noRect = noBtn.getBoundingClientRect();
      const btnCenterX = noRect.left + noRect.width / 2;
      const btnCenterY = noRect.top + noRect.height / 2;

      // Distance calculation between cursor and center of NO button
      const dx = e.clientX - btnCenterX;
      const dy = e.clientY - btnCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Threshold increases as escapeCount grows, making it harder to catch
      const baseThreshold = 105;
      const threshold = baseThreshold + Math.min(escapeCount * 3.5, 75);

      if (distance < threshold) {
        escapeNoButton(e.clientX, e.clientY);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [escapeCount, isNoFloating]);

  // Periodic cleanup of reaction text using timestamp sweep to avoid useEffect debouncing/reset issues
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setReactions((prev) => {
        const active = prev.filter((r) => now < r.expiresAt);
        if (active.length === prev.length) return prev;
        return active;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const handleYesClick = () => {
    initAudio();
    playChimeSound();

    // Trigger full screen confetti celebration
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#ff7597", "#ff4b6e", "#ff8da1", "#ffffff", "#ffd700"],
    });

    // Multi-burst animations
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
      });
    }, 350);

    setIsVideoModalOpen(true);
  };

  // YES scale dynamics (grows larger as NO retreats)
  const yesScale = 1 + Math.min(escapeCount * 0.065, 1.4);
  // NO scale dynamics (shrinks smaller to add difficulty)
  const noScale = Math.max(1 - escapeCount * 0.02, 0.6);

  // Dynamic pleading narrative text based on escapeCount
  const getPleadingMessage = () => {
    if (escapeCount === 0) return "Choose wisely... 😉";
    if (escapeCount < 5) return "Wait, why are you moving away? 🤨";
    if (escapeCount < 10) return "Oops! You missed it! 😂";
    if (escapeCount < 15) return "Are you trying to click NO? That's not allowed! 🥺";
    if (escapeCount < 20) return "Look, the YES button is right there! 👉❤️👈";
    return "🥺 Why are you trying so hard to say no? Just click YES!";
  };

  return (
    <main 
      ref={containerRef}
      className="relative flex h-screen w-full flex-col items-center justify-center p-4 overflow-hidden select-none bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950"
      onClick={() => initAudio()} // Initialize context on body tap
    >
      {/* Floating Canvas Hearts & Sparkles */}
      <HeartBackground />

      {/* Floating Mute Button */}
      <button
        onClick={handleMuteToggle}
        className="fixed top-6 right-6 z-40 p-3 rounded-full border border-pink-200/20 bg-white/40 dark:bg-neutral-800/40 backdrop-blur-md shadow-lg transition-all hover:scale-110 active:scale-95 text-pink-500 cursor-pointer"
        aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        {isMuted ? <VolumeX size={20} className="stroke-[2.5]" /> : <Volume2 size={20} className="stroke-[2.5] animate-pulse" />}
      </button>

      {/* Primary Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="glass-panel z-10 w-full max-w-lg rounded-3xl p-8 text-center flex flex-col items-center relative"
      >
        {/* Glowing floating decorative icons */}
        <div className="absolute -top-10 text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-float-slow">
          <Heart size={54} fill="currentColor" />
        </div>

        {/* Pulse Heart Indicator */}
        <div className="mb-4 mt-4 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]"
          >
            <Heart size={44} fill="currentColor" />
          </motion.div>
        </div>

        {/* Will You Be Mine Title */}
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 dark:from-pink-300 dark:via-rose-300 dark:to-purple-300 leading-tight mb-3 drop-shadow-sm px-2">
          Will you be mine forever? 😍
        </h1>

        {/* Pleading Narrative Message */}
        <p className="text-sm md:text-base text-rose-600/80 dark:text-pink-300/80 font-medium tracking-wide mb-8 min-h-[24px]">
          {getPleadingMessage()}
        </p>

        {/* Interactive Buttons Container */}
        <div className="relative flex items-center justify-center w-full min-h-[80px] mt-2">
          {/* YES Button - Center Fixed */}
          <motion.button
            ref={yesButtonRef}
            onClick={handleYesClick}
            style={{ scale: yesScale }}
            className="animate-glow-pulse relative z-10 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold text-lg shadow-lg hover:brightness-105 active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-2"
          >
            <Heart size={20} fill="currentColor" className="animate-pulse" />
            ❤️ YES
          </motion.button>

          {/* Inline NO Button - Positioned absolutely to the right of YES, unmounted when floating */}
          {!isNoFloating && (
            <div className="absolute left-[calc(50%+110px)] -translate-x-1/2">
              <motion.button
                ref={noButtonRef}
                style={{
                  scale: noScale,
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  escapeNoButton(e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  escapeNoButton(touch.clientX, touch.clientY);
                }}
                className="px-8 py-3.5 rounded-full border-2 border-rose-500/80 bg-white/90 dark:bg-neutral-800/90 dark:border-rose-500/80 backdrop-blur-sm text-rose-500 dark:text-rose-400 font-bold text-lg shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse cursor-pointer hover:bg-white active:scale-90 flex items-center gap-2 whitespace-nowrap"
              >
                💔 NO
              </motion.button>
            </div>
          )}
        </div>

        {/* Escape attempt stat display */}
        {escapeCount > 0 && (
          <div className="mt-8 text-xs text-rose-500/50 dark:text-pink-400/40 font-bold uppercase tracking-widest animate-fade-in">
            Escapes: {escapeCount}
          </div>
        )}
      </motion.div>

      {/* Floating NO Button - Rendered at root level with spring GPU transforms */}
      {isNoFloating && (
        <motion.button
          ref={floatingNoButtonRef}
          animate={{ x: noPos.x, y: noPos.y }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            scale: noScale,
            zIndex: 50,
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            escapeNoButton(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            escapeNoButton(touch.clientX, touch.clientY);
          }}
          className="px-8 py-3.5 rounded-full border-2 border-rose-500/85 bg-white/90 dark:bg-neutral-800/90 dark:border-rose-500/85 backdrop-blur-sm text-rose-600 dark:text-rose-400 font-bold text-lg shadow-[0_0_15px_rgba(244,63,94,0.65)] animate-pulse cursor-pointer hover:bg-white active:scale-90 flex items-center gap-2 whitespace-nowrap"
        >
          💔 NO
        </motion.button>
      )}

      {/* Floating reactions portal */}
      <AnimatePresence>
        {reactions.map((react) => (
          <div
            key={react.id}
            style={{ 
              position: "fixed", 
              left: react.x, 
              top: react.y, 
              transform: "translate(-50%, -50%)", 
              zIndex: 30,
              pointerEvents: "none"
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1.15, 
                x: react.tx, 
                y: react.ty 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.7, 
                x: react.tx * 1.35, 
                y: react.ty * 1.35 
              }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-neutral-900/95 text-sm font-bold shadow-md border border-pink-100/30 text-rose-600 select-none whitespace-nowrap"
            >
              {react.text}
            </motion.div>
          </div>
        ))}
      </AnimatePresence>

      {/* Success Reveal Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

      {/* Footer Credits */}
      <footer className="absolute bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-1.5 text-[11px] md:text-xs font-semibold tracking-wider uppercase text-rose-500/80 dark:text-pink-300/60 select-none">
        <span>Designed & Developed by</span>
        <a
          href="https://nabeelsdevhub.com"
          target="_blank"
          rel="noopener noreferrer"
          className="relative text-rose-600 dark:text-pink-300 transition-colors duration-200 hover:text-rose-700 dark:hover:text-pink-100 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-full after:h-[1.5px] after:bg-current after:origin-right after:scale-x-0 hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300"
        >
          Nabeel Choudhuri
        </a>
      </footer>
    </main>
  );
}
