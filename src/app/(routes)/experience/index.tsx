"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  Calendar,
  Users,
  Code,
  Award,
  Briefcase,
  Star,
  Sparkles,
  Trophy,
  Target,
  Zap,
} from "lucide-react";

interface Experience {
  id: number;
  company: string;
  companyShort: string;
  position: string;
  duration: string;
  location?: string;
  type: "internship" | "teaching" | "organization";
  highlights: string[];
  skills?: string[];
  icon: any;
}

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: false, amount: 0.5 });

  // Track scroll progress through the timeline section
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  });

  // Transform scroll progress to height percentage
  const timelineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const experiences: Experience[] = [
    {
      id: 1,
      company: "OPPO Indonesia Manufacturing",
      companyShort: "OPPO",
      position: "Software Engineer Intern",
      duration: "June 2024 – Present",
      type: "internship",
      icon: Code,
      highlights: [
        "Built a production line monitoring dashboard to track units produced per hour (UPH) across 10+ stations, enabling real-time performance insights",
        "Applied Lean Manufacturing principles to visualize cycle time deviations, station idle times, and throughput delays",
        "Collaborated with cross-functional teams to define KPIs and deploy the dashboard on a centralized system used by the manufacturing floor",
      ],
      skills: [
        "Dashboard Development",
        "Real-time Monitoring",
        "Lean Manufacturing",
        "KPI Analysis",
      ],
    },
    {
      id: 2,
      company: "Fasilkom UI",
      companyShort: "FASILKOM UI",
      position: "Coordinator Teaching Assistant of Advanced Programming",
      duration: "Jan 2024 – June 2024",
      type: "teaching",
      icon: Users,
      highlights: [
        "Appointed as coordinator to lead a team of 21 teaching assistants",
        "Collaborated and engaged in regular discussions with lecturers to enhance course content, improve teaching strategies, and address student challenges",
        "Guided students in mastering advanced programming concepts, including SOLID principles, design patterns, high-level networking, and other essential topics",
      ],
      skills: [
        "Team Leadership",
        "SOLID Principles",
        "Design Patterns",
        "Networking",
        "Teaching",
      ],
    },
    {
      id: 3,
      company: "Fasilkom UI",
      companyShort: "FASILKOM UI",
      position: "Teaching Assistant of Data Structures and Algorithms",
      duration: "Aug 2023 – Jan 2024",
      type: "teaching",
      icon: Award,
      highlights: [
        "Selected as one of 24 teaching assistants for the Data Structures and Algorithms course",
        "Graded programming assignments for 12 students and provided support during lab sessions",
        "Collaborated with lecturers to deliver engaging lessons on core topics, including dynamic programming, trees, binary search, sorting, and graphs",
      ],
      skills: [
        "Data Structures",
        "Algorithms",
        "Dynamic Programming",
        "Graph Theory",
        "Mentoring",
      ],
    },
    {
      id: 4,
      company: "RISTEK Fasilkom UI",
      companyShort: "RISTEK",
      position: "Member of Web Development SIG",
      duration: "Mar 2023 – Jan 2024",
      type: "organization",
      icon: Code,
      highlights: [
        "Selected as one of 6 members faculty-wide for a 12-month professional development team",
        "Contributed to four projects, applying best practices in full-stack development, building collaboration with team members and external stakeholders",
        "Collaborated with project managers and UI/UX designers, offering the developer's perspective and proposing effective solutions during discussions",
      ],
      skills: [
        "Full-stack Development",
        "Project Management",
        "UI/UX Collaboration",
        "Team Collaboration",
      ],
    },
    {
      id: 5,
      company: "BEM Fasilkom UI",
      companyShort: "BEM FASILKOM UI",
      position: "Staff of Deputy of Information and Technology",
      duration: "May 2023 – Jan 2024",
      type: "organization",
      icon: Briefcase,
      highlights: [
        "Selected as one of 8 members faculty-wide for a 12-month faculty student executive board development staff",
        "Led the student executive board internship program for 28 participants, coordinating and delivering web development learning materials",
        "Contributed to three projects addressing the student executive board's technology needs, including an online account reporting system, a staff voting platform, and an open recruitment website",
      ],
      skills: [
        "Program Leadership",
        "Web Development",
        "System Development",
        "Training Coordination",
      ],
    },
  ];

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "internship":
        return "from-emerald-400 via-teal-500 to-cyan-600";
      case "teaching":
        return "from-blue-400 via-indigo-500 to-purple-600";
      case "organization":
        return "from-purple-400 via-pink-500 to-rose-600";
      default:
        return "from-[#F9A826] via-[#FFC56E] to-[#FFD700]";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "internship":
        return "Internship";
      case "teaching":
        return "Teaching";
      case "organization":
        return "Organization";
      default:
        return "Experience";
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1a0b08] via-[#2d1410] to-[#3A0F09] relative overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(249, 168, 38, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(249, 168, 38, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
          }}
        />

        {/* Floating Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-[#F9A826]/30 to-[#FFC56E]/30 blur-2xl"
          animate={{
            x: [0, 50, -30, 20, 0],
            y: [0, -40, 30, -20, 0],
            scale: [1, 1.2, 0.8, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
          animate={{
            x: [0, -60, 40, -20, 0],
            y: [0, 50, -20, 30, 0],
            scale: [1, 0.7, 1.3, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-60 h-60 rounded-full bg-gradient-to-r from-blue-500/15 to-cyan-500/15 blur-3xl"
          animate={{
            x: [0, 80, -50, 30, 0],
            y: [0, -60, 70, -30, 0],
            scale: [1, 1.4, 0.6, 1.2, 1],
            opacity: [0.3, 0.6, 0.2, 0.5, 0.3],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        {/* Sparkle Effects */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#F9A826] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Section Header */}
        <motion.div
          ref={titleRef}
          className="text-center mb-16"
          variants={titleVariants}
          initial="hidden"
          animate={titleInView ? "visible" : "hidden"}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#F9A826] to-[#FFC56E] mb-4">
            Experience Journey
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Discover my professional journey through internships, teaching, and organizational roles
          </p>
        </motion.div>

        {/* Enhanced Timeline */}
        <motion.div
          ref={timelineRef}
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {/* Timeline Background Effects */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px transform -translate-x-1/2">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F9A826]/20 to-transparent" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-[#F9A826]/40 via-[#FFC56E]/60 to-[#F9A826]/40"
              style={{ height: timelineHeight }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Mobile Timeline */}
          <div className="lg:hidden absolute left-8 top-0 bottom-0 w-px">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F9A826]/20 to-transparent" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-[#F9A826]/40 via-[#FFC56E]/60 to-[#F9A826]/40"
              style={{ height: timelineHeight }}
            />
          </div>

          {/* Experience Cards */}
          <div className="space-y-12 lg:space-y-16">
            {experiences.map((experience, index) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                index={index}
                isLeft={index % 2 === 0}
                getTypeColor={getTypeColor}
                getTypeLabel={getTypeLabel}
                scrollYProgress={scrollYProgress}
                totalExperiences={experiences.length}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ExperienceCard({
  experience,
  index,
  isLeft,
  getTypeColor,
  getTypeLabel,
  scrollYProgress,
  totalExperiences,
}: {
  experience: Experience;
  index: number;
  isLeft: boolean;
  getTypeColor: (type: string) => string;
  getTypeLabel: (type: string) => string;
  scrollYProgress: any;
  totalExperiences: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInView = useInView(cardRef, { once: false, amount: 0.3 });

  const nodeThreshold = (index + 1) / totalExperiences;
  const nodeVisible = useTransform(scrollYProgress, [0, nodeThreshold], [0, 1]);

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

  const IconComponent = experience.icon;

  return (
    <motion.div
      ref={cardRef}
      className="relative"
      variants={cardVariants}
      initial="hidden"
      animate={cardInView ? "visible" : "hidden"}
    >
      {/* Enhanced Timeline Node */}
      <motion.div
        className="absolute left-8 lg:left-1/2 w-6 h-6 transform lg:-translate-x-1/2 z-20"
        style={{
          scale: nodeVisible,
          opacity: nodeVisible,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9A826] to-[#FFC56E] rounded-full shadow-lg shadow-[#F9A826]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9A826] to-[#FFC56E] rounded-full animate-ping opacity-40" />
        <div className="absolute inset-1 bg-white rounded-full" />
        <div className="absolute inset-2 bg-gradient-to-r from-[#F9A826] to-[#FFC56E] rounded-full" />
      </motion.div>

      {/* Enhanced Card Content */}
      <div className={`flex ${isLeft ? "lg:justify-start" : "lg:justify-end"}`}>
        <motion.div
          className={`w-full lg:w-[47%] ml-20 lg:ml-0 ${
            isLeft ? "lg:pr-8" : "lg:pl-8"
          }`}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`relative bg-gradient-to-br from-[#4A1B12]/90 to-[#3A0F09]/95 backdrop-blur-lg rounded-3xl p-8 border border-[#F9A826]/30 shadow-2xl shadow-[#3A0F09]/50 hover:shadow-[#F9A826]/20 transition-all duration-500 overflow-hidden ${
              isLeft ? "lg:text-left" : "lg:text-right"
            }`}
          >
            {/* Card Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 20%, rgba(249, 168, 38, 0.3) 0%, transparent 50%)`,
                }}
              />
            </div>

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-[#F9A826]/10 to-[#FFC56E]/10 rounded-full blur-xl" />

            {/* Enhanced Header */}
            <div
              className={`flex items-start gap-6 mb-8 ${
                isLeft ? "" : "lg:flex-row-reverse"
              }`}
            >
              <motion.div
                className={`flex-shrink-0 w-16 h-16 bg-gradient-to-r ${getTypeColor(
                  experience.type
                )} rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden`}
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
                <IconComponent className="w-8 h-8 text-white relative z-10" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div
                  className={`flex items-center gap-3 mb-3 ${
                    isLeft ? "" : "lg:justify-end"
                  }`}
                >
                  <motion.span
                    className={`px-4 py-2 bg-gradient-to-r ${getTypeColor(
                      experience.type
                    )} text-white text-sm font-semibold rounded-full shadow-lg`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {getTypeLabel(experience.type)}
                  </motion.span>
                  <Star className="w-4 h-4 text-[#F9A826]" />
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight">
                  {experience.position}
                </h3>
                <p className="text-[#F9A826] font-bold mb-4 text-xl">
                  {experience.company}
                </p>

                <div
                  className={`flex items-center gap-2 text-white/80 ${
                    isLeft ? "" : "lg:justify-end"
                  }`}
                >
                  <Calendar className="w-5 h-5 text-[#F9A826]" />
                  <span className="font-medium">{experience.duration}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Highlights */}
            <div className="space-y-5 mb-8">
              {experience.highlights.map((highlight, highlightIndex) => (
                <motion.div
                  key={highlightIndex}
                  className={`flex items-start gap-4 ${
                    isLeft ? "" : "lg:flex-row-reverse lg:text-right"
                  }`}
                  initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                  animate={
                    cardInView
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: isLeft ? -20 : 20 }
                  }
                  transition={{
                    delay: 0.1,
                    duration: 0.5,
                  }}
                >
                  <motion.div
                    className="w-3 h-3 bg-gradient-to-r from-[#F9A826] to-[#FFC56E] rounded-full mt-2 flex-shrink-0 shadow-lg"
                    whileHover={{ scale: 1.5 }}
                    transition={{ duration: 0.2 }}
                  />
                  <p className="text-white/95 text-base leading-relaxed font-medium">
                    {highlight}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Skills */}
            {experience.skills && (
              <motion.div
                className={`flex flex-wrap gap-3 ${
                  isLeft ? "" : "lg:justify-end"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  cardInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {experience.skills.map((skill, skillIndex) => (
                  <motion.span
                    key={skillIndex}
                    className="px-4 py-2 bg-gradient-to-r from-[#4A1B12]/80 to-[#3A0F09]/80 text-[#F9A826] text-sm font-semibold rounded-xl border border-[#F9A826]/40 hover:bg-[#F9A826]/20 hover:border-[#F9A826]/60 transition-all duration-300 backdrop-blur-sm"
                    whileHover={{ scale: 1.05, y: -2 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}