"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LINKS } from "../constants";
import { useNavbarStyles } from "@/components";

export const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { barClass } = useNavbarStyles();

  return (
    <>
      <nav
        aria-label="Main"
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
          isOpen ? "bg-page border-line" : barClass
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5 md:pl-(--page-left) md:pr-(--page-right)">
          <Link
            href="#top"
            onClick={() => setIsOpen(false)}
            className="font-semibold text-cream"
          >
            Venedict Chen
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="-mr-2 p-2 text-cream"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Fades in with a CSS transition; `inert` keeps hidden links out of the tab order */}
      <div
        id="mobile-menu"
        inert={!isOpen}
        className={`fixed inset-0 z-40 bg-page px-5 pt-24 md:pl-(--page-left) md:pr-(--page-right) transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="space-y-6">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-3xl font-semibold text-cream hover:text-amber"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
