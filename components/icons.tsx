import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const line = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export function ShieldMark(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" {...props}>
      <path d="M32 4 56 13v18c0 15-10 25-24 29C18 56 8 46 8 31V13z" fill="currentColor" />
      <path
        d="M32 17l4 9 10 1-7.5 6.5 2.3 9.8L32 38l-8.8 5.3 2.3-9.8L18 27l10-1z"
        fill="#e9bb4e"
      />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function CrossIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

export function ExternalIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}