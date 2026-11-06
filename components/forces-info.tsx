'use client';

import { motion } from 'framer-motion';
import { ShieldMark } from './icons';

const FORCES = [
  {
    name: 'Indian Army',
    role: 'Land-based warfare and territorial defense',
    highlights: 'Armoured Corps (T-90 Bhishma), Corps of Signals, Logistics',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  {
    name: 'Indian Air Force',
    role: 'Airspace security and aerial warfare',
    highlights: 'Air Defense Systems (S-400), Fighter Squadrons',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
  },
  {
    name: 'Indian Navy',
    role: 'Maritime security and force projection',
    highlights: 'Aircraft Carriers, Submarine Fleet, Marine Commandos',
    color: 'text-zinc-100',
    bg: 'bg-zinc-800/40',
    border: 'border-zinc-700/80',
  },
];

export function ForcesInfo() {
  return (
    <figure
      aria-labelledby="forces-title"
      className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 backdrop-blur-sm sm:p-7 shadow-lg shadow-black/30"
    >
      <figcaption className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
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
            className={`rounded-lg border ${force.border} ${force.bg} p-4`}
          >
            <h3 className={`text-sm font-bold uppercase tracking-wider ${force.color}`}>
              {force.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-zinc-200">{force.role}</p>
            <p className="mt-2 text-xs text-zinc-400">
              <strong className="text-zinc-300">Key Elements:</strong> {force.highlights}
            </p>
          </motion.li>
        ))}
      </ul>
    </figure>
  );
}