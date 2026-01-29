import { AppShell } from "@/components/AppShell";
import { SettingsPageContent } from "@/components/SettingsPageContent";

type SettingsPageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { from } = await searchParams;
  const resumeFromFlow = from === "flow";

  return (
    <AppShell compact>
      <SettingsPageContent
        resumeOnSave={resumeFromFlow}
        returnHref={resumeFromFlow ? "/drill?resume=1" : "/"}
        returnLabel={resumeFromFlow ? "Voltar ao treino" : "Voltar"}
      />
    </AppShell>
  );
}
