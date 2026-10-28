export interface Project {
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  demoUrl?: string;
  githubUrl?: string;
}

export const FEATURED = {
  title: "Bikun Tracker",
  url: "https://bikun.ui.ac.id",
  description:
    "Real-time locations for Universitas Indonesia's yellow campus buses (bis kuning, or bikun), so students can see where the next bus is before they walk to the stop. As lead of RISTEK's web development team, I led three developers on the platform: a Go backend pushes live vehicle positions over WebSocket to a Next.js front end. I also did the SEO work that made it the top result on Google.",
  facts: [
    { value: "1,400+", label: "monthly active users" },
    { value: "#1", label: "result on Google search" },
    { value: "Go, Next.js", label: "with WebSocket for live sync" },
  ],
  imageUrl: "/images/projects/bikun-tracker.png",
};

export const PROJECTS: Project[] = [
  {
    title: "RISTEK Summerfest",
    description:
      "Registration platform for RISTEK's flagship events, including Sister in Tech and Datathon, used by both participants and organizers.",
    technologies: ["Next.js", "Django REST Framework", "PostgreSQL"],
    imageUrl: "/images/projects/summerfest.webp",
    demoUrl: "https://event.ristek.cs.ui.ac.id/",
  },
  {
    title: "PMB Fasilkom UI 2024",
    description:
      "Orientation site for 1,000+ new students, with a CMS for creating tasks, managing questions, reviewing submissions and running a leaderboard.",
    technologies: ["Next.js", "Express", "Prisma", "PostgreSQL"],
    imageUrl: "/images/projects/pmb.webp",
  },
  {
    title: "Voronoi Diagram Visualizer",
    description:
      "Fortune's sweep-line algorithm in C++, compiled to WebAssembly, with an interactive viewer. Built with two teammates for Computational Geometry.",
    technologies: ["C++", "WebAssembly", "JavaScript"],
    imageUrl: "/images/projects/fortune.webp",
    demoUrl: "https://venedictchen.github.io/fortune-algorithm/",
    githubUrl: "https://github.com/venedictchen/fortune-algorithm",
  },
  {
    title: "Reproductive Endocrinology Data Center",
    description:
      "An external client project with RISTEK Fasilkom UI, a web app for a medical research lab to manage patient data, with a CMS dashboard for visualizing trends and generating reports.",
    technologies: ["Next.js", "Django REST Framework","PostgreSQL"],
    imageUrl: "/images/projects/reproductive-data-center.png",
  },
  {
    title: "Best Staff Voting BEM Fasilkom UI 2023",
    description:
      "A web app for the student organization to conduct a voting process for the best staff members, with a dashboard for tracking votes and results.",
    technologies: ["Next.js", "Django REST Framework", "PostgreSQL"],
    imageUrl: "/images/projects/best-staff-voting.jpg",
  },
  {
    title: "Open House Fasilkom UI 2023",
    description:
      "A website for the Open House event of Fasilkom UI in 2023, featuring a registration system, information pages, and a merchandise store.",
    technologies: ["Go", "Next.js", "WebSocket"],
    imageUrl: "/images/projects/open-house.jpg",
  }
];

export const linkClass =
  "font-semibold text-peach underline decoration-peach/40 decoration-2 underline-offset-4 hover:text-amber hover:decoration-amber";
