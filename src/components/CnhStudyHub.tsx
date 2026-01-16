"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  BookOpen,
  BookmarkPlus,
  CheckCircle2,
  ClipboardList,
  Heart,
  Layers,
  ListChecks,
  Pause,
  Play,
  RotateCcw,
  Search,
  Signpost,
  Target,
} from "lucide-react";
import { Button } from "@/components/Button";
import { CnhPlateSign } from "@/components/CnhPlateSign";
import {
  cnhFullSimulationIds,
  cnhPlates,
  cnhQuickSimulationIds,
  cnhQuestions,
  cnhStudyPlan,
  type CnhPlate,
  type CnhPlateCategory,
  type CnhQuestion,
  type CnhTheme,
} from "@/data/cnh";

const CNH_PREPARE_SECONDS = 10;
const CNH_FLOW_INTERVAL_MS = 5500;
const plateCategories: Array<CnhPlateCategory | "Todas"> = [
  "Todas",
  "Regulamentação",
  "Advertência",
  "Indicação",
];

type CnhTab =
  | "flow"
  | "simulado"
  | "flashcards"
  | "placas"
  | "erradas"
  | "progresso"
  | "plano";

type CnhFlowState = "setup" | "preparing" | "running" | "paused" | "done";
type CnhSimulationMode = "aprender" | "prova";
type CnhFlowCategory = "geral" | CnhTheme;
type CnhFlowItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  category: CnhPlateCategory | CnhTheme;
  plate?: CnhPlate;
};

const tabs: Array<{ id: CnhTab; label: string; icon: ComponentType<{ size?: number }> }> = [
  { id: "flow", label: "Flow", icon: Play },
  { id: "simulado", label: "Simulado", icon: ClipboardList },
  { id: "flashcards", label: "Cards", icon: Layers },
  { id: "placas", label: "Placas", icon: Signpost },
  { id: "erradas", label: "Erradas", icon: RotateCcw },
  { id: "progresso", label: "Progresso", icon: Target },
  { id: "plano", label: "Plano", icon: BookOpen },
];

const themes = Array.from(new Set(cnhQuestions.map((question) => question.tema)));
const questionsById = new Map(cnhQuestions.map((question) => [question.id, question]));

const flowOptions: Array<{ id: CnhFlowCategory; label: string; description: string }> = [
  { id: "geral", label: "Geral", description: "Mistura placas e perguntas de todos os temas." },
  { id: "Placas", label: "Placas", description: "Regulamentação, advertência e indicação." },
  { id: "Legislação", label: "Legislação", description: "Regras, preferência e obrigações." },
  { id: "Direção defensiva", label: "Direção defensiva", description: "Risco, distância, chuva e cruzamentos." },
  { id: "Primeiros socorros", label: "Primeiros socorros", description: "Conduta inicial em acidentes." },
  { id: "Meio ambiente", label: "Meio ambiente", description: "Poluição e atitudes no trânsito." },
  { id: "Mecânica básica", label: "Mecânica básica", description: "Pneus, freios, luzes e manutenção." },
  { id: "Infrações", label: "Infrações", description: "Condutas proibidas e penalidades." },
];

function getCnhFlowItems(category: CnhFlowCategory): CnhFlowItem[] {
  const plateItems = cnhPlates.map((plate) => ({
    id: `plate-${plate.id}`,
    title: plate.nome,
    subtitle: plate.significado,
    meta: `${plate.codigo} · ${plate.categoria}`,
    category: plate.categoria,
    plate,
  }));

  const questionItems = cnhQuestions
    .filter((question) => category === "geral" || question.tema === category)
    .map((question) => ({
      id: `question-${question.id}`,
      title: question.enunciado,
      subtitle: question.explicacaoSimples,
      meta: `${question.tema} · ${question.dificuldade}`,
      category: question.tema,
    }));

  if (category === "geral") return [...plateItems, ...questionItems];
  if (category === "Placas") return [...plateItems, ...questionItems];
  return questionItems;
}

function shuffleCnhFlowItems(items: CnhFlowItem[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function CnhStudyHub() {
  const [tab, setTab] = useState<CnhTab>("flow");
  const [simulationQuestionIds, setSimulationQuestionIds] = useState(cnhQuickSimulationIds);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [simulationTitle, setSimulationTitle] = useState("Simulado rápido");
  const [simulationMode, setSimulationMode] = useState<CnhSimulationMode>("aprender");
  const [proofFinished, setProofFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);
  const [reviewQuestionIds, setReviewQuestionIds] = useState<string[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [showCardAnswer, setShowCardAnswer] = useState(false);
  const [flowIndex, setFlowIndex] = useState(0);
  const [flowState, setFlowState] = useState<CnhFlowState>("setup");
  const [flowCategory, setFlowCategory] = useState<CnhFlowCategory>("geral");
  const [shuffledFlowItems, setShuffledFlowItems] = useState<CnhFlowItem[]>(() =>
    getCnhFlowItems("geral"),
  );
  const [prepareRemaining, setPrepareRemaining] = useState(CNH_PREPARE_SECONDS);
  const [plateFilter, setPlateFilter] = useState<CnhPlateCategory | "Todas">("Todas");
  const [plateSearch, setPlateSearch] = useState("");
  const [favoritePlateIds, setFavoritePlateIds] = useState<string[]>([]);
  const [reviewItemIds, setReviewItemIds] = useState<string[]>([]);
  const [studiedPlateIds, setStudiedPlateIds] = useState<string[]>([]);

  const simulationQuestions = simulationQuestionIds
    .map((id) => questionsById.get(id))
    .filter((question): question is CnhQuestion => Boolean(question));
  const currentQuestion = simulationQuestions[simulationIndex] ?? simulationQuestions[0];
  const currentCard = cnhQuestions[cardIndex];
  const selectedFlowItems = useMemo(() => getCnhFlowItems(flowCategory), [flowCategory]);
  const activeFlowItems = flowState === "setup" ? selectedFlowItems : shuffledFlowItems;
  const allFlowItems = useMemo(() => getCnhFlowItems("geral"), []);
  const wrongQuestions = cnhQuestions.filter((question) =>
    wrongQuestionIds.includes(question.id),
  );
  const reviewQuestions = cnhQuestions.filter((question) =>
    reviewQuestionIds.includes(question.id),
  );
  const reviewItems = allFlowItems.filter((item) => reviewItemIds.includes(item.id));

  const filteredPlates = useMemo(() => {
    const query = normalizeText(plateSearch.trim());

    return cnhPlates.filter((plate) => {
      const matchesCategory = plateFilter === "Todas" || plate.categoria === plateFilter;
      const matchesSearch =
        query.length === 0 ||
        normalizeText(plate.nome).includes(query) ||
        normalizeText(plate.significado).includes(query) ||
        normalizeText(plate.codigo).includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [plateFilter, plateSearch]);

  const favoritePlates = cnhPlates.filter((plate) => favoritePlateIds.includes(plate.id));

  const progressByTheme = useMemo(
    () =>
      themes.map((theme) => {
        const themeQuestions = cnhQuestions.filter((question) => question.tema === theme);
        const answered = themeQuestions.filter((question) => question.id in answeredQuestions);
        const correct = answered.filter((question) => answeredQuestions[question.id]);
        const percentage =
          themeQuestions.length === 0
            ? 0
            : Math.round((correct.length / themeQuestions.length) * 100);

        return {
          label: theme,
          answered: answered.length,
          total: themeQuestions.length,
          percentage,
        };
      }),
    [answeredQuestions],
  );

  const progressByPlateCategory = useMemo(
    () =>
      plateCategories
        .filter((category): category is CnhPlateCategory => category !== "Todas")
        .map((category) => {
          const plates = cnhPlates.filter((plate) => plate.categoria === category);
          const studied = plates.filter((plate) => studiedPlateIds.includes(plate.id));

          return {
            label: category,
            answered: studied.length,
            total: plates.length,
            percentage: Math.round((studied.length / plates.length) * 100),
          };
        }),
    [studiedPlateIds],
  );

  const answeredCount = Object.keys(answeredQuestions).length;
  const correctCount = Object.values(answeredQuestions).filter(Boolean).length;
  const accuracy = answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);
  const reviewCount = reviewItemIds.length + wrongQuestionIds.length + reviewQuestionIds.length;
  const isFocusedPractice = tab === "flow" && flowState !== "setup" && flowState !== "done";

  function markItemStudied(item?: CnhFlowItem) {
    if (!item?.plate) return;

    setStudiedPlateIds((current) =>
      current.includes(item.plate!.id) ? current : [...current, item.plate!.id],
    );
  }

  useEffect(() => {
    if (tab !== "flow" || flowState !== "preparing") return;

    const timer = window.setInterval(() => {
      setPrepareRemaining((current) => Math.max(1, current - 1));
    }, 1000);

    const starter = window.setTimeout(() => {
      setFlowState("running");
      setPrepareRemaining(CNH_PREPARE_SECONDS);
    }, CNH_PREPARE_SECONDS * 1000);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(starter);
    };
  }, [flowState, tab]);

  useEffect(() => {
    if (tab !== "flow" || flowState !== "running") return;

    const timer = window.setInterval(() => {
      if (flowIndex >= activeFlowItems.length - 1) {
        window.clearInterval(timer);
        setFlowState("done");
        return;
      }

      const nextIndex = flowIndex + 1;
      setFlowIndex(nextIndex);
      markItemStudied(activeFlowItems[nextIndex]);
    }, CNH_FLOW_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [activeFlowItems, activeFlowItems.length, flowIndex, flowState, tab]);

  function answerQuestion(question: CnhQuestion, answerId: string) {
    const isCorrect = answerId === question.respostaCorreta;
    setSelectedAnswer(answerId);
    setAnsweredQuestions((current) => ({ ...current, [question.id]: isCorrect }));

    setWrongQuestionIds((current) => {
      if (isCorrect) return current.filter((id) => id !== question.id);
      return current.includes(question.id) ? current : [...current, question.id];
    });
  }

  function nextQuestion() {
    if (simulationMode === "prova" && simulationIndex >= simulationQuestions.length - 1) {
      setProofFinished(true);
      return;
    }

    setSelectedAnswer(null);
    setSimulationIndex((current) =>
      current >= simulationQuestions.length - 1 ? 0 : current + 1,
    );
  }

  function startSimulation(ids: string[], title: string, mode: CnhSimulationMode = simulationMode) {
    setSimulationQuestionIds(ids);
    setSimulationTitle(title);
    setSimulationMode(mode);
    setSimulationIndex(0);
    setSelectedAnswer(null);
    setProofFinished(false);
  }

  function startThemeReview(theme: CnhTheme) {
    startSimulation(
      cnhQuestions.filter((question) => question.tema === theme).map((question) => question.id),
      `Revisão: ${theme}`,
      "aprender",
    );
  }

  function startWrongReview() {
    startSimulation(wrongQuestionIds.length > 0 ? wrongQuestionIds : cnhQuickSimulationIds, "Revisão das erradas", "aprender");
  }

  function startWeakThemeReview() {
    const weakThemes = progressByTheme
      .filter((item) => item.answered > 0 && item.percentage < 70)
      .map((item) => item.label as CnhTheme);
    const fallbackThemes = weakThemes.length > 0 ? weakThemes : (themes.slice(0, 2) as CnhTheme[]);
    const ids = cnhQuestions
      .filter((question) => fallbackThemes.includes(question.tema))
      .map((question) => question.id);

    startSimulation(ids, "Temas para reforçar", "aprender");
  }

  function markQuestionReviewLater(question: CnhQuestion) {
    setReviewQuestionIds((current) =>
      current.includes(question.id) ? current : [...current, question.id],
    );
  }

  function nextCard() {
    setShowCardAnswer(false);
    setCardIndex((current) => (current + 1) % cnhQuestions.length);
  }

  function startCnhFlow() {
    const nextItems = shuffleCnhFlowItems(selectedFlowItems);
    setShuffledFlowItems(nextItems);
    setFlowIndex(0);
    setPrepareRemaining(CNH_PREPARE_SECONDS);
    setFlowState("preparing");
    markItemStudied(nextItems[0]);
  }

  function nextFlowItem() {
    if (flowIndex >= activeFlowItems.length - 1) {
      setFlowState("done");
      return;
    }

    const nextIndex = flowIndex + 1;
    setFlowIndex(nextIndex);
    markItemStudied(activeFlowItems[nextIndex]);
  }

  function previousFlowItem() {
    setFlowIndex((current) => Math.max(0, current - 1));
  }

  function toggleFavoritePlate(plateId: string) {
    setFavoritePlateIds((current) =>
      current.includes(plateId)
        ? current.filter((id) => id !== plateId)
        : [...current, plateId],
    );
  }

  function markReviewLater(item: CnhFlowItem) {
    setReviewItemIds((current) => (current.includes(item.id) ? current : [...current, item.id]));
    nextFlowItem();
  }

  function refazerRevisao() {
    setTab("flow");
    setFlowCategory("geral");
    setFlowIndex(0);
    setFlowState("setup");
  }

  return (
    <div className="space-y-6">
      {!isFocusedPractice ? (
        <>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
              CNH
            </p>
            <h1 className="text-4xl font-semibold tracking-normal">Estudo para prova teórica.</h1>
            <p className="text-sm leading-6 text-white/60">
              Treine placas, revise erros e acompanhe o que precisa voltar depois.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {tabs.map((item) => {
              const Icon = item.icon;
              const selected = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-xs font-semibold transition ${
                    selected
                      ? "border-emerald-200 bg-emerald-300 text-neutral-950 shadow-[0_0_0_2px_rgba(167,243,208,0.45)]"
                      : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {tab === "flow" ? (
        <CnhFlowPanel
          flowState={flowState}
          flowIndex={flowIndex}
          flowItems={activeFlowItems}
          flowCategory={flowCategory}
          prepareRemaining={prepareRemaining}
          onSelectFlow={(category) => {
            setFlowCategory(category);
            setShuffledFlowItems(getCnhFlowItems(category));
            setFlowIndex(0);
            setFlowState("setup");
          }}
          onStart={startCnhFlow}
          onPause={() => setFlowState("paused")}
          onResume={() => setFlowState("running")}
          onPrevious={previousFlowItem}
          onReviewLater={markReviewLater}
          onReset={() => {
            setFlowIndex(0);
            setFlowState("setup");
          }}
        />
      ) : null}

      {tab === "simulado" ? (
        <SimulationPanel
          title={simulationTitle}
          question={currentQuestion}
          questionIds={simulationQuestionIds}
          currentIndex={simulationIndex}
          total={simulationQuestions.length}
          mode={simulationMode}
          proofFinished={proofFinished}
          selectedAnswer={selectedAnswer}
          answeredQuestions={answeredQuestions}
          progressByTheme={progressByTheme}
          onAnswer={answerQuestion}
          onNext={nextQuestion}
          onMarkReviewLater={markQuestionReviewLater}
          onStartFull={() => startSimulation(cnhFullSimulationIds, "Simulado completo", "prova")}
          onStartQuick={() => startSimulation(cnhQuickSimulationIds, "Simulado rápido", "aprender")}
          onSetMode={(mode) => startSimulation(simulationQuestionIds, mode === "prova" ? "Modo Prova" : "Modo Aprender", mode)}
          onStartTheme={startThemeReview}
          onStartWrong={startWrongReview}
          onStartWeak={startWeakThemeReview}
        />
      ) : null}

      {tab === "flashcards" ? (
        <section className="rounded-[2rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            {currentCard.tema} · {currentCard.dificuldade}
          </p>
          <h2 className="mt-4 text-2xl font-semibold">{currentCard.enunciado}</h2>
          {showCardAnswer ? (
            <p className="mt-4 text-sm leading-6 text-white/65">{currentCard.explicacaoSimples}</p>
          ) : null}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCardAnswer((current) => !current)}
            >
              {showCardAnswer ? "Ocultar" : "Virar"}
            </Button>
            <Button type="button" onClick={nextCard}>
              Próximo
            </Button>
          </div>
        </section>
      ) : null}

      {tab === "placas" ? (
        <PlateStudyPanel
          filteredPlates={filteredPlates}
          favoritePlates={favoritePlates}
          favoritePlateIds={favoritePlateIds}
          plateFilter={plateFilter}
          plateSearch={plateSearch}
          onFilterChange={setPlateFilter}
          onSearchChange={setPlateSearch}
          onToggleFavorite={toggleFavoritePlate}
        />
      ) : null}

      {tab === "erradas" ? (
        <ReviewPanel
          wrongQuestions={wrongQuestions}
          reviewQuestions={reviewQuestions}
          reviewItems={reviewItems}
          onRetry={refazerRevisao}
        />
      ) : null}

      {tab === "progresso" ? (
        <ProgressPanel
          totalPlatesStudied={studiedPlateIds.length}
          accuracy={accuracy}
          reviewCount={reviewCount}
          progressByTheme={progressByTheme}
          progressByPlateCategory={progressByPlateCategory}
        />
      ) : null}

      {tab === "plano" ? (
        <section className="space-y-4">
          <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
              Plano simples
            </p>
            <h2 className="mt-2 text-2xl font-semibold">15 minutos por dia.</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Comece por regulamentação, avance para advertência, depois indicação e finalize com simulado completo.
            </p>
          </div>
          {cnhStudyPlan.map((item) => (
            <div
              key={item.day}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
                {item.day}
              </p>
              <p className="mt-2 text-lg font-semibold">{item.focus}</p>
              <p className="mt-1 text-sm leading-6 text-white/60">{item.task}</p>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function CnhFlowPanel({
  flowState,
  flowIndex,
  flowItems,
  flowCategory,
  prepareRemaining,
  onSelectFlow,
  onStart,
  onPause,
  onResume,
  onPrevious,
  onReviewLater,
  onReset,
}: {
  flowState: CnhFlowState;
  flowIndex: number;
  flowItems: CnhFlowItem[];
  flowCategory: CnhFlowCategory;
  prepareRemaining: number;
  onSelectFlow: (category: CnhFlowCategory) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onPrevious: () => void;
  onReviewLater: (item: CnhFlowItem) => void;
  onReset: () => void;
}) {
  const item = flowItems[flowIndex] ?? flowItems[0];
  const selectedOption = flowOptions.find((option) => option.id === flowCategory) ?? flowOptions[0];
  const progress = Math.round(((flowIndex + 1) / flowItems.length) * 100);

  if (flowState === "setup") {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-black/20 p-4 shadow-2xl shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
          Flow CNH
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-normal">
          Escolha um Flow para treinar.
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Use o geral para misturar tudo ou entre direto em uma categoria específica da prova.
        </p>
        <div className="mt-5 grid gap-2">
          {flowOptions.map((option) => {
            const selected = option.id === flowCategory;
            const total = getCnhFlowItems(option.id).length;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectFlow(option.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-emerald-200 bg-emerald-300 text-neutral-950 shadow-[0_0_0_2px_rgba(167,243,208,0.45)]"
                    : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span className="text-xs font-semibold opacity-60">{total}</span>
                </span>
                <span className="mt-1 block text-xs leading-5 opacity-65">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <div>
            <p className="text-2xl font-semibold">{flowItems.length}</p>
            <p className="mt-1 text-xs text-white/45">itens</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">5s</p>
            <p className="mt-1 text-xs text-white/45">por item</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">10s</p>
            <p className="mt-1 text-xs text-white/45">preparo</p>
          </div>
        </div>
        <Button type="button" className="mt-6 w-full gap-2" onClick={onStart}>
          <Play aria-hidden="true" size={18} strokeWidth={2.4} />
          Iniciar {selectedOption.label}
        </Button>
      </section>
    );
  }

  if (flowState === "preparing") {
    return (
      <section className="flex min-h-[30rem] flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-black/20 p-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
          Se prepare
        </p>
        <h2 className="mt-5 text-7xl font-semibold tracking-normal">
          {prepareRemaining}
        </h2>
      </section>
    );
  }

  if (flowState === "done") {
    return (
      <section className="flex min-h-[30rem] flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-black/20 p-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/70">
          Concluído
        </p>
        <h2 className="mt-4 text-5xl font-semibold tracking-normal">
          Flow finalizado
        </h2>
        <p className="mt-4 text-sm text-white/60">
          {flowItems.length} itens revisados em {selectedOption.label}.
        </p>
        <div className="mt-8 grid w-full gap-3">
          <Button type="button" onClick={onStart}>
            Começar de novo
          </Button>
          <Button type="button" variant="secondary" onClick={onReset}>
            Voltar
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[34rem] flex-col rounded-[2rem] border border-white/10 bg-black/20 p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-white/80">
          <span>{flowIndex + 1} de {flowItems.length}</span>
          <span className="text-xs uppercase tracking-[0.16em] text-emerald-100/70">
            {selectedOption.label}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-300 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-white/45">{item.meta}</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-1 py-8 text-center">
        {item.plate ? (
          <CnhPlateSign plate={item.plate} />
        ) : null}
        <h2 className={`${item.plate ? "mt-8" : "mt-0"} max-w-full text-balance text-4xl font-semibold leading-tight tracking-normal`}>
          {item.title}
        </h2>
        <p className="mt-5 max-w-sm text-base leading-7 text-emerald-100/70">
          {item.subtitle}
        </p>
      </div>

      <div className="grid shrink-0 grid-cols-[1fr_auto_auto] gap-3 border-t border-white/10 pt-4 pb-2">
        {flowState === "running" ? (
          <Button type="button" variant="secondary" className="gap-2" onClick={onPause}>
            <Pause aria-hidden="true" size={18} strokeWidth={2.4} />
            Pausar
          </Button>
        ) : (
          <Button type="button" variant="secondary" className="gap-2" onClick={onResume}>
            <Play aria-hidden="true" size={18} strokeWidth={2.4} />
            Continuar
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          className="w-14 px-0"
          onClick={onPrevious}
          aria-label="Voltar para item anterior"
          title="Voltar"
        >
          <RotateCcw aria-hidden="true" size={18} strokeWidth={2.4} />
          <span className="sr-only">Voltar para item anterior</span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-14 px-0"
          onClick={() => onReviewLater(item)}
          aria-label="Revisar depois"
          title="Revisar depois"
        >
          <BookmarkPlus aria-hidden="true" size={18} strokeWidth={2.4} />
          <span className="sr-only">Revisar depois</span>
        </Button>
        <Button type="button" variant="ghost" className="col-span-3" onClick={onReset}>
          Finalizar treino
        </Button>
      </div>
    </section>
  );
}

function PlateStudyPanel({
  filteredPlates,
  favoritePlates,
  favoritePlateIds,
  plateFilter,
  plateSearch,
  onFilterChange,
  onSearchChange,
  onToggleFavorite,
}: {
  filteredPlates: CnhPlate[];
  favoritePlates: CnhPlate[];
  favoritePlateIds: string[];
  plateFilter: CnhPlateCategory | "Todas";
  plateSearch: string;
  onFilterChange: (category: CnhPlateCategory | "Todas") => void;
  onSearchChange: (value: string) => void;
  onToggleFavorite: (plateId: string) => void;
}) {
  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-white/10 bg-black/20 p-4">
        <div className="relative">
          <Search
            aria-hidden="true"
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
          />
          <input
            value={plateSearch}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar placa pelo nome..."
            className="min-h-12 w-full rounded-full border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-white/35 focus:border-emerald-200 focus:bg-white/[0.07]"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {plateCategories.map((category) => {
            const selected = category === plateFilter;

            return (
              <button
                key={category}
                type="button"
                onClick={() => onFilterChange(category)}
                className={`min-h-11 rounded-full border px-3 text-xs font-semibold transition ${
                  selected
                    ? "border-emerald-200 bg-emerald-300 text-neutral-950 shadow-[0_0_0_2px_rgba(167,243,208,0.35)]"
                    : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Minhas placas favoritas</h2>
          <span className="text-sm text-white/45">{favoritePlates.length}</span>
        </div>
        {favoritePlates.length === 0 ? (
          <EmptyState text="Favorite as placas difíceis para revisar mais rápido." />
        ) : (
          <div className="grid gap-3">
            {favoritePlates.map((plate) => (
              <PlateCard
                key={plate.id}
                plate={plate}
                isFavorite
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Todas as placas</h2>
          <span className="text-sm text-white/45">{filteredPlates.length}</span>
        </div>
        <div className="grid gap-3">
          {filteredPlates.map((plate) => (
            <PlateCard
              key={plate.id}
              plate={plate}
              isFavorite={favoritePlateIds.includes(plate.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlateCard({
  plate,
  isFavorite,
  onToggleFavorite,
}: {
  plate: CnhPlate;
  isFavorite: boolean;
  onToggleFavorite: (plateId: string) => void;
}) {
  return (
    <article className="grid grid-cols-[4.5rem_1fr_auto] gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-center rounded-2xl border border-emerald-300/20 bg-white/[0.03]">
        <CnhPlateSign plate={plate} compact />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{plate.nome}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/40">
          {plate.categoria}
        </p>
        <p className="mt-2 text-sm leading-5 text-white/65">{plate.significado}</p>
      </div>
      <button
        type="button"
        onClick={() => onToggleFavorite(plate.id)}
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
          isFavorite
            ? "border-emerald-200 bg-emerald-300 text-neutral-950"
            : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10"
        }`}
      >
        <Heart aria-hidden="true" size={17} fill={isFavorite ? "currentColor" : "none"} />
      </button>
    </article>
  );
}

function ReviewPanel({
  wrongQuestions,
  reviewQuestions,
  reviewItems,
  onRetry,
}: {
  wrongQuestions: CnhQuestion[];
  reviewQuestions: CnhQuestion[];
  reviewItems: CnhFlowItem[];
  onRetry: () => void;
}) {
  const hasReview = wrongQuestions.length > 0 || reviewQuestions.length > 0 || reviewItems.length > 0;

  return (
    <section className="space-y-4">
      {hasReview ? (
        <Button type="button" className="w-full gap-2" onClick={onRetry}>
          <RotateCcw aria-hidden="true" size={18} strokeWidth={2.4} />
          Refazer revisão
        </Button>
      ) : null}

      {!hasReview ? (
        <EmptyState text="Você ainda não tem itens para revisar." />
      ) : (
        <div className="grid gap-3">
          {wrongQuestions.map((question) => (
            <ReviewCard key={question.id} question={question} />
          ))}
          {reviewQuestions.map((question) => (
            <ReviewCard key={`review-${question.id}`} question={question} label="Revisar depois" />
          ))}
          {reviewItems.map((item) => (
            <article
              key={item.id}
              className="grid grid-cols-[4.5rem_1fr] gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="flex items-center justify-center rounded-2xl border border-emerald-300/20 bg-white/[0.03]">
                {item.plate ? (
                  <CnhPlateSign plate={item.plate} compact />
                ) : (
                  <BookmarkPlus size={22} className="text-emerald-100/70" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/60">
                  Marcado para revisar
                </p>
                <h3 className="mt-1 text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-5 text-white/65">{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ProgressPanel({
  totalPlatesStudied,
  accuracy,
  reviewCount,
  progressByTheme,
  progressByPlateCategory,
}: {
  totalPlatesStudied: number;
  accuracy: number;
  reviewCount: number;
  progressByTheme: Array<{ label: string; answered: number; total: number; percentage: number }>;
  progressByPlateCategory: Array<{ label: string; answered: number; total: number; percentage: number }>;
}) {
  return (
    <section className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        <MetricCard label="Placas estudadas" value={String(totalPlatesStudied)} />
        <MetricCard label="Acertos" value={`${accuracy}%`} />
        <MetricCard label="Revisar" value={String(reviewCount)} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Progresso por categoria</h2>
        {[...progressByPlateCategory, ...progressByTheme].map((item) => (
          <ProgressRow key={item.label} item={item} />
        ))}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-4 text-white/45">{label}</p>
    </div>
  );
}

function ProgressRow({
  item,
}: {
  item: { label: string; answered: number; total: number; percentage: number };
}) {
  const status =
    item.answered === 0
      ? "não iniciado"
      : item.percentage >= 80
        ? "bom desempenho"
        : item.percentage < 60
          ? "precisa revisar"
          : "em estudo";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{item.label}</p>
        <p className="text-sm text-white/60">{item.total} perguntas</p>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold uppercase tracking-[0.14em] text-emerald-100/60">
          {status}
        </span>
        <span className="text-white/45">
          {item.answered}/{item.total} respondidas · {item.percentage}%
        </span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-300"
          style={{ width: `${item.percentage}%` }}
        />
      </div>
    </div>
  );
}

function SimulationPanel({
  title,
  question,
  questionIds,
  currentIndex,
  total,
  mode,
  proofFinished,
  selectedAnswer,
  answeredQuestions,
  progressByTheme,
  onAnswer,
  onNext,
  onMarkReviewLater,
  onStartFull,
  onStartQuick,
  onSetMode,
  onStartTheme,
  onStartWrong,
  onStartWeak,
}: {
  title: string;
  question: CnhQuestion;
  questionIds: string[];
  currentIndex: number;
  total: number;
  mode: CnhSimulationMode;
  proofFinished: boolean;
  selectedAnswer: string | null;
  answeredQuestions: Record<string, boolean>;
  progressByTheme: Array<{ label: string; answered: number; total: number; percentage: number }>;
  onAnswer: (question: CnhQuestion, answerId: string) => void;
  onNext: () => void;
  onMarkReviewLater: (question: CnhQuestion) => void;
  onStartFull: () => void;
  onStartQuick: () => void;
  onSetMode: (mode: CnhSimulationMode) => void;
  onStartTheme: (theme: CnhTheme) => void;
  onStartWrong: () => void;
  onStartWeak: () => void;
}) {
  const correctTotal = questionIds.filter((id) => answeredQuestions[id]).length;

  if (mode === "prova" && proofFinished) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-black/20 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
          Resultado
        </p>
        <h2 className="mt-3 text-5xl font-semibold">{correctTotal}/{total}</h2>
        <p className="mt-3 text-sm leading-6 text-white/65">
          Resultado do modo prova. Agora revise as erradas no modo aprender.
        </p>
        <div className="mt-6 grid gap-3">
          <Button type="button" onClick={onStartFull}>Refazer prova</Button>
          <Button type="button" variant="secondary" onClick={onStartWrong}>Revisar erradas</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
          Simulado
        </p>
        <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-white/60">
          {currentIndex + 1} de {total} · questões misturadas por tema.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSetMode("aprender")}
            className={`min-h-11 rounded-full border px-3 text-sm font-semibold ${
              mode === "aprender"
                ? "border-emerald-200 bg-emerald-300 text-neutral-950"
                : "border-white/10 bg-white/[0.04] text-white"
            }`}
          >
            Modo Aprender
          </button>
          <button
            type="button"
            onClick={() => onSetMode("prova")}
            className={`min-h-11 rounded-full border px-3 text-sm font-semibold ${
              mode === "prova"
                ? "border-emerald-200 bg-emerald-300 text-neutral-950"
                : "border-white/10 bg-white/[0.04] text-white"
            }`}
          >
            Modo Prova
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" onClick={onStartFull}>
            30 questões
          </Button>
          <Button type="button" variant="secondary" onClick={onStartQuick}>
            10 questões
          </Button>
          <Button type="button" variant="secondary" onClick={onStartWrong}>
            Erradas
          </Button>
          <Button type="button" variant="secondary" onClick={onStartWeak}>
            Menor desempenho
          </Button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          Revisão por tema
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {themes.map((theme) => {
            const item = progressByTheme.find((progress) => progress.label === theme);

            return (
              <button
                key={theme}
                type="button"
                onClick={() => onStartTheme(theme)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left text-xs font-semibold text-white transition hover:bg-white/10"
              >
                <span className="block">{theme}</span>
                <span className="mt-1 block text-white/45">
                  {item?.total ?? 0} perguntas · {item?.percentage ?? 0}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <QuestionPanel
        question={question}
        questionNumber={currentIndex + 1}
        total={total}
        mode={mode}
        selectedAnswer={selectedAnswer}
        onAnswer={onAnswer}
        onNext={onNext}
        onMarkReviewLater={onMarkReviewLater}
      />
    </section>
  );
}

function QuestionPanel({
  question,
  questionNumber,
  total,
  mode,
  selectedAnswer,
  onAnswer,
  onNext,
  onMarkReviewLater,
}: {
  question: CnhQuestion;
  questionNumber: number;
  total: number;
  mode: CnhSimulationMode;
  selectedAnswer: string | null;
  onAnswer: (question: CnhQuestion, answerId: string) => void;
  onNext: () => void;
  onMarkReviewLater: (question: CnhQuestion) => void;
}) {
  const hasAnswered = selectedAnswer !== null;
  const correct = selectedAnswer === question.respostaCorreta;
  const correctAnswer = question.alternativas.find(
    (answer) => answer.id === question.respostaCorreta,
  );
  const showLearning = hasAnswered && mode === "aprender";

  return (
    <section className="rounded-[2rem] border border-white/10 bg-black/20 p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            {question.tema} · {question.subtema}
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            {questionNumber}/{total}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-300"
            style={{ width: `${Math.round((questionNumber / total) * 100)}%` }}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          {mode === "prova" ? "Modo Prova" : "Modo Aprender"}
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          {question.dificuldade}
        </p>
      </div>
      <h2 className="mt-4 text-2xl font-semibold leading-tight">{question.enunciado}</h2>
      <div className="mt-5 grid gap-2">
        {question.alternativas.map((answer) => {
          const selected = selectedAnswer === answer.id;
          const isCorrect = answer.id === question.respostaCorreta;

          return (
            <button
              key={answer.id}
              type="button"
              disabled={hasAnswered}
              onClick={() => onAnswer(question, answer.id)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                mode === "aprender" && selected && isCorrect
                  ? "border-emerald-300 bg-emerald-300 text-neutral-950"
                  : mode === "aprender" && selected
                    ? "border-red-300 bg-red-300/20 text-white"
                    : selected
                      ? "border-emerald-200 bg-white/15 text-white"
                    : "border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
              }`}
            >
              {answer.texto}
            </button>
          );
        })}
      </div>
      {hasAnswered ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 size={18} className={correct ? "text-emerald-200" : "text-red-200"} />
            {mode === "prova" ? "Resposta salva" : correct ? "Correto" : "Incorreto"}
          </div>
          {showLearning ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-white">Resposta correta</p>
                <p className="mt-1 text-sm leading-6 text-emerald-100/75">
                  {question.respostaCorreta.toUpperCase()}) {correctAnswer?.texto}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Explicação simples</p>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  {question.explicacaoSimples}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Por que as outras estão erradas</p>
                <div className="mt-2 grid gap-2">
                  {question.alternativas
                    .filter((answer) => answer.id !== question.respostaCorreta)
                    .map((answer) => (
                      <p key={answer.id} className="rounded-2xl bg-black/20 px-3 py-2 text-sm leading-5 text-white/60">
                        <span className="font-semibold text-white/80">{answer.id.toUpperCase()})</span>{" "}
                        {question.porqueAsOutrasEstaoErradas[answer.id]}
                      </p>
                    ))}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                <p className="text-sm font-semibold text-emerald-50">Macete</p>
                <p className="mt-1 text-sm leading-5 text-emerald-50/75">{question.macete}</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-white/65">
              No modo prova, o resultado completo aparece no final.
            </p>
          )}
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full gap-2"
            onClick={() => onMarkReviewLater(question)}
          >
            <BookmarkPlus aria-hidden="true" size={18} strokeWidth={2.4} />
            Revisar depois
          </Button>
          <Button type="button" className="mt-4 w-full" onClick={onNext}>
            Próxima
          </Button>
        </div>
      ) : null}
    </section>
  );
}

function ReviewCard({ question, label = "Pergunta errada" }: { question: CnhQuestion; label?: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
        {label} · {question.tema}
      </p>
      <h3 className="mt-2 text-base font-semibold">{question.enunciado}</h3>
      <p className="mt-2 text-sm leading-6 text-white/65">{question.explicacaoSimples}</p>
    </article>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
      <ListChecks className="mx-auto text-emerald-100/70" size={24} />
      <p className="mt-3 text-sm font-medium text-white/70">{text}</p>
    </div>
  );
}
