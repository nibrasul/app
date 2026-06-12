"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

const navLinks = [
  { label: "About", id: "about" },
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "Contact", id: "contact" },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -80% 0px", // Trigger active state when section is near top
      }
    );

    navLinks.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavigate = (id: string) => {
    setIsOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, isOpen ? 400 : 0);
  };

  return (
    <>
      {/* Floating Pill Navigation for Desktop */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] hidden md:flex items-center gap-2 px-3 py-2 bg-[#111111]/70 backdrop-blur-md border border-[#F5F5F5]/10 rounded-full shadow-lg shadow-black/50"
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mr-2 px-3 text-[#F5F5F5] hover:text-white transition-colors"
          aria-label="Home"
        >
          <Logo className="w-5 h-5" />
        </button>
        {navLinks.map((link) => {
          const isActive = activeSection === link.id;
          return (
            <button
              key={link.id}
              onClick={() => handleNavigate(link.id)}
              className={`relative px-5 py-2.5 rounded-full text-[11px] font-inter tracking-[0.15em] uppercase transition-colors duration-300 ${
                isActive ? "text-[#0A0A0A]" : "text-[#8A8A8A] hover:text-[#F5F5F5]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-[#F5F5F5] rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </button>
          );
        })}
      </motion.header>

      {/* Mobile Top Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full z-[100] px-6 py-5 flex md:hidden items-center justify-between pointer-events-none mix-blend-difference"
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-[#F5F5F5] pointer-events-auto"
          aria-label="Home"
        >
          <Logo className="w-6 h-6" />
        </button>

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-8 h-8 flex flex-col items-center justify-center gap-[5px] group pointer-events-auto"
          aria-label="Toggle navigation menu"
        >
          <motion.span
            animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="block w-5 h-[2px] bg-[#F5F5F5] transition-colors origin-center"
          />
          <motion.span
            animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.2 }}
            className="block w-5 h-[2px] bg-[#F5F5F5] transition-colors"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="block w-5 h-[2px] bg-[#F5F5F5] transition-colors origin-center"
          />
        </button>
      </motion.header>

      {/* Full-screen overlay for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[99] bg-[#0A0A0A]/95 backdrop-blur-xl flex items-center justify-center md:hidden"
          >
            <nav className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={`mobile-${link.id}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <button
                    onClick={() => handleNavigate(link.id)}
                    className={`text-4xl font-space-grotesk font-bold tracking-wider transition-colors duration-300 uppercase ${
                      activeSection === link.id ? "text-[#F5F5F5]" : "text-[#8A8A8A]"
                    }`}
                  >
                    {link.label}
                  </button>
                </motion.div>
              ))}

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-[10px] font-inter tracking-[0.3em] text-[#8A8A8A] uppercase"
              >
                Mohammed Nibrasul Haqq
              </motion.p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
