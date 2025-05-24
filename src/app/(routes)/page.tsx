"use client";
import AboutSection from "./about";
import HeroSection from "./hero";
import { useRef } from "react";
import TechStackSection from "./techstack";
import ExperienceSection from "./experience";
import ProjectsSection from "./projects";
import ContactSection from "./contact";

export default function Home() {

  return (
    <main className="bg-dark-red min-h-screen text-white">
      <HeroSection />
      <AboutSection />
      <TechStackSection />
      <ExperienceSection />
      <ProjectsSection />
      <ContactSection />
    </main>
  );
}
