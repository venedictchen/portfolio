import HeroSection from "./_sections/hero";
import AboutSection from "./_sections/about";
import ExperienceSection from "./_sections/experience";
import ProjectsSection from "./_sections/projects";
import WritingSection from "./_sections/writing";
import ContactSection from "./_sections/contact";
import ScrollRoute from "./_scroll-route";

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
