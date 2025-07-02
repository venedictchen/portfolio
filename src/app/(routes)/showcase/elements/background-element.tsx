import { motion } from "framer-motion";

export default function BackgroundElements() {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
      <motion.div
        className="absolute top-10 left-10 w-40 h-40 rounded-full bg-[#F9A826] blur-3xl"
        animate={{
          x: [0, 20, -10, 5, 0],
          y: [0, -15, 10, -5, 0],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: [0.42, 0, 0.58, 1],
        }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#F9A826] blur-3xl"
        animate={{
          x: [0, -20, 15, -5, 0],
          y: [0, 15, -10, 5, 0],
        }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: [0.42, 0, 0.58, 1],
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-[#F9A826] blur-3xl"
        animate={{
          x: [0, 30, -20, 10, 0],
          y: [0, -20, 30, -10, 0],
          scale: [1, 1.1, 0.9, 1.05, 1],
          opacity: [0.2, 0.4, 0.3, 0.35, 0.2],
        }}
        transition={{
          delay: 1,
          duration: 22,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: [0.42, 0, 0.58, 1],
        }}
      />
    </div>
  );
}
