import { type LucideIcon } from "lucide-react";

export interface Experience {
  id: number;
  company: string;
  position: string;
  duration: string;
  location?: string;
  responsibilities: string[];
  type: "work" | "education" | "organization";
  icon: LucideIcon;
}

export interface TimelineNodeProps {
  type: Experience["type"];
  icon: Experience["icon"];
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
