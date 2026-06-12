"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function PhilosophySection() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Slow, cinematic reveal physics
  const words = [
    "Most", "websites", "are", "built.", 
    "Some", "are", "crafted.", 
    "A", "few", "are", "remembered."
  ];

  return (
    <section 
      ref={containerRef}
      className="w-full min-h-screen flex items-center justify-center bg-[#0A0A0A] px-6 md:px-16"
    >
      <div className="max-w-6xl w-full mx-auto text-center">
        <h2 className="text-[clamp(3rem,8vw,8rem)] leading-[1.1] tracking-[-0.04em] font-medium text-[#F5F5F5] flex flex-wrap justify-center gap-x-4 md:gap-x-8 gap-y-2">
          {words.map((word, index) => {
            // Calculate a staggered scroll range for each word
            const start = index * 0.05;
            const end = start + 0.1;
            
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const y = useTransform(scrollYProgress, [start, end], [20, 0]);

            return (
              <motion.span 
                key={index} 
                style={{ opacity, y }}
                className={word.includes(".") ? "text-[#8A8A8A] mr-4 md:mr-8" : ""}
              >
                {word}
              </motion.span>
            );
          })}
        </h2>
      </div>
    </section>
  );
}
