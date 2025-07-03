"use client";

import { useRef} from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { SHOWCASE } from "./constants";
import BackgroundElements from "./elements/background-element";
import ShowcaseCard from "./elements/showcase-card";


export default function ShowcaseSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: false, amount: 0.5 });

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <section id="showcase" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#3A0F09] via-[#4A1B12] to-[#5C2318] relative overflow-hidden">
      <BackgroundElements />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h2
          ref={titleRef}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#fda237] via-[#fdc592] to-[#fda237] text-center leading-tight py-2"
          variants={titleVariants}
          initial="hidden"
          animate={titleInView ? "visible" : "hidden"}
        >
          Projects & Articles
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {SHOWCASE.map((showcase) => (
            <ShowcaseCard key={showcase.id} showcase={showcase} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

