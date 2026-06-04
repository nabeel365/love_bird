"use client";

import React, { useEffect, useRef } from "react";

interface Heart {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swayOffset: number;
  swaySpeed: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  color: string;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  fadeSpeed: number;
  glowColor: string;
}

export default function HeartBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // List of colors tailored to the romantic palette
    const colors = [
      "rgba(255, 75, 110, 0.8)",  // Radiant pink
      "rgba(255, 105, 180, 0.7)", // Hot pink
      "rgba(220, 20, 60, 0.8)",   // Crimson
      "rgba(147, 112, 219, 0.6)", // Medium purple
      "rgba(255, 182, 193, 0.7)", // Light pink
      "rgba(255, 240, 245, 0.6)", // Lavender blush
      "rgba(250, 128, 114, 0.7)", // Salmon
    ];

    const sparkleColors = ["#fff6e0", "#ffd3b6", "#ffaaa5", "#e8dbfc"];

    const hearts: Heart[] = [];
    const sparkles: Sparkle[] = [];

    // Scale particle count based on screen width for mobile performance
    const maxHearts = width < 768 ? 20 : 50;
    const maxSparkles = width < 768 ? 15 : 35;

    // Helper to draw a heart using Bezier curves centered at (0, 0)
    const drawHeart = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      alpha: number,
      color: string
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rotation);
      c.scale(size / 30, size / 30); // Normalize scale around a 30px boundary
      c.beginPath();
      
      // Top center
      c.moveTo(0, -6);
      // Left curve
      c.bezierCurveTo(-6, -12, -15, -12, -15, -3);
      c.bezierCurveTo(-15, 5, -8, 12, 0, 18);
      // Right curve
      c.bezierCurveTo(8, 12, 15, 5, 15, -3);
      c.bezierCurveTo(15, -12, 6, -12, 0, -6);
      
      c.closePath();
      c.fillStyle = color;
      c.globalAlpha = alpha;
      
      // Heart glow
      c.shadowColor = color;
      c.shadowBlur = 8;
      
      c.fill();
      c.restore();
    };

    // Helper to draw a 4-pointed sparkle star
    const drawSparkle = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      alpha: number,
      color: string
    ) => {
      c.save();
      c.translate(x, y);
      c.beginPath();
      for (let i = 0; i < 4; i++) {
        c.rotate(Math.PI / 2);
        c.lineTo(0, size);
        c.lineTo(size * 0.2, size * 0.2);
      }
      c.closePath();
      c.fillStyle = color;
      c.globalAlpha = alpha;
      c.shadowColor = color;
      c.shadowBlur = 10;
      c.fill();
      c.restore();
    };

    const createHeart = (atBottom = false): Heart => {
      return {
        x: Math.random() * width,
        y: atBottom ? height + 30 : Math.random() * height,
        size: Math.random() * 18 + 12, // size between 12px and 30px
        speedY: -(Math.random() * 0.8 + 0.4), // upward speed
        speedX: Math.random() * 0.3 - 0.15,
        swayOffset: Math.random() * 100,
        swaySpeed: Math.random() * 0.02 + 0.005,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: Math.random() * 0.01 - 0.005,
        alpha: Math.random() * 0.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    const createSparkle = (): Sparkle => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 5 + 3,
        alpha: Math.random() * 0.6 + 0.2,
        fadeSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        glowColor: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
      };
    };

    // Populate initial particles
    for (let i = 0; i < maxHearts; i++) {
      hearts.push(createHeart(false));
    }
    for (let i = 0; i < maxSparkles; i++) {
      sparkles.push(createSparkle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & Update Sparkles
      for (let i = 0; i < sparkles.length; i++) {
        const s = sparkles[i];
        s.alpha += s.fadeSpeed;
        if (s.alpha >= 0.8) {
          s.alpha = 0.8;
          s.fadeSpeed = -Math.abs(s.fadeSpeed);
        } else if (s.alpha <= 0.1) {
          // Relocate sparkle once it fades out
          s.x = Math.random() * width;
          s.y = Math.random() * height;
          s.alpha = 0.1;
          s.fadeSpeed = Math.abs(s.fadeSpeed);
        }
        drawSparkle(ctx, s.x, s.y, s.size, s.alpha, s.glowColor);
      }

      // Render & Update Hearts
      for (let i = 0; i < hearts.length; i++) {
        const h = hearts[i];
        h.y += h.speedY;
        
        // Apply horizontal sway based on sine wave
        h.swayOffset += h.swaySpeed;
        const sway = Math.sin(h.swayOffset) * 0.4;
        h.x += h.speedX + sway;
        
        // Spin heart slowly
        h.rotation += h.rotSpeed;

        // Reset if heart floats off screen top or side
        if (h.y < -30 || h.x < -30 || h.x > width + 30) {
          hearts[i] = createHeart(true);
        }

        drawHeart(ctx, h.x, h.y, h.size, h.rotation, h.alpha, h.color);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      // Re-scale counts
      const newMaxHearts = width < 768 ? 20 : 50;
      const newMaxSparkles = width < 768 ? 15 : 35;

      while (hearts.length > newMaxHearts) hearts.pop();
      while (hearts.length < newMaxHearts) hearts.push(createHeart(true));
      
      while (sparkles.length > newMaxSparkles) sparkles.pop();
      while (sparkles.length < newMaxSparkles) sparkles.push(createSparkle());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 block h-full w-full"
    />
  );
}
