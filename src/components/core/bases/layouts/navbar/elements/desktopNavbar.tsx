"use client";
import Link from "next/link";
import { LINKS } from "../constants";
import { useNavbarStyles } from "@/components";

export const DesktopNavbar = () => {
  const { isScrolledPastScreenHeight, bgClass, roundedClass, positionClass } = useNavbarStyles();

  return (
    <nav
      className={`fixed z-50 h-16 w-full transition-all duration-700 flex items-center px-4 md:px-10 ${bgClass} ${roundedClass} ${positionClass} ${
        isScrolledPastScreenHeight ? "top-4 scale-95" : "mt-4"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <Link href="/" className="text-2xl font-bold text-[#F9A826]">
          Venedict<span className="text-white">Chen</span>
        </Link>

        <div className="hidden md:flex space-x-16 ">
          {Object.values(LINKS).map((link) => (
            <Link key={link.href} href={link.href} className={`text-white`}>
              <span className="font-normal">{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
