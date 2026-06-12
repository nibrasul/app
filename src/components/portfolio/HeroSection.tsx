"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Smooth out mouse tracking for parallax
  const smoothMouseX = useSpring(0, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position between -1 and 1
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;
      smoothMouseX.set(normalizedX);
      smoothMouseY.set(normalizedY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [smoothMouseX, smoothMouseY]);

  // Cinematic fading and zooming on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const yOffset = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // Mouse parallax physics
  const textParallaxX = useTransform(smoothMouseX, [-1, 1], [-20, 20]);
  const textParallaxY = useTransform(smoothMouseY, [-1, 1], [-20, 20]);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]"
    >
      {/* Subtle Studio Lighting - Radial Gradient */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle at center, rgba(37, 99, 235, 0.08) 0%, rgba(10, 10, 10, 1) 70%)"
        }}
      />

      {/* Cinematic Film Grain Overlay (Ensuring strong presence here) */}
      <div className="absolute inset-0 z-[1] opacity-30 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      {/* Main Title Sequence Content */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center text-center space-y-8"
        style={{ opacity, scale, y: yOffset, x: textParallaxX }}
      >
        <motion.div
          initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 px-4"
        >
          <span className="block text-[10px] md:text-xs font-inter tracking-[0.4em] text-[#8A8A8A] uppercase">
            A Portfolio By
          </span>
          <h1 className="text-[clamp(3rem,10vw,8rem)] font-space-grotesk font-black tracking-tighter text-[#F5F5F5] leading-[0.95]">
            Mohammed
            <br />
            Nibrasul Haqq
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="pt-8"
        >
          <div className="w-[1px] h-24 bg-gradient-to-b from-[#8A8A8A]/50 to-transparent mx-auto" />
        </motion.div>
      </motion.div>
    </section>
  );
}