import { motion, useInView, type Variants } from "framer-motion";
import { Showcase } from "../types";
import { useRef } from "react";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import GitHubIcon from "@/components/icons/github-icon";

export default function DesktopShowcaseCard({
  showcase,
}: Readonly<{ showcase: Showcase }>) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInView = useInView(cardRef, { once: false, amount: 0.3 });

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
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

  return (
    <motion.div
      ref={cardRef}
      className="group relative bg-gradient-to-br from-[#4A1B12]/80 to-[#3A0F09]/90 backdrop-blur-sm rounded-2xl overflow-hidden h-96 border border-[#F9A826]/20"
      variants={cardVariants}
      initial="hidden"
      animate={cardInView ? "visible" : "hidden"}
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={showcase.imageUrl}
          alt={showcase.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
          loading="lazy"
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3A0F09]/90 via-[#3A0F09]/60 to-[#3A0F09]/40 group-hover:from-[#3A0F09]/95 group-hover:via-[#3A0F09]/70 group-hover:to-[#3A0F09]/50 transition-all duration-500 scale-[1.02]" />
      </div>

      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <motion.span
            className="px-3 py-1 bg-gradient-to-r from-[#F9A826] to-[#FFC56E] text-[#3A0F09] text-sm font-medium rounded-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {showcase.category}
          </motion.span>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-300">
            {showcase.demoUrl && (
              <motion.a
                href={showcase.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#F9A826]/20 backdrop-blur-sm rounded-full hover:bg-[#F9A826]/30 transition-colors border border-[#F9A826]/30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="w-4 h-4 text-[#F9A826]" />
              </motion.a>
            )}
            {showcase.githubUrl && (
              <motion.a
                href={showcase.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#F9A826]/20 backdrop-blur-sm rounded-full hover:bg-[#F9A826]/30 transition-colors border border-[#F9A826]/30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <GitHubIcon className="w-4 h-4 text-[#F9A826]" />
              </motion.a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {showcase.title}
          </h3>
          <div className="flex flex-wrap gap-2 group-hover:opacity-0 transition-opacity duration-300">
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

      <div className="absolute inset-0 bg-gradient-to-t from-[#3A0F09]/98 via-[#4A1B12]/95 to-[#5C2318]/90 backdrop-blur-sm p-6 flex flex-col justify-center border-t border-[#F9A826]/20 transition-transform duration-500 ease-out translate-y-full group-hover:translate-y-0">
        <div className="space-y-4">
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
                <GitHubIcon className="w-4 h-4" />
                Code
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
