"use client";

import type React from "react";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { ContactForm } from "./elements/contact-form";
import ContactInfo from "./elements/contact-info";

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: false, amount: 0.5 });

  const titleVariants: Variants = {
    hidden: {
      opacity: 0,
      y: -30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      id="contact"
      className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-16 bg-dark-red relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-20">
        <motion.div
          className="absolute top-10 right-10 w-40 h-40 rounded-full bg-[#F9A826] blur-3xl"
          animate={{
            x: [0, 20, -10, 5, 0],
            y: [0, -15, 10, -5, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: [0.42, 0, 0.58, 1],
          }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-[#F9A826] blur-3xl"
          animate={{
            x: [0, -20, 15, -5, 0],
            y: [0, 15, -10, 5, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
            ease: [0.42, 0, 0.58, 1],
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h2
          ref={titleRef}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#F9A826] to-[#FFC56E] text-center"
          variants={titleVariants}
          initial="hidden"
          animate={titleInView ? "visible" : "hidden"}
        >
          Get In Touch
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <ContactInfo />
          <motion.div
            className="bg-gradient-to-br from-[#471b1c]/50 to-[#5c2318]/50 p-8 rounded-3xl border border-[#fda237]/20 backdrop-blur-sm"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2a0f10]/50 to-[#3a1015]/50" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a0f10]/50 to-[#3a1015]/50 opacity-20" />
      </div>
    </motion.section>
  );
}
