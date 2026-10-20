import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const line = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6z" />
      <path d="m8.8 12.2 2.3 2.3 4.2-4.6" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.4-3.2 2.6-5 5.5-5s5.1 1.8 5.5 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16.5 14.2c2.4.2 3.8 1.7 4 4.3" />
    </svg>
  );
}

export function BookStackIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5z" />
      <path d="M5 18.5A1.5 1.5 0 0 0 6.5 20H19v-3" />
      <path d="M9 8h6" />
    </svg>
  );
}

export function ClipboardCheckIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <rect x="5" y="4.5" width="14" height="16" rx="2" />
      <path d="M9 4.5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v.5" />
      <path d="m9 13 2 2 4-4.5" />
    </svg>
  );
}

export function LifebuoyIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="m6 6 3.5 3.5M14.5 14.5 18 18M18 6l-3.5 3.5M9.5 14.5 6 18" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M10 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H10" />
      <path d="m15 8 4 4-4 4M19 12H9" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}