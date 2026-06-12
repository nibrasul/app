"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/portfolio/animationVariants";

interface ProfilePhotoProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProfilePhoto({ src, alt, className = "" }: ProfilePhotoProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className={`relative overflow-hidden rounded-2xl shadow-xl shadow-slate-200/50 ${className}`}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
      />
      {/* Subtle inner border to keep it crisp */}
      <div className="absolute inset-0 rounded-2xl border border-black/5 pointer-events-none" />
    </motion.div>
  );
}
