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
    "Real-time locations for Universitas Indonesia&apos;s yellow campus buses (bis kuning, or bikun), so students can see where the next bus is before they walk to the stop. As lead of RISTEK&apos;s web development team, I led three developers on the platform: a Go backend pushes live vehicle positions over WebSocket to a Next.js front end. I also did the SEO work that made it the top result on Google.",
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
      "Registration platform for RISTEK&apos;s flagship events, including Sister in Tech and Datathon, used by both participants and organizers.",
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
      "Fortune&apos;s sweep-line algorithm in C++, compiled to WebAssembly, with an interactive viewer. Built with two teammates for Computational Geometry.",
    technologies: ["C++", "WebAssembly", "JavaScript"],
    imageUrl: "/images/projects/fortune.webp",
    demoUrl: "https://venedictchen.github.io/fortune-algorithm/",
    githubUrl: "https://github.com/venedictchen/fortune-algorithm",
  },
];

export const linkClass =
  "font-semibold text-peach underline decoration-peach/40 decoration-2 underline-offset-4 hover:text-amber hover:decoration-amber";
