"use client";

import HeroSection from "@/components/portfolio/HeroSection";
import PhilosophySection from "@/components/portfolio/PhilosophySection";
import AboutSection from "@/components/portfolio/AboutSection";
import ExperienceSection from "@/components/portfolio/ExperienceSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import ContactSection from "@/components/portfolio/ContactSection";
import BreathingSpaceSection from "@/components/portfolio/BreathingSpaceSection";

export default function Page() {
  return (
    <main className="relative w-full bg-[#0A0A0A] overflow-x-hidden">
      
      {/* Overlap Group 1: Hero -> Philosophy -> About */}
      <div className="relative w-full">
        <div className="sticky top-0 z-0">
          <HeroSection />
        </div>
        <div className="relative z-10 bg-[#0A0A0A]">
          <div className="sticky top-0 z-10">
            <PhilosophySection />
          </div>
          <div className="relative z-20 bg-[#0A0A0A]">
            <AboutSection />
          </div>
        </div>
      </div>

      {/* Normal Flow */}
      <div className="relative z-30 bg-[#0A0A0A]">
        <ExperienceSection />
        <BreathingSpaceSection />
      </div>

      {/* Overlap Group 2: Projects -> Contact */}
      <div className="relative w-full z-40 bg-[#0A0A0A]">
        <div className="sticky top-0 z-40">
          <ProjectsSection />
        </div>
        <div className="relative z-50 bg-[#0A0A0A]">
          <ContactSection />
        </div>
      </div>

    </main>
  );
}
