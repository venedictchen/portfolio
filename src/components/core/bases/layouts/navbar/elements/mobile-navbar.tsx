"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LINKS } from "../constants";
import { useNavbarStyles } from "@/components";
import { Menu, X } from "lucide-react";

export const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isScrolledPastScreenHeight, bgClass, roundedClass, positionClass } =
    useNavbarStyles();

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut" as const,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut" as const,
      },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const linkVariants = {
    hidden: {
      x: 100,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  const iconVariants = {
    menu: {
      opacity: 1,
      rotate: 0,
      transition: { duration: 0.3 },
    },
    close: {
      opacity: 0,
      rotate: 90,
      transition: { duration: 0.3 },
    },
  };

  return (
    <>
      <nav
        className={`fixed z-50 h-16 w-full transition-all duration-700 flex items-center px-4 ${bgClass} ${roundedClass} ${positionClass} ${
          isScrolledPastScreenHeight ? "top-4 scale-95" : "mt-4"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="text-2xl font-bold text-[#F9A826] z-50">
            Venedict<span className="text-white">Chen</span>
          </Link>

          <div className="flex justify-center items-center">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none z-50"
              aria-label="Toggle menu"
            >
              <div className="relative w-8 h-8">
                <motion.div
                  className="absolute"
                  variants={iconVariants}
                  animate={isOpen ? "close" : "menu"}
                >
                  <Menu className="w-8 h-8" />
                </motion.div>
                <motion.div
                  className="absolute"
                  variants={iconVariants}
                  animate={isOpen ? "menu" : "close"}
                >
                  <X className="w-8 h-8" />
                </motion.div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-dark-red bg-opacity-95 z-40 flex flex-col items-center justify-center"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="flex flex-col items-center space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {Object.values(LINKS).map((link) => (
                <motion.div key={link.href} variants={linkVariants}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-white text-2xl hover:text-[#F9A826]"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
