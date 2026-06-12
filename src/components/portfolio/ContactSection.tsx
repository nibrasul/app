"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const socialLinks = [
  { label: "Email", href: "mailto:hello@nibras.dev" },
  { label: "LinkedIn", href: "https://linkedin.com/in/nibrasulhaqq" },
  { label: "GitHub", href: "https://github.com/nibrasulhaqq" },
];

export default function ContactSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Cinematic fade from dark to light
  const backgroundColor = useTransform(scrollYProgress, [0, 0.4], ["#0A0A0A", "#FFFFFF"]);
  const textColor = useTransform(scrollYProgress, [0, 0.4], ["#F5F5F5", "#0A0A0A"]);
  const mutedTextColor = useTransform(scrollYProgress, [0, 0.4], ["#8A8A8A", "#8A8A8A"]);
  
  const yOffset = useTransform(scrollYProgress, [0.2, 0.6], [50, 0]);
  const opacity = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);

  return (
    <motion.section
      id="contact"
      ref={containerRef}
      style={{ backgroundColor, color: textColor }}
      className="relative w-full min-h-screen flex flex-col justify-between py-16 md:py-24 px-6 md:px-16 overflow-hidden"
    >
      {/* Top: Full Name Returns */}
      <motion.div 
        style={{ color: textColor }}
        className="w-full max-w-7xl mx-auto flex justify-center md:justify-start"
      >
        <span className="text-xs md:text-sm font-inter tracking-[0.4em] uppercase font-semibold">
          MOHAMMED NIBRASUL HAQQ
        </span>
      </motion.div>

      {/* Middle: Cinematic Question & Links */}
      <motion.div 
        style={{ opacity, y: yOffset }}
        className="flex-grow flex flex-col items-center justify-center max-w-5xl mx-auto text-center space-y-24 w-full"
      >
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-space-grotesk font-medium tracking-tighter leading-[1.05]">
          Ready to build something <br className="hidden md:block" />
          <motion.span style={{ color: mutedTextColor }}>people remember?</motion.span>
        </h2>

        {/* Enormous Spaced Links */}
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-32 pt-12">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group relative text-lg md:text-xl font-inter tracking-[0.2em] uppercase font-medium overflow-hidden pb-2"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            </a>
          ))}
        </div>
      </motion.div>

      {/* Bottom: Signature / Copyright */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-inter tracking-widest uppercase">
        <motion.span style={{ color: mutedTextColor }}>
          © {new Date().getFullYear()}
        </motion.span>
        <motion.span style={{ color: mutedTextColor }}>
          Designed & Engineered with intent.
        </motion.span>
      </div>
      
    </motion.section>
  );
}