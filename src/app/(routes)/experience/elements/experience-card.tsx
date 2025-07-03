"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { getTypeColor } from "../constant";
import { ExperienceCardProps } from "../types";
import { responsibilityVariants } from "../animations";

export default function ExperienceCard({
  experience,
  index,
  isInView,
}: ExperienceCardProps) {
  const colors = getTypeColor(experience.type);

  return (
    <motion.div className="w-full pl-24 md:pl-28 lg:pl-32 max-w-full">
      <motion.div
        className="bg-gradient-to-br from-[#5a130f]/90 to-[#471b1c]/95 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-[#fda237]/20 shadow-xl shadow-black/20 relative overflow-hidden group"
        whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2 } }}
      >
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${colors.from} ${colors.to} opacity-0 group-hover:opacity-5`}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: isInView ? "100%" : "-100%" }}
          transition={{ duration: 2, delay: index * 0.2 }}
        />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
            <motion.h3
              variants={responsibilityVariants}
              className="text-lg md:text-xl font-bold text-white leading-tight pr-2"
            >
              {experience.position}
            </motion.h3>
            <motion.span
              variants={responsibilityVariants}
              className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${colors.from} ${colors.to} text-white self-start flex-shrink-0`}
              whileHover={{ scale: 1.05 }}
            >
              {experience.type}
            </motion.span>
          </div>
          <motion.h4
            variants={responsibilityVariants}
            className={`text-base md:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r ${colors.from} ${colors.to} mb-2`}
          >
            {experience.company}
          </motion.h4>
          <motion.div
            variants={responsibilityVariants}
            className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-white/70 text-sm"
          >
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />{" "}
              <span className="text-xs md:text-sm">{experience.duration}</span>
            </div>
            {experience.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />{" "}
                <span className="text-xs md:text-sm">
                  {experience.location}
                </span>
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-3 md:mt-4 space-y-2 md:space-y-3 relative z-10">
          {experience.responsibilities.map((responsibility, respIndex) => (
            <motion.div
              key={responsibility}
              className="flex items-start gap-2 md:gap-3"
              variants={responsibilityVariants}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
            >
              <motion.div
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} mt-1.5 md:mt-2 flex-shrink-0`}
                animate={{
                  scale: isInView ? [1, 1.2, 1] : 1,
                  opacity: isInView ? [0.7, 1, 0.7] : 0.7,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: respIndex * 0.2,
                }}
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
