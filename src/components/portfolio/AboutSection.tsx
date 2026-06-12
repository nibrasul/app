"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function AboutSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Slow parallax for the roles
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [150, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [200, -150]);
  const y4 = useTransform(scrollYProgress, [0, 1], [250, -200]);

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative w-full min-h-[150vh] bg-[#0A0A0A] py-32 md:py-40 px-6 md:px-16 flex flex-col justify-center overflow-hidden"
    >
      <div className="max-w-[1400px] w-full mx-auto relative z-10">
        
        {/* Main Statement */}
        <div className="max-w-4xl space-y-12">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-space-grotesk font-medium text-[#F5F5F5] leading-tight"
          >
            I build products that <span className="text-[#8A8A8A]">connect people</span>, <span className="text-[#8A8A8A]">solve problems</span>, and create <span className="text-[#F5F5F5]">lasting experiences</span>.
          </motion.p>
        </div>

        {/* Scroll Revealed Roles */}
        <div className="mt-40 md:mt-64 relative w-full h-[60vh] flex flex-col items-end text-right pr-4 md:pr-16">
          <motion.div style={{ y: y1 }} className="absolute top-0 right-0">
            <span className="text-[clamp(3rem,8vw,10rem)] font-black tracking-tighter text-[#2563EB]/20 uppercase">
              Developer
            </span>
          </motion.div>
          <motion.div style={{ y: y2 }} className="absolute top-[20%] right-0">
            <span className="text-[clamp(3rem,8vw,10rem)] font-black tracking-tighter text-[#F5F5F5] uppercase mix-blend-difference">
              Designer
            </span>
          </motion.div>
          <motion.div style={{ y: y3 }} className="absolute top-[40%] right-0">
            <span className="text-[clamp(3rem,8vw,10rem)] font-black tracking-tighter text-[#8A8A8A] uppercase">
              Founder
            </span>
          </motion.div>
          <motion.div style={{ y: y4 }} className="absolute top-[60%] right-0">
            <span className="text-[clamp(3rem,8vw,10rem)] font-black tracking-tighter text-[#F5F5F5]/10 uppercase">
              Builder
            </span>
          </motion.div>
        </div>

      </div>
    </section>
  );
}