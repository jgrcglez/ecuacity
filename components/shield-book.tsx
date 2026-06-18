interface ShieldBookProps {
  className?: string;
  size?: number;
}

export function ShieldBook({ className = "size-5", size }: ShieldBookProps) {
  const s = size ?? 20;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      viewBox="0 0 512 512"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003893" />
          <stop offset="35%" stopColor="#003893" />
          <stop offset="35%" stopColor="#FFD100" />
          <stop offset="65%" stopColor="#FFD100" />
          <stop offset="65%" stopColor="#ED1C24" />
          <stop offset="100%" stopColor="#ED1C24" />
        </linearGradient>
      </defs>
      <path
        d="M256 40 L420 110 L420 250 C420 360 340 450 256 478 C172 450 92 360 92 250 L92 110 Z"
        fill="url(#sb)"
        stroke="#003893"
        strokeWidth="6"
      />
      <rect x="236" y="170" width="40" height="160" rx="3" fill="#003893" />
      <path d="M236 170 L130 190 L130 340 L236 330 Z" fill="white" opacity="0.95" />
      <path d="M276 170 L382 190 L382 340 L276 330 Z" fill="white" opacity="0.95" />
      <line x1="155" y1="220" x2="220" y2="210" stroke="#003893" strokeWidth="2" opacity="0.4" />
      <line x1="155" y1="240" x2="220" y2="230" stroke="#003893" strokeWidth="2" opacity="0.4" />
      <line x1="155" y1="260" x2="220" y2="250" stroke="#003893" strokeWidth="2" opacity="0.4" />
      <line x1="155" y1="280" x2="220" y2="270" stroke="#003893" strokeWidth="2" opacity="0.4" />
      <line x1="155" y1="300" x2="220" y2="290" stroke="#003893" strokeWidth="2" opacity="0.4" />
      <line x1="292" y1="210" x2="357" y2="220" stroke="#003893" strokeWidth="2" opacity="0.4" />
      <line x1="292" y1="230" x2="357" y2="240" stroke="#003893" strokeWidth="2" opacity="0.4" />
      <line x1="292" y1="250" x2="357" y2="260" stroke="#003893" strokeWidth="2" opacity="0.4" />
      <line x1="292" y1="270" x2="357" y2="280" stroke="#003893" strokeWidth="2" opacity="0.4" />
      <line x1="292" y1="290" x2="357" y2="300" stroke="#003893" strokeWidth="2" opacity="0.4" />
    </svg>
  );
}
