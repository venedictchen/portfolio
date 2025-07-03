import { Briefcase, Award, Code, Users } from "lucide-react";
import { Experience } from "../types";

export const EXPERIENCES: Experience[] = [
  {
    id: 1,
    company: "OPPO Indonesia Manufacturing",
    position: "Software Engineer Intern",
    duration: "June 2024 – Present",
    location: "OPPO",
    type: "work",
    icon: Briefcase,
    responsibilities: [
      "Built a production line monitoring dashboard to track units produced per hour (UPH) across 10+ stations, enabling real-time performance insights",
      "Applied Lean Manufacturing principles to visualize cycle time deviations, station idle times, and throughput delays",
      "Collaborated with cross-functional teams to define KPIs and deploy the dashboard on a centralized system used by the manufacturing floor",
    ],
  },
  {
    id: 2,
    company: "Fasilkom UI",
    position:
      "Coordinator Teaching Assistant of Advanced Programming (CSCM602223)",
    duration: "Jan 2024 – June 2024",
    location: "FASILKOM UI",
    type: "education",
    icon: Award,
    responsibilities: [
      "Appointed as coordinator to lead a team of 21 teaching assistants",
      "Collaborated and engaged in regular discussions with lecturers to enhance course content, improve teaching strategies, and address student challenges",
      "Guided students in mastering advanced programming concepts, including SOLID principles, design patterns, high-level networking, and other essential topics",
    ],
  },
  {
    id: 3,
    company: "Fasilkom UI",
    position:
      "Teaching Assistant of Data Structures and Algorithms (CSGE602040)",
    duration: "Aug 2023 – Jan 2024",
    location: "FASILKOM UI",
    type: "education",
    icon: Code,
    responsibilities: [
      "Selected as one of 24 teaching assistants for the Data Structures and Algorithms course",
      "Graded programming assignments for 12 students and provided support during lab sessions",
      "Collaborated with lecturers to deliver engaging lessons on core topics, including dynamic programming, trees, binary search, sorting, and graphs",
    ],
  },
  {
    id: 4,
    company: "RISTEK Fasilkom UI",
    position: "Member of Web Development SIG",
    duration: "Mar 2023 – Jan 2024",
    location: "RISTEK",
    type: "organization",
    icon: Users,
    responsibilities: [
      "Selected as one of 6 members faculty-wide for a 12-month professional development team",
      "Contributed to four projects, applying best practices in full-stack development, building collaboration with team members and external stakeholders, and delivering impactful solutions",
      "Collaborated with project managers and UI/UX designers, offering the developer's perspective and proposing effective solutions during discussions to build well-rounded projects",
    ],
  },
  {
    id: 5,
    company: "BEM Fasilkom UI",
    position: "Staff of Deputy of Information and Technology",
    duration: "May 2023 – Jan 2024",
    location: "BEM FASILKOM UI",
    type: "organization",
    icon: Users,
    responsibilities: [
      "Selected as one of 8 members faculty-wide for a 12-month faculty student executive board development staff",
      "Led the student executive board internship program for 28 participants, coordinating and delivering web development learning materials between official staff and interns",
      "Contributed to three projects addressing the student executive board's technology needs, including an online account reporting system, a staff voting platform, and an open recruitment website",
    ],
  },
];

export const getTypeColor = (type: string) => {
  switch (type) {
    case "work":
      return { from: "from-[#fda237]", to: "to-[#ab3a12]" };
    case "education":
      return { from: "from-[#c38d5f]", to: "to-[#ab3a12]" };
    case "organization":
      return { from: "from-[#d37070]", to: "to-[#7e0001]" };
    default:
      return { from: "from-[#fda237]", to: "to-[#ab3a12]" };
  }
};
