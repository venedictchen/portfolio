"use client";
import AboutSection from "./about";
import HeroSection from "./hero";
import TechStackSection from "./techstack";
import ExperienceSection from "./experience";
import ContactSection from "./contact";
import ShowcaseSection from "./showcase";

export default function Home() {

  return (
    <main className="bg-dark-red min-h-screen text-white">
      <HeroSection />
      <AboutSection />
      <TechStackSection />
      <ExperienceSection />
      <ShowcaseSection />
      <ContactSection />
    </main>
  );
}
