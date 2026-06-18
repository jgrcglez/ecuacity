interface ShieldBookProps {
  className?: string;
  size?: number;
}

export function ShieldBook({ className = "size-12", size }: ShieldBookProps) {
  const px = size ?? 48;
  return (
    <img
      src="/logo.png"
      alt="Ecuacity"
      height={px}
      className={`w-auto ${className}`}
    />
  );
}
