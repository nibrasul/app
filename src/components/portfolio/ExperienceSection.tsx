"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Experience {
  id: string;
  year: string;
  company: string;
  role: string;
  description: string;
}

const experiences: Experience[] = [
  {
    id: "exp-1",
    year: "2026",
    company: "Tapfolio",
    role: "Founder & Lead Developer",
    description: "Architecting an intelligent NFC-enabled professional identity linker bridging physical interactions with context-aware web profiles.",
  },
  {
    id: "exp-2",
    year: "2025",
    company: "JARVIS Initiative",
    role: "AI Integration",
    description: "Built automated voice-driven shell companions and automation pipelines managing databases and backend scripts seamlessly.",
  },
  {
    id: "exp-3",
    year: "2024",
    company: "LocalConnect",
    role: "Founder",
    description: "Created comprehensive community tools including transit organizers and secure data-sharing applications.",
  },
  {
    id: "exp-4",
    year: "2023",
    company: "Freelance",
    role: "Full-Stack Developer",
    description: "Delivered highly optimized, cinematic web applications for premium clients worldwide.",
  },
];

export default function ExperienceSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section
      id="experience"
      className="relative w-full bg-[#0A0A0A] py-32 md:py-40 px-6 md:px-16"
    >
      <div className="max-w-[1200px] w-full mx-auto">
        <div className="flex flex-col">
          {experiences.map((exp, index) => {
            const isHovered = hoveredId === exp.id;
            
            return (
              <motion.div
                key={exp.id}
                onMouseEnter={() => setHoveredId(exp.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative border-b border-[#F5F5F5]/10 py-12 md:py-20 cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.2, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex flex-col md:flex-row md:items-baseline gap-6 md:gap-16">
                  
                  {/* Year */}
                  <div className="w-32 flex-shrink-0">
                    <span className="text-xl md:text-2xl font-inter text-[#8A8A8A] font-light">
                      {exp.year}
                    </span>
                  </div>

                  {/* Company & Details */}
                  <div className="flex-grow">
                    <motion.h3 
                      className="text-4xl md:text-6xl lg:text-8xl font-space-grotesk font-bold text-[#F5F5F5] tracking-tighter"
                      animate={{ 
                        x: isHovered ? 20 : 0,
                        color: isHovered ? "#FFFFFF" : "#8A8A8A"
                      }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {exp.company}
                    </motion.h3>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                          exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-8 pb-4 space-y-4 max-w-2xl">
                            <span className="inline-block px-4 py-2 rounded-full border border-[#F5F5F5]/20 text-[#F5F5F5] text-xs uppercase tracking-widest">
                              {exp.role}
                            </span>
                            <p className="text-lg md:text-xl font-inter text-[#8A8A8A] leading-relaxed">
                              {exp.description}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}