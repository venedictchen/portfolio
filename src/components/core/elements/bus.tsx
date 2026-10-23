export function Bus({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 72 40" aria-hidden="true">
      <rect x="2" y="3" width="66" height="28" rx="8" fill="#f9a826" />
      <rect x="9" y="9" width="12" height="9" rx="2" fill="#3a0f09" />
      <rect x="25" y="9" width="12" height="9" rx="2" fill="#3a0f09" />
      <rect x="41" y="9" width="12" height="9" rx="2" fill="#3a0f09" />
      <path d="M57 9h6.5a2 2 0 0 1 2 2v7h-8.5z" fill="#3a0f09" />
      <circle cx="18" cy="32" r="6" fill="#1f0705" />
      <circle cx="18" cy="32" r="2.2" fill="#fbebdd" />
      <circle cx="53" cy="32" r="6" fill="#1f0705" />
      <circle cx="53" cy="32" r="2.2" fill="#fbebdd" />
    </svg>
  );
}
