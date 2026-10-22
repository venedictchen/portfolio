import { FALLBACK_ICONS } from "../constants";
import { Experience } from "../types";
import Image from "next/image";

export function Logo({ experience }: { experience: Experience }) {
  if (experience.icon) {
    return (
      <Image
        src={experience.icon}
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-full bg-white object-contain"
      />
    );
  }
  const Icon = FALLBACK_ICONS[experience.type];
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-amber">
      <Icon aria-hidden="true" className="h-5 w-5" />
    </span>
  );
}