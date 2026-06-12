"use client";

import MagneticButton from "./MagneticButton";

export default function FooterSection() {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full py-8 px-6 md:px-12 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[10px] font-inter tracking-[0.15em] text-slate-400 uppercase">
          &copy; 2026 Mohammed Nibrasul Haqq
        </p>
        <MagneticButton
          onClick={handleBackToTop}
          strength={0.2}
          className="text-[10px] font-inter tracking-[0.2em] text-slate-400 uppercase hover:text-slate-900 transition-colors duration-300"
        >
          Back to top ↑
        </MagneticButton>
      </div>
    </footer>
  );
}
