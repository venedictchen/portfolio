import HeroSection from "./sections/hero";
import AboutSection from "./sections/about";
import ExperienceSection from "./sections/experience";
import ProjectsSection from "./sections/projects";
import WritingSection from "./sections/writing";
import ContactSection from "./sections/contact";
import ScrollRoute from "./scroll-route";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <ProjectsSection />
      <WritingSection />
      <ContactSection />
      <ScrollRoute />
    </>
  );
}
