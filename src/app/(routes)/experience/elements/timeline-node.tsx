"use client";

import { motion } from "framer-motion";
import { getTypeColor } from "../constant";
import { nodeVariants } from "../animations";
import { TimelineNodeProps } from "../types";
import Image from "next/image";

export default function TimelineNode({
  type,
  icon,
  isInView,
}: Readonly<TimelineNodeProps>) {
  const colors = getTypeColor(type);

  return (
    <motion.div
      className="absolute left-8 transform -translate-x-1/2 z-20"
      variants={nodeVariants}
    >
       <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.from} ${colors.to}`}
        animate={{
          scale: isInView ? [1, 1.5, 1] : 1,
          opacity: isInView ? [0.4, 0, 0.4] : 0,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={`w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} p-1 relative`}
        whileHover={{ scale: 1.2, rotate: 360, transition: { duration: 0.3 } }}
      >
        <div className="w-full h-full rounded-full bg-[#471b1c] flex items-center justify-center relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: isInView ? "100%" : "-100%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          <Image
            src={icon}
            alt="icon"
            fill
            className="object-cover rounded-full z-10 bg-white"
          />
        </div>
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-[#fda237] rounded-full"
          animate={{
            scale: isInView ? [1, 1.5, 1] : 0,
            opacity: isInView ? [0.5, 1, 0.5] : 0,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
}
