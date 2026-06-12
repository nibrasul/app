"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTransition from "./SectionTransition";

const services = [
  {
    id: "01",
    title: "Web Development",
    description: "Building responsive, highly-optimized web applications with modern architectures.",
    tech: ["React", "Next.js", "Node.js"]
  },
  {
    id: "02",
    title: "UI/UX Design",
    description: "Crafting seamless, engaging digital experiences with a focus on editorial aesthetics.",
    tech: ["Figma", "Framer Motion", "TailwindCSS"]
  },
  {
    id: "03",
    title: "AI Integration",
    description: "Integrating powerful cognitive models and developing autonomous agents for complex workflows.",
    tech: ["OpenAI API", "Python", "LangChain"]
  },
  {
    id: "04",
    title: "Product Strategy",
    description: "Connecting the dots between business goals, user needs, and technical feasibility.",
    tech: ["Market Research", "Prototyping", "Analytics"]
  }
];

export default function ServicesSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section
      id="services"
      className="relative w-full bg-[#FFFFFF] py-32 md:py-40 px-6 md:px-16"
    >
      <div className="max-w-[1400px] w-full mx-auto space-y-24">
        
        <SectionTransition direction="up">
          <span className="text-xs font-inter tracking-[0.2em] text-slate-400 uppercase font-bold">
            SERVICES
          </span>
        </SectionTransition>

        <div className="flex flex-col border-t border-black/10">
          {services.map((service, index) => {
            const isHovered = hoveredId === service.id;
            return (
              <motion.div
                key={service.id}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative border-b border-black/10 py-12 md:py-16 transition-colors duration-500 cursor-pointer overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16 relative z-10">
                  
                  {/* Number */}
                  <div className="flex-shrink-0 w-16">
                    <span className="text-xl font-space-grotesk font-bold text-slate-300">
                      {service.id}
                    </span>
                  </div>

                  {/* Content Area */}
                  <div className="flex-grow">
                    <motion.h3 
                      className="text-4xl md:text-6xl lg:text-7xl font-black text-[#0A0A0A] tracking-tighter"
                      animate={{ color: isHovered ? "#2563EB" : "#0A0A0A" }}
                      transition={{ duration: 0.4 }}
                    >
                      {service.title}
                    </motion.h3>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, filter: "blur(10px)" }}
                          animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                          exit={{ opacity: 0, height: 0, filter: "blur(10px)" }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="pt-8 overflow-hidden"
                        >
                          <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                            <p className="text-lg md:text-xl font-inter text-slate-600 max-w-xl leading-relaxed">
                              {service.description}
                            </p>
                            
                            <div className="space-y-4">
                              <span className="text-xs font-inter tracking-[0.2em] text-[#2563EB] uppercase font-bold">
                                Technologies
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {service.tech.map((t) => (
                                  <span key={t} className="px-4 py-2 border border-black/10 rounded-full text-xs font-inter text-slate-600 bg-white">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

                {/* Background hover effect */}
                <motion.div 
                  className="absolute inset-0 bg-slate-50 z-0 origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                />
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}