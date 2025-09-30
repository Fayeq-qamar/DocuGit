"use client"

import { motion } from "framer-motion"

export function GradientBlob() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full"
        style={{
          background: "linear-gradient(135deg, #FFE1E6 0%, #E6E6FA 50%, #E0F6FF 100%)",
          filter: "blur(40px)",
          opacity: 0.3,
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full"
        style={{
          background: "linear-gradient(135deg, #F0FFF0 0%, #FFE5B4 50%, #FFE4E1 100%)",
          filter: "blur(50px)",
          opacity: 0.25,
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 270, 180, 90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}