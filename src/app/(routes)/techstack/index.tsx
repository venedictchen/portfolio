import Image from "next/image";
import { TECHSTACK } from "./constant";

export default function TechStackSection() {
  return (
    <div className="overflow-hidden bg-orange-200">
      <div className="marquee-track flex w-max h-full py-6 select-none animate-marquee-infinite whitespace-nowrap">
        {[...TECHSTACK, ...TECHSTACK].map((tech, index) => (
          <div
            key={`${tech.src}-${index}`}
            className="flex justify-center items-center md:ml-16 ml-8"
          >
            <div className="md:w-28 md:h-28 w-16 h-16 flex justify-center mx-auto items-center">
              <Image
                src={tech.src}
                alt={tech.alt}
                width={100}
                height={100}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
