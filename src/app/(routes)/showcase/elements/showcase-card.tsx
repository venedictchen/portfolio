import { Showcase } from "../types";
import DesktopShowcaseCard from "./desktop-showcase-card";
import MobileShowcaseCard from "./mobile-showcase-card";

export default function ShowcaseCard({
  showcase,
}: Readonly<{ showcase: Showcase }>) {
  return (
    <>
      <div className="hidden lg:block">
        <DesktopShowcaseCard showcase={showcase} />
      </div>
      <div className="block lg:hidden">
        <MobileShowcaseCard showcase={showcase} />
      </div>
    </>
  );
}
