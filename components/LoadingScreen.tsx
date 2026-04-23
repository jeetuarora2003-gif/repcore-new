"use client";

import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#0D0D14] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Center Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#6366F1] flex items-center justify-center shadow-lg shadow-[#6366F1]/20">
            <Dumbbell size={24} className="text-white" />
          </div>
          <span className="text-4xl font-extrabold tracking-tighter">
            <span className="text-[#6366F1]">Rep</span>
            <span className="text-white">Core</span>
          </span>
        </div>

        {/* 3 Animated Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
              className="w-1.5 h-1.5 rounded-full bg-[#6366F1]"
            />
          ))}
        </div>
      </motion.div>

      {/* Google-style Bottom Loading Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-0.5 bg-white/5">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-full w-full bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#6366F1]"
        />
      </div>
    </motion.div>
  );
}
