import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="space-y-5">
          <div>
            <h1 className="text-6xl font-semibold leading-none tracking-normal">
              Fluent Flow
            </h1>
            <p className="mt-5 text-xl font-medium text-white/80">
              Crie fluência com repetição.
            </p>
          </div>
          <p className="text-base leading-7 text-white/60">
            Um treino simples para ouvir, repetir e entrar em fluxo. O tempo
            roda por dentro, enquanto o progresso avança automaticamente.
          </p>
        </div>

        <div className="grid gap-3">
          <Button href="/drill?start=1" className="w-full">
            Iniciar Flow
          </Button>
          <Button href="/cnh" variant="secondary" className="w-full">
            Estudar CNH
          </Button>
          <Button href="/settings" variant="secondary" className="w-full">
            Ajustes
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {["Ouvir", "Repetir", "Fluir"].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4"
            >
              <p className="text-sm font-semibold text-white">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
