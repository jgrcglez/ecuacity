import Image from "next/image";

interface ShieldBookProps {
  className?: string;
  size?: number;
}

export function ShieldBook({ className, size }: ShieldBookProps) {
  const px = size ?? 48;
  return (
    <Image
      src="/logo.png"
      alt="Ecuacity"
      width={459}
      height={554}
      className={className}
      style={{ height: px, width: "auto" }}
    />
  );
}
