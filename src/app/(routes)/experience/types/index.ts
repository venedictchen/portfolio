export interface Experience {
  id: number;
  company: string;
  position: string;
  duration: string;
  location?: string;
  responsibilities: string[];
  type: "work" | "education" | "organization";
  icon: string;
}

export interface TimelineNodeProps {
  type: Experience["type"];
  icon: string;
  isInView: boolean;
}

export interface TimelineItemProps {
  experience: Experience;
  index: number;
}

export interface ExperienceCardProps {
  experience: Experience;
  index: number;
  isInView: boolean;
}
