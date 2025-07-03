"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, useState } from "react";
import { Showcase } from "../types";
import { Button } from "@/components/ui/button";
import { X, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

export function ShowcaseCard({ showcase }: { showcase: Showcase }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInView = useInView(cardRef, { once: true, amount: 0.3 });

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const handleExpandToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative bg-gradient-to-br from-[#4A1B12]/80 to-[#3A0F09]/90 backdrop-blur-sm rounded-2xl overflow-hidden h-96 border border-[#F9A826]/20 cursor-pointer"
      variants={cardVariants}
      initial="hidden"
      animate={cardInView ? "visible" : "hidden"}
      onClick={handleExpandToggle}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={showcase.imageUrl}
          alt={showcase.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          loading="lazy"
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A0F09]/90 via-[#3A0F09]/60 to-[#3A0F09]/40" />
      </div>

      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <motion.span
          className="px-3 py-1 bg-gradient-to-r from-[#F9A826] to-[#FFC56E] text-[#3A0F09] text-sm font-medium rounded-full self-start"
          whileTap={{ scale: 0.95 }}
        >
          {showcase.category}
        </motion.span>

        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {showcase.title}
          </h3>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExpandToggle}
            className="mb-2 border-[#F9A826]/30 text-[#F9A826] hover:text-white bg-[#F9A826]/10 hover:bg-[#F9A826]/20"
          >
            {isExpanded ? "Show Less" : "Show More"}
          </Button>

          <div className="flex flex-wrap gap-2">
            {showcase.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 bg-[#F9A826]/20 backdrop-blur-sm text-[#F9A826] text-xs rounded-full border border-[#F9A826]/30"
              >
                {tech}
              </span>
            ))}
            {showcase.technologies.length > 3 && (
              <span className="px-2 py-1 bg-[#F9A826]/20 backdrop-blur-sm text-[#F9A826] text-xs rounded-full border border-[#F9A826]/30">
                +{showcase.technologies.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-[#3A0F09]/98 via-[#4A1B12]/95 to-[#5C2318]/90 backdrop-blur-sm p-6 flex flex-col justify-center border-t border-[#F9A826]/20 transition-transform duration-500 ease-out ${
          isExpanded ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="space-y-4 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExpandToggle}
            className="absolute top-4 right-4 text-[#F9A826] hover:text-white border border-[#F9A826]/30 bg-[#F9A826]/10 hover:bg-[#F9A826]/20"
          >
            <X className="w-4 h-4" />
          </Button>

          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {showcase.title}
            </h3>
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#F9A826] to-[#FFC56E] text-[#3A0F09] text-sm rounded-full mb-4 font-medium">
              {showcase.category}
            </span>
          </div>

          <p className="text-white/90 text-sm leading-relaxed">
            {showcase.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {showcase.technologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-[#4A1B12]/80 text-[#F9A826] text-xs rounded-full border border-[#F9A826]/30"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            {showcase.demoUrl && (
              <motion.a
                href={showcase.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F9A826] to-[#FFC56E] hover:from-[#FFC56E] hover:to-[#F9A826] text-[#3A0F09] rounded-lg transition-all duration-300 text-sm font-medium shadow-lg shadow-[#F9A826]/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </motion.a>
            )}
            {showcase.githubUrl && (
              <motion.a
                href={showcase.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#4A1B12]/80 hover:bg-[#5C2318]/80 text-[#F9A826] rounded-lg transition-colors text-sm font-medium border border-[#F9A826]/30 hover:border-[#F9A826]/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaGithub className="w-4 h-4" />
                Code
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
