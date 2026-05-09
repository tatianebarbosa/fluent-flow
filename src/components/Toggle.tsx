"use client";

type ToggleProps = {
  checked: boolean;
  label: string;
  description?: string;
  onChange: (checked: boolean) => void;
};

export function Toggle({
  checked,
  label,
  description,
  onChange,
}: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{label}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-white/50">{description}</span>
        ) : null}
      </span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative h-7 w-12 shrink-0 rounded-full border border-white/10 bg-white/10 transition peer-checked:bg-emerald-400">
        <span
          className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
    </label>
  );
}
