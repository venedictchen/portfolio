"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { EXPERIENCES } from "./constant";
import { titleVariants } from "./animations";
import TimelineNode from "./elements/timeline-node";
import ExperienceCard from "./elements/experience-card";

export default function ExperienceSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: false, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#471b1c] via-[#5a130f] to-[#7e0001] relative overflow-hidden min-h-screen"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-[#fda237] to-[#ab3a12] blur-xl opacity-10" />
        <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-gradient-to-r from-[#d37070] to-[#8b0000] blur-xl opacity-10" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          ref={titleRef}
          className="text-center mb-12 md:mb-20 px-4"
          initial={{ opacity: 0, y: -30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative">
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#F9A826] to-[#FFC56E] text-center leading-tight py-2"
              variants={titleVariants}
              initial="hidden"
              animate={titleInView ? "visible" : "hidden"}
            >
              Experience
            </motion.h2>
          </div>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <motion.div
            className="absolute left-8 w-1 bg-gradient-to-b from-[#fda237] to-[#fdc592] opacity-30"
            style={{ height: `${EXPERIENCES.length * 300}px` }}
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          />

          <div className="space-y-8 md:space-y-16">
            {EXPERIENCES.map((experience, index) => (
              <div key={experience.id} className="relative flex items-start">
                <TimelineNode
                  type={experience.type}
                  icon={experience.icon}
                  index={index}
                />
                <ExperienceCard experience={experience} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
