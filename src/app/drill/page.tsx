import { AppShell } from "@/components/AppShell";
import { FlowPlayer } from "@/components/FlowPlayer";

type DrillPageProps = {
  searchParams: Promise<{ start?: string }>;
};

export default async function DrillPage({ searchParams }: DrillPageProps) {
  const { start } = await searchParams;

  return (
    <AppShell compact>
      <FlowPlayer autoStart={start === "1"} />
    </AppShell>
  );
}
