"use client";

import { motion, useInView } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { getTypeColor } from "../constant";
import { ExperienceCardProps } from "../types";
import { responsibilityVariants } from "../animations";
import { useRef } from "react";

export default function ExperienceCard({ experience, index }: ExperienceCardProps) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: false, margin: "-100px" });
  const colors = getTypeColor(experience.type);

  return (
    <motion.div 
      ref={cardRef}
      className="w-full pl-24 md:pl-28 lg:pl-32 max-w-full"
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
      transition={{ 
        duration: 0.6,
        delay: index * 0.2,
        ease: "easeOut"
      }}
    >
      <motion.div
        className="bg-gradient-to-br from-[#5a130f]/90 to-[#471b1c]/95 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-[#fda237]/20 shadow-xl shadow-black/20 relative overflow-hidden"
        whileHover={{ 
          y: -5,
          transition: { duration: 0.2 }
        }}
      >
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
            <motion.h3
              className="text-lg md:text-xl font-bold text-white leading-tight pr-2"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: index * 0.2 + 0.1 }}
            >
              {experience.position}
            </motion.h3>
            <motion.span
              className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${colors.from} ${colors.to} text-white self-start flex-shrink-0`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.2 + 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              {experience.type}
            </motion.span>
          </div>
          
          <motion.h4
            className={`text-base md:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r ${colors.from} ${colors.to} mb-2`}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: index * 0.2 + 0.2 }}
          >
            {experience.company}
          </motion.h4>
          
          <motion.div
            className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-white/70 text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
          >
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="text-xs md:text-sm">{experience.duration}</span>
            </div>
            {experience.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="text-xs md:text-sm">{experience.location}</span>
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-3 md:mt-4 space-y-2 md:space-y-3 relative z-10">
          {experience.responsibilities.map((responsibility, respIndex) => (
            <motion.div
              key={responsibility}
              className="flex items-start gap-2 md:gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ 
                duration: 0.4,
                delay: index * 0.2 + 0.4 + respIndex * 0.1
              }}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
            >
              <div
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} mt-1.5 md:mt-2 flex-shrink-0`}
              />
              <p className="text-white/90 text-xs md:text-sm leading-relaxed">
                {responsibility}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
