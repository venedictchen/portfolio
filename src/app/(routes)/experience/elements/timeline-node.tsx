"use client";

import { motion } from "framer-motion";
import { getTypeColor } from "../constant";
import { TimelineNodeProps } from "../types";
import Image from "next/image";
import { useMemo } from "react";

export default function TimelineNode({
  type,
  icon,
  isInView,
}: Readonly<TimelineNodeProps>) {
  const colors = getTypeColor(type);

  const pulseVariants = useMemo(
    () => ({
      hidden: { scale: 0, opacity: 0 },
      visible: { scale: 1, opacity: 1 },
    }),
    []
  );

  return (
    <motion.div
      className="absolute left-8 transform -translate-x-1/2 z-20"
      variants={pulseVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {isInView && (
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.from} ${colors.to}`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: 2,
            ease: "easeInOut",
          }}
        />
      )}

      <motion.div
        className={`w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} p-1 relative`}
        whileHover={{
          scale: 1.1,
          transition: { duration: 0.2 },
        }}
      >
        <div className="w-full h-full rounded-full bg-[#471b1c] flex items-center justify-center relative overflow-hidden">
          {isInView && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          )}

          <Image
            src={icon}
            alt={`${type} icon`}
            fill
            className="object-cover rounded-full z-10 bg-white"
            loading="lazy"
            sizes="(max-width: 768px) 40px, (max-width: 1024px) 48px, 64px"
          />
        </div>

        {isInView && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-[#fda237] rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
