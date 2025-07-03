"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { EXPERIENCES } from "./constant";
import TimelineItem from "./elements/timeline-item";
import { titleVariants } from "./animations";

export default function ExperienceSection() {
  const sectionRef = useRef(null);
  const isSectionInView = useInView(sectionRef, {
    margin: "-100px",
  });

  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: false, margin: "-100px" });

  return (
    <motion.section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#471b1c] via-[#5a130f] to-[#7e0001] relative overflow-hidden min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: isSectionInView ? 1 : 0.3 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-[#fda237] to-[#ab3a12] blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1], 
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity, 
            ease: "easeInOut",
            repeatType: "reverse" 
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-gradient-to-r from-[#d37070] to-[#8b0000] blur-xl"
          style={{ 
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
            repeatType: "reverse"
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          ref={titleRef}
          className="text-center mb-12 md:mb-20 px-4"
          variants={titleVariants}
          initial="hidden"
          animate={titleInView ? "visible" : "hidden"}
        >
          <div className="relative">
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#F9A826] to-[#FFC56E] text-center leading-tight py-2"
              variants={titleVariants}
              initial="hidden"
              animate={titleInView ? "visible" : "hidden"}
              style={{ willChange: 'transform' }}
            >
              Experience
            </motion.h2>
          </div>
        </motion.div>

        <div className="relative">
          <motion.div
            className="absolute left-8 w-1 bg-gradient-to-b from-[#fda237] to-[#fdc592] h-full opacity-30"
            initial={{ scaleY: 0, originY: 0 }}
            animate={{ scaleY: isSectionInView ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ willChange: 'transform' }}
          />
          <div className="space-y-8 md:space-y-16">
            {EXPERIENCES.map((experience, index) => (
              <TimelineItem
                key={experience.id}
                experience={experience}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}