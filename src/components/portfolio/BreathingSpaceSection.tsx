"use client";

import { motion } from "framer-motion";
import SectionTransition from "./SectionTransition";

export default function BreathingSpaceSection() {
  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-[#0A0A0A] px-6 md:px-16">
      <div className="max-w-4xl w-full mx-auto text-center space-y-12">
        
        <SectionTransition direction="up">
          <span className="text-xs font-inter tracking-[0.4em] text-[#8A8A8A] uppercase">
            Selected Work
          </span>
        </SectionTransition>

        <SectionTransition direction="up" delay={0.1}>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-space-grotesk font-medium text-[#F5F5F5] leading-[1.1] tracking-tight">
            Not every project <br className="hidden md:block" />
            <span className="text-[#8A8A8A]">deserves attention.</span>
            <br />
            These do.
          </h2>
        </SectionTransition>

      </div>
    </section>
  );
}
