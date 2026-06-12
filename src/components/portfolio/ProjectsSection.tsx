"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Project {
  id: string;
  name: string;
  role: string;
  problem: string;
  built: string;
  outcome: string;
  tags: string[];
}

const projects: Project[] = [
  {
    id: "01",
    name: "Tapfolio",
    role: "Founder & Lead Developer",
    problem: "Professionals struggle to build meaningful, memorable connections in a cluttered physical networking environment.",
    built: "An intelligent, digital-first networking ecosystem bridging physical NFC contact cards directly to context-aware web profiles.",
    outcome: "Increased profile interaction, automated handshake protocols, and vastly improved post-meeting discovery.",
    tags: ["AI", "NFC Hardware", "Mobile"],
  },
  {
    id: "02",
    name: "JARVIS",
    role: "AI Orchestrator",
    problem: "Developers lose countless hours to repetitive server maintenance, log management, and database backups.",
    built: "An automated, voice-driven shell assistant companion that hooks directly into deep system architectures.",
    outcome: "Reduced manual server maintenance time by 80% and created a seamless verbal trigger environment.",
    tags: ["Voice AI", "Automation", "Node.js"],
  },
  {
    id: "03",
    name: "Builder Suite",
    role: "Full-Stack Creator",
    problem: "Local communities lacked centralized, reliable tools for daily utility coordination like transit and service booking.",
    built: "A comprehensive suite of practical software utilities including a Bus Route Platform, Hostel Finder, and Secure Share.",
    outcome: "Unified scattered community services into a single, cohesive, and highly adopted platform.",
    tags: ["Utilities", "APIs", "Community"],
  },
];

function ProjectChapter({ project }: { project: Project }) {
  const chapterRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start end", "end start"],
  });

  // Cinematic Parallax & Fade
  const y = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.05]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div 
      ref={chapterRef}
      className="relative w-full min-h-screen flex items-center justify-center py-20 overflow-hidden bg-[#0A0A0A]"
    >
      <motion.div 
        style={{ opacity }}
        className="w-full max-w-[1600px] mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10"
      >
        {/* Left: Huge Visual */}
        <div className="lg:col-span-7 relative aspect-[4/3] w-full overflow-hidden group">
          <motion.div 
            style={{ y, scale: imageScale }}
            className="absolute inset-0 bg-[#111111] border border-[#F5F5F5]/10 flex items-center justify-center"
          >
            {/* Very subtle image drift on hover handled by CSS group-hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0A] to-transparent opacity-60 z-10" />
            <div className="text-[#8A8A8A] font-inter text-sm tracking-widest uppercase relative z-20 transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
              [ Visual Placeholder for {project.name} ]
            </div>
          </motion.div>
        </div>

        {/* Right: Storytelling Content */}
        <div className="lg:col-span-5 space-y-12 md:space-y-16 mt-10 lg:mt-0">
          
          <div className="space-y-4">
            <span className="text-xl md:text-2xl font-space-grotesk font-light text-[#8A8A8A]">
              {project.id}
            </span>
            <h3 className="text-5xl md:text-7xl lg:text-8xl font-black font-space-grotesk text-[#F5F5F5] tracking-tighter leading-none">
              {project.name}
            </h3>
          </div>

          <div className="space-y-10">
            {/* The Problem */}
            <div className="space-y-3">
              <span className="text-[10px] font-inter tracking-[0.3em] uppercase text-[#8A8A8A] font-bold">
                The Problem
              </span>
              <p className="text-base md:text-lg font-inter text-[#F5F5F5] leading-relaxed">
                {project.problem}
              </p>
            </div>

            {/* What We Built */}
            <div className="space-y-3">
              <span className="text-[10px] font-inter tracking-[0.3em] uppercase text-[#8A8A8A] font-bold">
                What We Built
              </span>
              <p className="text-base md:text-lg font-inter text-[#F5F5F5] leading-relaxed">
                {project.built}
              </p>
            </div>

            {/* The Outcome */}
            <div className="space-y-3">
              <span className="text-[10px] font-inter tracking-[0.3em] uppercase text-[#8A8A8A] font-bold">
                The Outcome
              </span>
              <p className="text-base md:text-lg font-inter text-[#2563EB] font-medium leading-relaxed">
                {project.outcome}
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col items-start gap-8 border-t border-[#F5F5F5]/10">
            <a 
              href="#"
              className="inline-flex items-center gap-4 text-sm font-inter tracking-widest uppercase text-[#F5F5F5] font-semibold group/link pt-8"
            >
              Visit Project 
              <span className="transform group-hover/link:translate-x-2 group-hover/link:-translate-y-2 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                ↗
              </span>
            </a>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

export default function ProjectsSection() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Slowly move the huge signature background text
  const bgX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section 
      id="projects" 
      ref={containerRef}
      className="relative w-full bg-[#0A0A0A] flex flex-col overflow-hidden"
    >
      {/* Signature Moment: NIBRAS Texture */}
      <motion.div 
        style={{ x: bgX }}
        className="absolute top-1/2 -translate-y-1/2 left-0 whitespace-nowrap opacity-[0.02] pointer-events-none z-0 select-none"
      >
        <span className="text-[25vw] font-black font-space-grotesk tracking-tighter text-[#F5F5F5]">
          NIBRAS NIBRAS NIBRAS
        </span>
      </motion.div>

      <div className="relative z-10 w-full">
        {projects.map((project) => (
          <ProjectChapter key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}