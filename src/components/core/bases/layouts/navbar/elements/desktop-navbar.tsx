"use client";
import Link from "next/link";
import { LINKS } from "../constants";
import { useNavbarStyles } from "@/components";

export const DesktopNavbar = () => {
  const { barClass } = useNavbarStyles();

  return (
    <nav
      aria-label="Main"
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${barClass}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between pl-(--page-left) pr-(--page-right)">
        <Link href="#top" className="font-semibold text-cream hover:text-amber">
          Venedict Chen
        </Link>
        <ul className="flex gap-10">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-cream/80 transition-colors hover:text-amber"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
