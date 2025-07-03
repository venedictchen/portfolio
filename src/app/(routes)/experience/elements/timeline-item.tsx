"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { itemVariants } from "../animations";
import { TimelineItemProps } from "../types";
import TimelineNode from "./timeline-node";
import ExperienceCard from "./experience-card";

export default function TimelineItem({
  experience,
  index,
}: Readonly<TimelineItemProps>) {
  const itemRef = useRef(null);
  const isInView = useInView(itemRef, { once: false, margin: "-100px" });

  return (
    <motion.div
      ref={itemRef}
      className="relative flex items-start"
      variants={itemVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <TimelineNode
        type={experience.type}
        icon={experience.icon}
        isInView={isInView}
      />
      <ExperienceCard
        experience={experience}
        index={index}
        isInView={isInView}
      />
    </motion.div>
  );
}
