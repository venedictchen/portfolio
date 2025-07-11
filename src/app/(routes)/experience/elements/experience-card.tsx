"use client";

import { motion, useInView } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { getTypeColor } from "../constant";
import { ExperienceCardProps } from "../types";
import { useRef, useMemo } from "react";

export default function ExperienceCard({ experience, index }: ExperienceCardProps) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  const colors = useMemo(() => getTypeColor(experience.type), [experience.type]);

  return (
    <motion.div
      ref={cardRef}
      className="w-full pl-24 md:pl-28 lg:pl-32 max-w-full will-change-transform"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
    >
      <div
        className="bg-gradient-to-br from-[#5a130f]/90 to-[#471b1c]/95 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-[#fda237]/20 shadow-xl shadow-black/20 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
            <h3 className="text-lg md:text-xl font-bold text-white leading-tight pr-2">
              {experience.position}
            </h3>
            <span
              className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${colors.from} ${colors.to} text-white self-start flex-shrink-0`}
            >
              {experience.type}
            </span>
          </div>

          <h4
            className={`text-base md:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r ${colors.from} ${colors.to} mb-2`}
          >
            {experience.company}
          </h4>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-white/70 text-sm">
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
          </div>
        </div>

        <div className="mt-3 md:mt-4 space-y-2 md:space-y-3 relative z-10">
          {experience.responsibilities.map((responsibility) => (
            <div
              key={responsibility}
              className="flex items-start gap-2 md:gap-3"
            >
              <div
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} mt-1.5 md:mt-2 flex-shrink-0`}
              />
              <p className="text-white/90 text-xs md:text-sm leading-relaxed">
                {responsibility}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
