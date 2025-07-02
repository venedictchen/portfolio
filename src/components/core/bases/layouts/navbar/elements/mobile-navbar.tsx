"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LINKS } from "../constants";
import { useNavbarStyles } from "@/components";
import { Menu, X } from "lucide-react";
import gsap from "gsap";

export const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isScrolledPastScreenHeight, bgClass, roundedClass, positionClass } =
    useNavbarStyles();
  const linksRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen && linksRef.current) {
      gsap.fromTo(
        linksRef.current.children,
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.6,
          ease: "power3.out",
        }
      );
    }
  }, [isOpen]);

  return (
    <>
      <nav
        className={`fixed z-50 h-16 w-full transition-all duration-700 flex items-center px-4 ${bgClass} ${roundedClass} ${positionClass} ${
          isScrolledPastScreenHeight ? "top-4 scale-95" : "mt-4"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="text-2xl font-bold text-[#F9A826] z-50">
            Venedict<span className="text-white">Chen</span>
          </Link>

          <div className="flex justify-center items-center">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none z-50"
              aria-label="Toggle menu"
            >
              <div className="relative w-8 h-8">
                <Menu
                  className={`w-8 h-8 absolute transition-all duration-300 ${
                    isOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                  }`}
                />
                <X
                  className={`w-8 h-8 absolute transition-all duration-300 ${
                    isOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-black bg-opacity-95 z-40 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div ref={linksRef} className="flex flex-col items-center space-y-8">
          {Object.values(LINKS).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-white text-2xl hover:text-[#F9A826] opacity-0"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
