export interface Experience {
  id: number;
  company: string;
  position: string;
  duration: string;
  location?: string;
  responsibilities: string[];
  type: "work" | "education" | "organization";
  /** Logo path in /public. Leave out to show a generic icon for the type. */
  icon?: string;
}
