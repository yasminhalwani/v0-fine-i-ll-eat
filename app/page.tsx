"use client";

import { useState, useEffect } from "react";
import { PreferencesForm, type MealPreferences } from "@/components/preferences-form";
import { WeeklyPlan, type DayPlan } from "@/components/weekly-plan";
import { Sparkles, Loader2, Info, ChevronRight, Check, Circle, Stethoscope, ClipboardList } from "lucide-react";
import { AgentNotesCard } from "@/components/agent-notes-card";


interface ShoppingItem {
  item: string;
  quantity: string;
  category: string;
}

export interface AgentStep {
  agent: "doctor" | "dietician" | "chef" | "planner";
  input: string;
  output: string;
}

const LOADING_STAGES = [
  { id: "doctor", label: "Scanning your medical profile & mapping do's and don'ts…" },
  { id: "dietician", label: "Designing your macro blueprint & meal guidelines…" },
  { id: "chef", label: "Curating recipes that fit your vibe…" },
  { id: "planner", label: "Assembling your cosmic week…" },
] as const;

/** Play a short ding when the meal plan is ready (Web Audio API, no file needed). */
function playDoneDing() {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Ignore if audio is blocked or unsupported
  }
}

export default function MealPlannerPage() {
  const [preferences, setPreferences] = useState<MealPreferences | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[] | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [usedLlm, setUsedLlm] = useState<boolean | null>(null);
  const [agentInputsOutputs, setAgentInputsOutputs] = useState<AgentStep[] | null>(null);
  const [cookSchedule, setCookSchedule] = useState<string | null>(null);
  const [ingredientReuse, setIngredientReuse] = useState<string | null>(null);
  const [fallbackReason, setFallbackReason] = useState<"no_api_key" | "llm_error" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStageMessage, setLoadingStageMessage] = useState<string | null>(null);
  const [loadingCurrentStage, setLoadingCurrentStage] = useState<string | null>(null);
  const [regeneratingMeal, setRegeneratingMeal] = useState<{
    dayIndex: number;
    mealType: string;
  } | null>(null);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const generateMealPlan = async (prefs: MealPreferences) => {
    setIsLoading(true);
    setPlanError(null);
    setLoadingStageMessage("Launching your crew…");
    setLoadingCurrentStage(null);
    setPreferences(prefs);

    try {
      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate meal plan");
      }

      const contentType = response.headers.get("Content-Type") ?? "";
      if (contentType.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        if (!reader) throw new Error("No response body");
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
            if (!dataLine) continue;
            const payload = dataLine.replace(/^data:\s*/, "").trim();
            if (payload === "[DONE]" || !payload) continue;
            try {
              const event = JSON.parse(payload) as {
                stage?: string;
                message?: string;
                type?: string;
                plan?: DayPlan[];
                shoppingList?: ShoppingItem[];
                usedLlm?: boolean;
                agentInputsOutputs?: AgentStep[];
                fallbackReason?: string;
                error?: string;
              };
              if (event.stage) setLoadingCurrentStage(event.stage);
              if (event.message) setLoadingStageMessage(event.message);
              if (event.type === "result") {
                setWeeklyPlan(event.plan ?? null);
                setShoppingList(event.shoppingList ?? []);
                setUsedLlm(event.usedLlm ?? null);
                setAgentInputsOutputs(event.agentInputsOutputs ?? null);
                setCookSchedule((event as { cookSchedule?: string }).cookSchedule ?? null);
                setIngredientReuse((event as { ingredientReuse?: string }).ingredientReuse ?? null);
                setFallbackReason(event.fallbackReason === "no_api_key" || event.fallbackReason === "llm_error" ? event.fallbackReason : null);
                playDoneDing();
              }
              if (event.type === "error") {
                const msg = event.error ?? "Something went wrong";
                setPlanError(msg.includes("JSON") ? "The plan couldn’t be fully generated (response was cut off). Try again or use the static meal database." : msg);
                break;
              }
            } catch (parseErr) {
              if (parseErr instanceof SyntaxError) continue;
              throw parseErr;
            }
          }
        }
      } else {
        const data = await response.json();
        setWeeklyPlan(data.plan);
        setShoppingList(data.shoppingList || []);
        setUsedLlm(data.usedLlm ?? null);
        setAgentInputsOutputs(data.agentInputsOutputs ?? null);
        setCookSchedule(data.cookSchedule ?? null);
        setIngredientReuse(data.ingredientReuse ?? null);
        setFallbackReason(data.fallbackReason ?? null);
        playDoneDing();
      }
    } catch (error) {
      console.error("Failed to generate meal plan:", error);
      setPlanError(error instanceof Error ? error.message : "Failed to generate meal plan. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingStageMessage(null);
      setLoadingCurrentStage(null);
    }
  };

  const regenerateMeal = async (
    dayIndex: number,
    mealType: "breakfast" | "lunch" | "dinner"
  ) => {
    if (!preferences || !weeklyPlan) return;

    setRegeneratingMeal({ dayIndex, mealType });

    try {
      const currentMeal = weeklyPlan[dayIndex][mealType];
      const response = await fetch("/api/regenerate-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...preferences,
          mealType,
          currentMealName: currentMeal.name,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to regenerate meal");
      }

      const newMeal = await response.json();

      setWeeklyPlan((prev) => {
        if (!prev) return prev;
        const updated = [...prev];
        updated[dayIndex] = {
          ...updated[dayIndex],
          [mealType]: newMeal,
        };
        return updated;
      });
    } catch (error) {
      console.error("Failed to regenerate meal:", error);
    } finally {
      setRegeneratingMeal(null);
    }
  };

  const regenerateDay = async (dayIndex: number) => {
    if (!preferences) return;

    setRegeneratingMeal({ dayIndex, mealType: "all" });

    try {
      const mealTypes = ["breakfast", "lunch", "dinner"] as const;
      const currentMeals = weeklyPlan?.[dayIndex];

      const promises = mealTypes.map(async (mealType) => {
        const response = await fetch("/api/regenerate-meal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...preferences,
            mealType,
            currentMealName: currentMeals?.[mealType]?.name || "",
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to regenerate meal");
        }
        return { mealType, meal: await response.json() };
      });

      const results = await Promise.all(promises);

      setWeeklyPlan((prev) => {
        if (!prev) return prev;
        const updated = [...prev];
        for (const { mealType, meal } of results) {
          updated[dayIndex] = {
            ...updated[dayIndex],
            [mealType]: meal,
          };
        }
        return updated;
      });
    } catch (error) {
      console.error("Failed to regenerate day:", error);
    } finally {
      setRegeneratingMeal(null);
    }
  };

  const regenerateAll = async () => {
    if (!preferences) return;
    setPlanError(null);
    setIsRegeneratingAll(true);
    setLoadingStageMessage("Launching your crew…");
    setLoadingCurrentStage(null);

    try {
      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to regenerate meal plan");
      }

      const contentType = response.headers.get("Content-Type") ?? "";
      if (contentType.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        if (!reader) throw new Error("No response body");
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
            if (!dataLine) continue;
            const payload = dataLine.replace(/^data:\s*/, "").trim();
            if (payload === "[DONE]" || !payload) continue;
            try {
              const event = JSON.parse(payload) as {
                stage?: string;
                message?: string;
                type?: string;
                plan?: DayPlan[];
                shoppingList?: ShoppingItem[];
                usedLlm?: boolean;
                agentInputsOutputs?: AgentStep[];
                fallbackReason?: string;
                error?: string;
              };
              if (event.stage) setLoadingCurrentStage(event.stage);
              if (event.message) setLoadingStageMessage(event.message);
              if (event.type === "result") {
                setWeeklyPlan(event.plan ?? null);
                setShoppingList(event.shoppingList ?? []);
                setUsedLlm(event.usedLlm ?? null);
                setAgentInputsOutputs(event.agentInputsOutputs ?? null);
                setCookSchedule((event as { cookSchedule?: string }).cookSchedule ?? null);
                setIngredientReuse((event as { ingredientReuse?: string }).ingredientReuse ?? null);
                setFallbackReason(event.fallbackReason === "no_api_key" || event.fallbackReason === "llm_error" ? event.fallbackReason : null);
                playDoneDing();
              }
              if (event.type === "error") {
                const msg = event.error ?? "Something went wrong";
                setPlanError(msg.includes("JSON") ? "The plan couldn’t be fully generated (response was cut off). Try again." : msg);
                break;
              }
            } catch (parseErr) {
              if (parseErr instanceof SyntaxError) continue;
              throw parseErr;
            }
          }
        }
      } else {
        const data = await response.json();
        setWeeklyPlan(data.plan);
        setShoppingList(data.shoppingList || []);
        setUsedLlm(data.usedLlm ?? null);
        setAgentInputsOutputs(data.agentInputsOutputs ?? null);
        setCookSchedule(data.cookSchedule ?? null);
        setIngredientReuse(data.ingredientReuse ?? null);
        setFallbackReason(data.fallbackReason ?? null);
        playDoneDing();
      }
    } catch (error) {
      console.error("Failed to regenerate meal plan:", error);
    } finally {
      setIsRegeneratingAll(false);
      setLoadingStageMessage(null);
      setLoadingCurrentStage(null);
    }
  };

  const goBack = () => {
    setWeeklyPlan(null);
    setShoppingList([]);
    setUsedLlm(null);
    setAgentInputsOutputs(null);
    setCookSchedule(null);
    setIngredientReuse(null);
    setFallbackReason(null);
    setPlanError(null);
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Cosmic background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-chart-3/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-sm border border-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
              Fine, I'll Eat
            </h1>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto text-balance text-lg">
            {weeklyPlan
              ? "Your cosmic meal plan is ready! Swap out any meals you don't like."
              : "Tell us about your dietary needs and preferences, and we'll create a stellar weekly meal plan just for you."}
          </p>
        </header>

        {weeklyPlan ? (
          <div className="space-y-4">
            {isRegeneratingAll && (
              <div className="rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm p-4">
                <p className="font-medium text-foreground mb-3" role="status" aria-live="polite">
                  Regenerating your plan…
                </p>
                <ul className="space-y-2" aria-label="Processing stages">
                  {LOADING_STAGES.map((stage, index) => {
                    const currentIndex = loadingCurrentStage
                      ? LOADING_STAGES.findIndex((s) => s.id === loadingCurrentStage)
                      : -1;
                    const isCompleted = currentIndex >= 0 && index < currentIndex;
                    const isCurrent = loadingCurrentStage === stage.id;
                    return (
                      <li
                        key={stage.id}
                        className={`flex items-center gap-3 text-sm transition-colors ${
                          isCompleted ? "text-muted-foreground" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          </span>
                        ) : isCurrent ? (
                          <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border shrink-0" aria-hidden>
                            <Circle className="h-2.5 w-2.5 text-muted-foreground" />
                          </span>
                        )}
                        <span className={isCompleted ? "line-through decoration-muted-foreground/60" : ""}>
                          {stage.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {usedLlm === false && (
              <div
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 px-4 py-3 flex items-start gap-3"
                role="status"
                aria-live="polite"
              >
                <Info className="h-5 w-5 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <p className="font-medium text-foreground">
                    {fallbackReason === "no_api_key"
                      ? "API key not set"
                      : fallbackReason === "llm_error"
                        ? "AI request failed"
                        : "Using built-in meal database"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {fallbackReason === "no_api_key"
                      ? "Add OPENROUTER_API_KEY in Vercel → Project → Settings → Environment Variables (Production), then redeploy."
                      : fallbackReason === "llm_error"
                        ? "The AI request timed out or returned an error. On Vercel Hobby (10s limit) use the static database or upgrade to Pro. You can also set OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct for a faster model."
                        : "AI wasn’t available for this request, so your plan was generated from our curated meal database. You still get a full week of meals and a shopping list."}
                  </p>
                </div>
              </div>
            )}
            <WeeklyPlan
              plan={weeklyPlan}
              shoppingList={shoppingList}
              cookSchedule={usedLlm === true ? cookSchedule : null}
              ingredientReuse={usedLlm === true ? ingredientReuse : null}
              onBack={goBack}
              onRegenerateMeal={regenerateMeal}
              onRegenerateDay={regenerateDay}
              onRegenerateAll={regenerateAll}
              regeneratingMeal={regeneratingMeal}
              isRegeneratingAll={isRegeneratingAll}
            />
            {usedLlm === true && agentInputsOutputs && agentInputsOutputs.length > 0 && (() => {
              const doctorStep = agentInputsOutputs.find((s) => s.agent === "doctor");
              const dieticianStep = agentInputsOutputs.find((s) => s.agent === "dietician");
              return (doctorStep ?? dieticianStep) ? (
                <div className="space-y-4 mt-8">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    For your reference
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {doctorStep && (
                      <AgentNotesCard
                        type="doctor"
                        output={doctorStep.output}
                        title="Doctor's notes"
                        subtitle="What to avoid, what's advised, and when to take medication."
                        accentBg="bg-chart-2/10"
                      />
                    )}
                    {dieticianStep && (
                      <AgentNotesCard
                        type="dietician"
                        output={dieticianStep.output}
                        title="Dietician's recommendations"
                        subtitle="Supplements Recommendations."
                        accentBg="bg-chart-4/10"
                      />
                    )}
                  </div>
                </div>
              ) : null;
            })()}
            {usedLlm === true && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 flex flex-col gap-3 mt-8">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 shrink-0 text-primary" />
                  <p className="font-medium text-foreground">Raw agent input & output (Doctor → Dietician → Chef → Planner)</p>
                </div>
                {agentInputsOutputs && agentInputsOutputs.length > 0 && (
                  <div className="space-y-2">
                    {agentInputsOutputs.map((step) => (
                      <details key={step.agent} className="group rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
                        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground select-none capitalize">
                          <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                          {step.agent}: input & output
                        </summary>
                        <div className="border-t border-border/50 divide-y divide-border/50">
                          <div className="p-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Input</p>
                            <pre className="text-xs text-foreground/90 whitespace-pre-wrap break-words max-h-48 overflow-y-auto bg-background/50 rounded p-2">
                              {step.input}
                            </pre>
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Output</p>
                            <pre className="text-xs text-foreground/90 whitespace-pre-wrap break-words max-h-48 overflow-y-auto bg-background/50 rounded p-2">
                              {step.output}
                            </pre>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {planError && (
              <div
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 flex items-start gap-3"
                role="alert"
              >
                <Info className="h-5 w-5 shrink-0 mt-0.5 text-destructive" />
                <div>
                  <p className="font-medium text-foreground">Couldn’t generate your plan</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{planError}</p>
                </div>
              </div>
            )}
            {isLoading && (
              <div className="rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm p-5 shadow-lg">
                <p className="font-medium text-foreground mb-4" role="status" aria-live="polite">
                  {loadingCurrentStage ? "Your crew is on it…" : "Launching your crew…"}
                </p>
                <ul className="space-y-3" aria-label="Processing stages">
                  {LOADING_STAGES.map((stage, index) => {
                    const currentIndex = loadingCurrentStage
                      ? LOADING_STAGES.findIndex((s) => s.id === loadingCurrentStage)
                      : -1;
                    const isCompleted = currentIndex >= 0 && index < currentIndex;
                    const isCurrent = loadingCurrentStage === stage.id;
                    return (
                      <li
                        key={stage.id}
                        className={`flex items-center gap-3 text-sm transition-colors ${
                          isCompleted ? "text-muted-foreground" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary shrink-0">
                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                          </span>
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border shrink-0" aria-hidden>
                            <Circle className="h-3 w-3 text-muted-foreground" />
                          </span>
                        )}
                        <span className={isCompleted ? "line-through decoration-muted-foreground/60" : ""}>
                          {stage.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  This can take up to a minute when using AI — thanks for waiting!
                </p>
              </div>
            )}
            <PreferencesForm onSubmit={generateMealPlan} isLoading={isLoading} />
          </div>
        )}
      </div>
    </main>
  );
}
