"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FlowSettingsForm } from "@/components/FlowSettingsForm";
import { Button } from "@/components/Button";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <AppShell compact>
      <div className="space-y-6 pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
            Ajustes
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal">
            Ajuste seu treino.
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Escolha categoria, nível, duração, intervalo, português abaixo,
            modo de prática e exibição opcional do tempo.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/20 p-4 shadow-2xl shadow-black/30 backdrop-blur">
          <FlowSettingsForm
            actionLabel="Salvar ajustes"
            onSaved={() => router.push("/drill")}
          />
        </div>

        <Button href="/drill" variant="secondary" className="w-full">
          Voltar ao treino
        </Button>
      </div>
    </AppShell>
  );
}
