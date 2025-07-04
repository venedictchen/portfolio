import { Mail, MapPin } from "lucide-react";
import GitHubIcon from "@/components/icons/github-icon";
import LinkedInIcon from "@/components/icons/linkedin-icon";

export const CONTACT_INFO = [
    {
        icon: Mail,
        label: "Email",
        value: "venedictchen@gmail.com",
        href: "mailto:venedictchen@gmail.com",
    },
    {
        icon: MapPin,
        label: "Location",
        value: "Jakarta, Indonesia",
        href: null,
    },
    {
        icon: GitHubIcon,
        label: "GitHub",
        value: "github.com/venedictchen",
        href: "https://github.com/venedictchen",
    },
    {
        icon: LinkedInIcon,
        label: "LinkedIn",
        value: "linkedin.com/in/venedictchen",
        href: "https://linkedin.com/in/venedictchen",
    },
];