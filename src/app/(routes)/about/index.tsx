"use client";

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, useInView, Variants } from "framer-motion";
import Link from "next/link";

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const titleInView = useInView(titleRef, { once: false, amount: 0.5 });
  const imageInView = useInView(imageRef, { once: false, amount: 0.3 });
  const contentInView = useInView(contentRef, { once: false, amount: 0.3 });

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  const decorVariants: Variants = {
    animate: {
      x: [0, 30, -20, 10, 0],
      y: [0, -20, 30, -10, 0],
      scale: [1, 1.1, 0.9, 1.05, 1],
      opacity: [0.2, 0.4, 0.3, 0.35, 0.2],
      transition: {
        duration: 20,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: [0.42, 0, 0.58, 1],
      },
    },
  };

  const accent1Variants: Variants = {
    animate: {
      rotate: 360,
      transition: { duration: 25, repeat: Infinity, ease: "linear" },
    },
  };

  const accent2Variants: Variants = {
    animate: {
      rotate: -360,
      transition: { duration: 30, repeat: Infinity, ease: "linear" },
    },
  };

  const accent3Variants: Variants = {
    animate: {
      rotate: [0, 180, 0],
      transition: { duration: 20, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      id="about"
      className="about-section py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-16 bg-gradient-to-br from-[#3A0F09] via-[#4A1B12] to-[#5C2318] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
        <motion.div
          className="absolute top-10 left-10 w-40 h-40 rounded-full bg-[#F9A826] blur-3xl"
          animate={{ x: [0, 20, -10, 5, 0], y: [0, -15, 10, -5, 0] }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: [0.42, 0, 0.58, 1],
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#F9A826] blur-3xl"
          animate={{ x: [0, -20, 15, -5, 0], y: [0, 15, -10, 5, 0] }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
            ease: [0.42, 0, 0.58, 1],
          }}
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
        <motion.div
          className="absolute top-10 left-10 w-40 sm:w-60 h-40 sm:h-60 rounded-full bg-gradient-radial from-[#F9A826] to-transparent blur-3xl"
          variants={decorVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-20 right-20 w-60 sm:w-80 h-60 sm:h-80 rounded-full bg-gradient-radial from-[#F9A826] to-transparent blur-3xl"
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 30, -10, 0],
            scale: [1, 1.1, 0.9, 1.05, 1],
            opacity: [0.2, 0.4, 0.3, 0.35, 0.2],
          }}
          transition={{
            delay: 0.5,
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: [0.42, 0, 0.58, 1],
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-32 sm:w-40 h-32 sm:h-40 rounded-full bg-gradient-radial from-[#F9A826] to-transparent blur-2xl"
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 30, -10, 0],
            scale: [1, 1.1, 0.9, 1.05, 1],
            opacity: [0.2, 0.4, 0.3, 0.35, 0.2],
          }}
          transition={{
            delay: 1,
            duration: 22,
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
          About Me
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <motion.div
            ref={imageRef}
            className="relative mx-auto w-64 sm:w-72 md:w-full max-w-sm aspect-square group"
            variants={imageVariants}
            initial="hidden"
            animate={imageInView ? "visible" : "hidden"}
          >
            <motion.div
              className="absolute inset-0 border-2 sm:border-4 border-dashed border-[#F9A826]/40 rounded-full scale-110"
              variants={accent1Variants}
              animate="animate"
            />
            <motion.div
              className="absolute inset-0 border-1 sm:border-2 border-dotted border-[#F9A826]/30 rounded-full scale-125"
              variants={accent2Variants}
              animate="animate"
            />
            <motion.div
              className="absolute inset-0 border-4 sm:border-8 border-[#F9A826]/10 rounded-full scale-105"
              variants={accent3Variants}
              animate="animate"
            />
            <motion.div
              className="relative w-full h-full overflow-hidden rounded-full shadow-xl sm:shadow-2xl shadow-[#F9A826]/30"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative w-full h-full rounded-full overflow-hidden p-2 sm:p-3 bg-gradient-to-br from-[#F9A826]/40 to-transparent">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#3A0F09]/30 to-transparent rounded-full z-10" />
                <Image
                  src="/images/profile.webp"
                  alt="Software Engineer"
                  fill
                  className="object-cover rounded-full transition-all duration-700 group-hover:scale-110 group-hover:rotate-3"
                  sizes="(max-width: 640px) 256px, (max-width: 768px) 288px, 384px"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            ref={contentRef}
            className="space-y-4 sm:space-y-6 mt-8 md:mt-0"
            variants={contentVariants}
            initial="hidden"
            animate={contentInView ? "visible" : "hidden"}
          >
            <motion.h3
              className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#F9A826] to-[#FFC56E]"
              variants={itemVariants}
            >
              Passionate Developer
            </motion.h3>
            <motion.p
              className="text-base sm:text-lg mb-2 sm:mb-4 text-white/90 leading-relaxed"
              variants={itemVariants}
            >
              Hi Everyone, I am a Software Engineer enthusiast with a passion
              for building application and solve problem. Currently pursuing my
              degree in Computer Science at the University of Indonesia, I blend
              technical skills with creative thinking to build applications that
              are both functional and user-friendly.
            </motion.p>
            <motion.p
              className="text-base sm:text-lg mb-4 sm:mb-8 text-white/90 leading-relaxed"
              variants={itemVariants}
            >
              My journey in tech began with a curiosity about how things work,
              which evolved into a career building software that makes a
              difference. I&apos;m constantly learning and exploring new
              technologies to stay at the cutting edge of development.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2"
              variants={itemVariants}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="https://drive.google.com/file/d/1bMwVLcIFy7z6a3cUeWuVPtpEog3UOYlA/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto relative overflow-hidden border-2 border-yellow bg-transparent text-yellow hover:bg-yellow hover:text-[#3A0F09] transition-all duration-300 hover:shadow-lg hover:shadow-yellow/20 font-medium text-base sm:text-lg px-4 sm:px-6 py-2"
                  >
                    View My CV
                  </Button>
                </a>
              </motion.div>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <Link href="#contact" scroll={true}>
                  <Button className="w-full sm:w-auto relative overflow-hidden bg-gradient-to-r from-yellow to-[#FFC56E] hover:from-[#FFC56E] hover:to-yellow text-[#3A0F09] transition-all duration-300 hover:shadow-lg hover:shadow-[#F9A826]/20 font-medium text-base sm:text-lg px-4 sm:px-6 py-2">
                    Contact Me
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
