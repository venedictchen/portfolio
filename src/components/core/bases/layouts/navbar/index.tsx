"use client";
import { useMediaQuery } from "@/components";
import { DesktopNavbar } from "./elements/desktop-navbar";
import { MobileNavbar } from "./elements/mobile-navbar";


export const Navbar = () => {
  const isDesktop = useMediaQuery("(min-width: 992px)");

  return <>{isDesktop ? <DesktopNavbar /> : <MobileNavbar />}</>;
};
