"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Heart, Sparkles } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reset error state on open
  useEffect(() => {
    if (isOpen) {
      setVideoError(false);
    }
  }, [isOpen]);

  const handleVideoError = () => {
    console.warn("Video failed to play/load. Showing romantic greeting card fallback.");
    setVideoError(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-pink-200/20 bg-neutral-900/80 backdrop-blur-xl p-1.5 shadow-2xl shadow-rose-500/20"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 p-2 rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Content Container */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-black">
              {!videoError ? (
                <video
                  ref={videoRef}
                  src="/smooch.mp4"
                  autoPlay
                  playsInline
                  loop
                  muted={isMuted}
                  onError={handleVideoError}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Fallback Greeting Card */
                <div className="w-full h-full bg-gradient-to-tr from-purple-950/60 via-pink-950/50 to-red-950/60 flex flex-col items-center justify-center p-6 md:p-8 text-center relative select-none">
                  {/* Glowing Animated Orbs */}
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-rose-500/10 blur-3xl pointer-events-none animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl pointer-events-none animate-pulse duration-3000" />

                  {/* Decorative Elements */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                      animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-8 left-8 text-pink-400"
                    >
                      <Heart size={24} fill="currentColor" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, 12, 0], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                      className="absolute bottom-8 right-8 text-rose-400"
                    >
                      <Heart size={32} fill="currentColor" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [0.9, 1.25, 0.9], rotate: [0, 90, 180] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-1/3 right-10 text-amber-200"
                    >
                      <Sparkles size={18} />
                    </motion.div>
                  </div>

                  {/* Pulsing Central Heart */}
                  <motion.div
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                    className="text-red-500 mb-3 md:mb-5 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                  >
                    <Heart size={84} fill="currentColor" />
                  </motion.div>

                  {/* Main Success Title */}
                  <motion.h2
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 15, delay: 0.15 }}
                    className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-100 to-rose-200 mb-2 md:mb-3 font-sans tracking-wide drop-shadow"
                  >
                    Yay! You said YES! 💖
                  </motion.h2>

                  {/* Romantic Letter Details */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.9, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-rose-100/90 max-w-md text-sm md:text-base leading-relaxed font-sans px-2"
                  >
                    My heart is racing! You have made me the absolute happiest person in the universe. I promise to cherish, love, and annoy you for the rest of our days! 🥰
                  </motion.p>

                  {/* Cute bottom tag */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 px-5 py-1.5 rounded-full border border-pink-400/20 bg-pink-500/10 text-[10px] md:text-xs font-bold tracking-widest text-pink-300 uppercase backdrop-blur-md"
                  >
                    Bound Together Forever 💍
                  </motion.div>
                </div>
              )}

              {/* Mute button overlay for active video */}
              {!videoError && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-4 left-4 z-20 p-2 rounded-full bg-black/50 text-white/80 transition-all hover:bg-black/70 hover:text-white cursor-pointer"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
