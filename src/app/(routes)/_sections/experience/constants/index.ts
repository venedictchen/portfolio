import { Experience } from "../types";

import { Briefcase, GraduationCap, Users } from "lucide-react";

export const FALLBACK_ICONS = {
  work: Briefcase,
  education: GraduationCap,
  organization: Users,
};

export const EXPERIENCES: Experience[] = [
  {
    id: 1,
    company: "Accenture",
    position: "Software QA Intern",
    duration: "Oct 2025 - Oct 2026",
    location: "Jakarta, Indonesia",
    type: "work",
    icon: "/images/logo/accenture.webp",
    responsibilities: [
      "Built internal automation tools that cut manual API testing effort by 80% and brought test data setup from 30 minutes down to under 10 seconds",
      "Developed API automation scripts in Python and Postman to streamline regression testing and speed up release validation",
      "Designed and maintained test cases covering business logic, end-to-end flows and edge cases to support reliable releases",
    ],
  },
  {
    id: 2,
    company: "OPPO Indonesia Manufacturing",
    position: "Software Engineer Intern",
    duration: "Jun 2025 - Aug 2025",
    type: "work",
    icon: "/images/logo/oppo.webp",
    responsibilities: [
      "Built OPPO Smart Rack, a web-controlled warehouse locker system that made material retrieval 99.98% faster and cut data sync time from 2 days to 3.5 seconds",
      "Built a production line monitoring dashboard tracking units per hour (UPH) across 10+ stations, giving real-time performance insights",
      "Worked with cross-functional teams to define KPIs and deploy the dashboard on the manufacturing floor",
    ],
  },
  {
    id: 3,
    company: "RISTEK Fasilkom UI",
    position: "Lead of Web Development SIG",
    duration: "Mar 2025 - Mar 2026",
    location: "Depok, Indonesia",
    type: "organization",
    icon: "/images/logo/ristek.webp",
    responsibilities: [
      "Led a team of 3 developers to build Bikun Tracker, a real-time campus bus tracker serving 1,400+ monthly active users",
      "Optimized SEO to get Bikun Tracker to the #1 result on Google",
      "Reviewed members' code and tasks across multiple projects to keep quality consistent and delivery on time",
    ],
  },
  {
    id: 4,
    company: "Fasilkom UI",
    position:
      "Coordinator Teaching Assistant of Advanced Programming (CSCM602223)",
    duration: "Jan 2024 - Jun 2024",
    location: "Depok, Indonesia",
    type: "education",
    icon: "/images/logo/fasilkom.webp",
    responsibilities: [
      "Led a faculty-wide team of 21 teaching assistants",
      "Worked with lecturers to improve course content and teaching strategies and to address student challenges",
      "Guided students through SOLID principles, design patterns, networking and other advanced programming topics",
    ],
  },
  {
    id: 5,
    company: "Fasilkom UI",
    position:
      "Teaching Assistant of Data Structures and Algorithms (CSGE602040)",
    duration: "Aug 2023 - Jan 2024",
    location: "Depok, Indonesia",
    type: "education",
    icon: "/images/logo/fasilkom.webp",
    responsibilities: [
      "Selected as one of 24 teaching assistants for the Data Structures and Algorithms course",
      "Graded programming assignments for 12 students and provided support during lab sessions",
      "Collaborated with lecturers to deliver lessons on dynamic programming, trees, binary search, sorting and graphs",
    ],
  },
  {
    id: 6,
    company: "RISTEK Fasilkom UI",
    position: "Member of Web Development SIG",
    duration: "Mar 2024 - Mar 2025",
    location: "Depok, Indonesia",
    type: "organization",
    icon: "/images/logo/ristek.webp",
    responsibilities: [
      "Selected as one of 6 members faculty-wide",
      "Contributed to four full-stack projects delivered in collaboration with external stakeholders",
      "Worked with project managers and UI/UX designers, bringing the developer's perspective to design and planning discussions",
    ],
  },
  {
    id: 7,
    company: "BEM Fasilkom UI",
    position: "Staff of Deputy of Information and Technology",
    duration: "May 2023 - Jan 2024",
    location: "Depok, Indonesia",
    type: "organization",
    icon: "/images/logo/bem.webp",
    responsibilities: [
      "Selected as one of 8 staff members faculty-wide for the student executive board",
      "Led the board's internship program for 28 participants, coordinating and delivering web development learning materials",
      "Contributed to three projects: an online account reporting system, a staff voting platform and an open recruitment website",
    ],
  },
];
