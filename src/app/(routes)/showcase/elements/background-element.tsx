export default function BackgroundElements() {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
      <div
        className="absolute top-10 left-10 w-40 h-40 rounded-full bg-[#F9A826] blur-3xl"
      />
      <div
        className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#F9A826] blur-3xl"
      />
      <div
        className="absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-[#F9A826] blur-3xl"
      />
    </div>
  );
}
