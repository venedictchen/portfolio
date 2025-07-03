import { Showcase } from "../types";

export const SHOWCASE: Showcase[] = [
    {
        id: 1,
        title: "RISTEK Summerfest",
        description:
            "The annual website for RISTEK CSUI's flagship events like Sister in Tech and Datathon. Built as a registration platform for participants and organizers.",
        technologies: ["Next.js", "Django REST Framework", "PostgreSQL"],
        imageUrl: "/images/projects/summerfest.jpg",
        demoUrl: "https://event.ristek.cs.ui.ac.id/",
        category: "Web Development",
    },
    {
        id: 2,
        title: "PMB Fasilkom UI",
        description:
            "A website to support new student admission activities, including introductions to peers, seniors, and faculty staff. Designed to foster community for incoming students.",
        technologies: ["Next.js", "Express", "Prisma", "PostgreSQL"],
        imageUrl: "/images/projects/pmb.jpg",
        category: "Web Development",
    },
    {
        id: 3,
        title: "Voronoi Diagram Visualization",
        description:
            "A final project from the Computational Geometry course visualizing the construction of Voronoi diagrams using Fortune's algorithm. Developed collaboratively with two teammates.",
        technologies: ["JavaScript", "WASM", "C++"],
        imageUrl: "/images/projects/fortune.jpg",
        demoUrl: "https://venedictchen.github.io/fortune-algorithm/",
        githubUrl: "https://github.com/venedictchen/fortune-algorithm",
        category: "Computational Geometry",
    },
    {
        id: 4,
        title: "More Than Just Git",
        description:
            "An article exploring tools beyond Git that help foster effective team collaboration in software engineering—like linear issue tracking, PR reviews, and CI/CD pipelines.",
        technologies: ["Writing", "Collaboration", "Software Engineering"],
        imageUrl:
            "/images/articles/more_than_git.png",
        demoUrl:
            "https://medium.com/@venedictchen/more-than-just-git-using-tools-to-truly-collaborate-in-a-team-532f3df75332",
        category: "Article",
    },
    {
        id: 5,
        title: "Flexible Authentication with Factory & Strategy Patterns",
        description:
            "Exploring how to build flexible and maintainable authentication logic in JavaScript using Factory and Strategy design patterns.",
        technologies: ["JavaScript", "Design Patterns", "Factory", "Strategy"],
        imageUrl:
            "/images/articles/flexible_authentication.png",
        demoUrl:
            "https://medium.com/@venedictchen/flexible-authentication-with-factory-strategy-patterns-in-javascript-123bdb5bdce8",
        category: "Article",
    },
    {
        id: 6,
        title: "Middleware and Security in Express.js",
        description:
            "An article explaining how Express middleware enhances both code maintainability and application security—real examples from real projects.",
        technologies: ["Express.js", "Middleware", "Security"],
        imageUrl:
            "/images/articles/middleware.png",
        demoUrl:
            "https://medium.com/@venedictchen/how-can-middleware-secure-our-code-and-company-express-js-a3819b0794d4",
        category: "Article",
    },
];