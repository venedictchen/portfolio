"use client";

import { motion } from "framer-motion";
import { getTypeColor } from "../constant";
import { nodeVariants } from "../animations";
import { TimelineNodeProps } from "../types";
import Image from "next/image";

export default function TimelineNode({ type, icon, index }: { type: string; icon: string; index: number }) {
  const colors = getTypeColor(type);
  
  return (
    <motion.div
      className="absolute left-8 transform -translate-x-1/2 z-20"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.2,
        ease: "easeOut"
      }}
    >
      <motion.div
        className={`w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} p-1 relative`}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-full h-full rounded-full bg-[#471b1c] flex items-center justify-center relative overflow-hidden">
          <Image
            src={icon}
            alt="Company logo"
            width={48}
            height={48}
            className="object-cover rounded-full bg-white"
            loading="lazy"
          />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#fda237] rounded-full opacity-80" />
      </motion.div>
    </motion.div>
  );
}
