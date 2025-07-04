import Image from "next/image";
import { TECHSTACK } from "./constant";

export default function TechStackSection() {
  return (
    <div id="techstack" className="overflow-hidden bg-orange-200">
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
                className="object-contain md:w-24 md:h-24 w-32 h-32 transition-transform duration-300 ease-in-out hover:scale-120"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
