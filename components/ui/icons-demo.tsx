import { Icons } from "@/components/ui/icons";

/** Dev-only gallery of every icon in the set. Not used on public pages. */
export default function IconsDemo() {
  return (
    <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Object.entries(Icons).map(([name, Icon]) => (
        <div
          key={name}
          className="flex flex-col items-center justify-center gap-3 rounded-panel border border-steel-700 bg-navy-900 p-4 text-steel-100 shadow-panel transition-colors duration-(--duration-base) ease-(--ease-standard) hover:bg-navy-800 hover:text-gold-300"
        >
          <Icon className="size-7" />
          <span className="font-mono text-xs font-medium text-steel-500">{name}</span>
        </div>
      ))}
    </div>
  );
}