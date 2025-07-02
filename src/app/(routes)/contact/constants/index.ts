import { Mail, MapPin } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

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
        icon: FaGithub,
        label: "GitHub",
        value: "github.com/venedictchen",
        href: "https://github.com/venedictchen",
    },
    {
        icon: FaLinkedin,
        label: "LinkedIn",
        value: "linkedin.com/in/venedictchen",
        href: "https://linkedin.com/in/venedictchen",
    },
];