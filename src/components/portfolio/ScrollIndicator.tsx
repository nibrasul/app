"use client";

import { motion } from "framer-motion";

export default function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3, duration: 1 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
    >
      <span className="text-[9px] font-inter tracking-[0.3em] text-slate-400 uppercase">
        Scroll
      </span>
      <div className="w-[1px] h-10 relative overflow-hidden bg-slate-200">
        <motion.div
          className="absolute top-0 left-0 w-full bg-slate-500"
          initial={{ height: "0%", top: "0%" }}
          animate={{
            height: ["0%", "50%", "0%"],
            top: ["0%", "50%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
}
