"use client"

import { motion } from "framer-motion"

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Circles */}
      <motion.div
        className="absolute w-16 h-16 rounded-full bg-pastel-pink/20"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: "20%", left: "10%" }}
      />

      <motion.div
        className="absolute w-12 h-12 rounded-full bg-pastel-lavender/30"
        animate={{
          x: [0, -25, 0],
          y: [0, 15, 0],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        style={{ top: "60%", right: "15%" }}
      />

      <motion.div
        className="absolute w-8 h-8 rounded-full bg-pastel-mint/25"
        animate={{
          x: [0, 20, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{ top: "40%", left: "80%" }}
      />

      <motion.div
        className="absolute w-6 h-6 rounded-full bg-pastel-peach/20"
        animate={{
          x: [0, -15, 0],
          y: [0, 25, 0],
          rotate: [0, 90, 180],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        style={{ top: "80%", left: "20%" }}
      />
    </div>
  )
}