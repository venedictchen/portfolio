"use client";

import type React from "react";

import { useRef } from "react";
import { Star } from "lucide-react";
import TypeWriter from "typewriter-effect";

export default function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);

  return (
    <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-20 w-full mb-16">
        <div ref={contentRef} className="text-center">
          <h1
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-8xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#F9A826] to-[#FFC56E] drop-shadow-lg"
          >
            Hello, I&apos;m{" "}
            <span className="text-orange-200 relative inline-block">
              Venedict{" "}
              <span className="absolute -top-16  sm:right-0 sm:-top-7 -right-7 text-2xl text-orange-400">
                <Star className="w-7 h-7 fill-orange-400 text-orange-400 animate-spin" />
              </span>
            </span>
          </h1>

          <h2
            ref={subtitleRef}
            className="text-2xl md:text-3xl lg:text-4xl mb-10 text-amber-600 drop-shadow-lg h-12 flex justify-center items-center"
          >
            <span className="text-orange-200 font-medium">
              <TypeWriter
                options={{
                  strings: [
                    "Software Engineer",
                    "Full Stack Developer",
                    "Web Developer",
                    "Problem Solver",
                    "Learning Enthusiast",
                  ],
                  loop: true,
                  autoStart: true,
                  delay: 75,
                  deleteSpeed: 50,
                }}
              />
            </span>
          </h2>
        </div>
      </div>
      <div
        ref={chevronRef}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer z-30"
      >
        <p className="w-full h-10 text-yellow animate-bounce">
          Scroll to explore
        </p>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-yellow/20 rounded-full animate-ping" />
      </div>
    </section>
  );
}
