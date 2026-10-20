import { formatStamp } from './format';
import type { ActivityEvent, ActivityTone } from './types';

const DOT: Record<ActivityTone, string> = {
  ok: 'bg-emerald-400',
  info: 'bg-steel-300',
  highlight: 'bg-gold-400',
};

/** A plain vertical list of recent events. */
export function ActivityLog({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="px-5 py-8 text-sm text-steel-300 sm:px-6">
        No activity recorded yet. Test attempts, new cadets and published content will show up here.
      </p>
    );
  }

  return (
    <ol className="px-5 py-5 sm:px-6">
      {events.map((event, index) => (
        <li key={event.id} className="relative flex gap-4 pb-5 last:pb-0">
          {index < events.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-[5px] top-4 w-px bg-steel-700/70"
            />
          )}
          <span
            aria-hidden="true"
            className={`relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-navy-900 ${DOT[event.tone]}`}
          />
          <div className="min-w-0">
            <p className="text-sm leading-snug text-steel-100">
              <span className="sr-only">{event.label}: </span>
              {event.text}
            </p>
            <time dateTime={event.at} className="mt-0.5 block text-xs tabular-nums text-steel-300">
              {formatStamp(event.at)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}