export function Logo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M6 26V8C6 6.89543 6.89543 6 8 6H24C25.1046 6 26 6.89543 26 8V26L20 22L16 26L12 22L6 26Z"
        fill="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
       <path
        d="M12 12H20"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
       <path
        d="M12 16H20"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
