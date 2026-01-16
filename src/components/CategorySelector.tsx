"use client";

import { useMemo, useState } from "react";
import { flowCategories } from "@/data";
import { getCategoryDisplayLabel } from "@/lib/labels";

type CategorySelectorProps = {
  value: string;
  onChange: (categoryId: string) => void;
};

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const [showMore, setShowMore] = useState(false);
  const shouldShowMore = showMore;
  const groups = useMemo(
    () =>
      flowCategories.reduce<Record<string, typeof flowCategories>>(
        (acc, category) => {
          acc[category.group] = [...(acc[category.group] ?? []), category];
          return acc;
        },
        {},
      ),
    [],
  );
  const visibleCategories = Object.entries(groups)
    .filter(([group]) => shouldShowMore || group === "Basic")
    .flatMap(([group, categories]) =>
      shouldShowMore || group !== "Basic"
        ? categories
        : categories.filter((category) => category.id !== "food"),
    );

  function handleToggleMore() {
    if (shouldShowMore) {
      setShowMore(false);
      return;
    }

    setShowMore(true);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
        Categoria
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {visibleCategories.map((category) => {
            const selected = category.id === value;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onChange(category.id)}
                className={`flex min-h-14 items-center rounded-2xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                  selected
                    ? "border-emerald-300 bg-emerald-300 text-neutral-950"
                    : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                }`}
              >
                {getCategoryDisplayLabel(category.id, category.label)}
              </button>
            );
          })}
          {!shouldShowMore ? (
            <button
              type="button"
              onClick={handleToggleMore}
              aria-label="Mostrar mais categorias"
              className="flex min-h-14 items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-left text-sm font-medium text-white transition hover:bg-white/10"
            >
              Outras categorias
            </button>
          ) : null}
        </div>
        {shouldShowMore ? (
          <button
            type="button"
            onClick={handleToggleMore}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Mostrar menos
          </button>
        ) : null}
      </div>
    </div>
  );
}
