'use client';

import { motion } from 'framer-motion';
import { ShieldMark } from './icons';

const FORCES = [
  {
    name: 'Indian Army',
    role: 'Land-based warfare and territorial defense',
    highlights: 'Armoured Corps (T-90 Bhishma), Corps of Signals, Logistics',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/50',
  },
  {
    name: 'Indian Air Force',
    role: 'Airspace security and aerial warfare',
    highlights: 'Air Defense Systems (S-400), Fighter Squadrons',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/50',
  },
  {
    name: 'Indian Navy',
    role: 'Maritime security and force projection',
    highlights: 'Aircraft Carriers, Submarine Fleet, Marine Commandos',
    color: 'text-white',
    bg: 'bg-white/5',
    border: 'border-steel-600',
  },
];

export function ForcesInfo() {
  return (
    <figure
      aria-labelledby="forces-title"
      className="brackets border border-steel-700 bg-navy-900/80 p-5 backdrop-blur-sm sm:p-7"
    >
      <figcaption className="flex items-center gap-3 border-b border-steel-700/60 pb-4">
        <ShieldMark className="size-6 text-emerald-400" />
        <span id="forces-title" className="text-base font-semibold text-white">
          The Armed Forces
        </span>
      </figcaption>

      <ul className="mt-5 space-y-4">
        {FORCES.map((force, index) => (
          <motion.li
            key={force.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.15, duration: 0.4 }}
            className={`rounded-md border ${force.border} ${force.bg} p-4`}
          >
            <h3 className={`text-sm font-bold uppercase tracking-wider ${force.color}`}>
              {force.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-steel-100">{force.role}</p>
            <p className="mt-2 text-xs text-steel-300">
              <strong className="text-steel-400">Key Elements:</strong> {force.highlights}
            </p>
          </motion.li>
        ))}
      </ul>
    </figure>
  );
}