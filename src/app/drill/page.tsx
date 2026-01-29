import { AppShell } from "@/components/AppShell";
import { FlowPlayer } from "@/components/FlowPlayer";

type DrillPageProps = {
  searchParams: Promise<{ resume?: string; start?: string }>;
};

export default async function DrillPage({ searchParams }: DrillPageProps) {
  const { resume, start } = await searchParams;

  return (
    <AppShell compact>
      <FlowPlayer autoStart={start === "1"} resumeSession={resume === "1"} />
    </AppShell>
  );
}
