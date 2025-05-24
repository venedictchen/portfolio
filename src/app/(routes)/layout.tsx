"use client";

import { Footer, Navbar, useIsLoaded } from "@/components";

const LoadingComponent = () => {
  return (
    <div
      className={
        "w-full h-screen bg-black flex justify-center items-center z-[110] transition-all duration-1000 ease-in-out"
      }
    ></div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoaded } = useIsLoaded();

  return (
    <div
      className={`relative transition-all ease-in-out duration-1000 min-h-screen ${
        !isLoaded ? "overflow-clip" : ""
      } `}
    >
      <div
        className={`transition-all duration-1000 fixed inset-0 z-[100] bg-white w-screen h-screen ${
          !isLoaded ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <LoadingComponent />
      </div>
      <Navbar />
      <main className="w-full min-h-screen">{children}</main>
      <Footer />
    </div>
  );
}
