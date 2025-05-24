"use client";
import { useMediaQuery } from "@/components";
import { DesktopNavbar } from "./elements/desktopNavbar";
import { MobileNavbar } from "./elements/mobileNavbar";

export const Navbar = () => {
  const isDesktop = useMediaQuery("(min-width: 992px)");

  return <>{isDesktop ? <DesktopNavbar /> : <MobileNavbar />}</>;
};
