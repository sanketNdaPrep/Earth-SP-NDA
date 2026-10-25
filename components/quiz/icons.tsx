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

export function FlagIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M5 21V4m0 0h11l-2 4 2 4H5" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function ExpandIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );
}

export function CollapseIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
    </svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="M12 3 2.5 20h19z" />
      <path d="M12 10v4m0 3h.01" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...line} {...props}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <svg {...line} {...props} className={`motion-safe:animate-spin ${props.className ?? ''}`}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}