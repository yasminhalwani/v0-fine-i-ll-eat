"use client";

import {
  Ban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Pill,
  type LucideIcon,
} from "lucide-react";

type SectionConfig = {
  title: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

const DOCTOR_SECTIONS: SectionConfig[] = [
  { title: "Not allowed to eat", icon: Ban, iconBg: "bg-destructive/15", iconColor: "text-destructive" },
  { title: "Advised to eat", icon: CheckCircle2, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { title: "Not advised to eat", icon: AlertTriangle, iconBg: "bg-amber-500/15", iconColor: "text-amber-600 dark:text-amber-400" },
  { title: "When to take medication", icon: Clock, iconBg: "bg-blue-500/15", iconColor: "text-blue-600 dark:text-blue-400" },
];

/** Split raw agent output into numbered sections (1. ... 2. ...). */
function parseNumberedSections(text: string): { index: number; body: string }[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Split at newlines that are followed by "1." "2." etc.
  const chunks = trimmed.split(/\n(?=\d+\.\s*)/);
  const sections: { index: number; body: string }[] = [];

  for (const chunk of chunks) {
    const match = chunk.match(/^(\d+)\.\s*(.*)/s);
    if (match) {
      const num = parseInt(match[1], 10);
      const body = match[2].trim();
      if (body) sections.push({ index: num, body });
    }
  }

  if (sections.length === 0) sections.push({ index: 1, body: trimmed });
  return sections;
}

/** Convert a section body into lines; bullet lines become list items. */
function formatBody(body: string): string[] | null {
  if (!body.trim()) return null;
  const lines = body.split(/\n/).map((l) => l.trim()).filter(Boolean);
  return lines;
}

/** Extract meaningful lines from dietician section text (bullets and short lines). */
function getDieticianLines(body: string, maxLines = 12): string[] {
  const lines = body.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const out: string[] = [];
  for (const line of lines) {
    if (out.length >= maxLines) break;
    const cleaned = line
      .replace(/^[•\-*]\s*/, "")
      .replace(/^\d+\)\s*/, "")
      .replace(/^:\s*/, "")
      .trim();
    if (cleaned.length < 2) continue;
    if (/^(none|n\/a|not specified|—)$/i.test(cleaned)) {
      if (out.length === 0) out.push("None specified");
      continue;
    }
    out.push(cleaned);
  }
  return out;
}

interface AgentNotesCardProps {
  type: "doctor" | "dietician";
  output: string;
  title: string;
  subtitle: string;
  accentBg: string;
}

export function AgentNotesCard({
  type,
  output,
  title,
  subtitle,
  accentBg,
}: AgentNotesCardProps) {
  const parsed = parseNumberedSections(output);

  // Dietician: only recommended supplements
  if (type === "dietician") {
    const supplementsSection = parsed.find((s) => s.index === 5);
    const supplementLines = supplementsSection
      ? getDieticianLines(supplementsSection.body, 8)
      : [];
    const hasSupplements =
      supplementLines.length > 0 &&
      !(supplementLines.length === 1 && supplementLines[0] === "None specified");

    return (
      <div className={`rounded-2xl border border-border ${accentBg} p-6 shadow-sm`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="rounded-xl bg-amber-500/5 dark:bg-amber-500/10 p-5 border border-amber-500/20 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-inner">
              <Pill className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
              Recommended supplements
            </p>
          </div>
          {hasSupplements ? (
            <ul className="space-y-2 pl-0 list-none">
              {supplementLines.map((text, i) => (
                <li
                  key={i}
                  className="flex gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-amber-500/10 dark:hover:bg-amber-500/15 transition-colors"
                >
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500/80 ring-2 ring-amber-500/20"
                    aria-hidden
                  />
                  <span className="text-sm leading-relaxed text-foreground/95">{text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic py-1">None specified.</p>
          )}
        </div>

        {parsed.length === 0 && output.trim() && (
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pt-2 border-t border-border/50 mt-4">
            {output}
          </p>
        )}
      </div>
    );
  }

  // Doctor: full sectioned layout
  const sectionsConfig = DOCTOR_SECTIONS;
  return (
    <div className={`rounded-xl border border-border ${accentBg} p-5 shadow-sm`}>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>

      <div className="space-y-4">
        {parsed.map(({ index, body }) => {
          const config = sectionsConfig[index - 1];
          if (!config) return null;
          const Icon = config.icon;
          const lines = formatBody(body);
          if (!lines?.length) return null;

          return (
            <div key={index} className="rounded-lg bg-background/60 dark:bg-background/40 p-3 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.iconBg} ${config.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-foreground">{config.title}</span>
              </div>
              <ul className="space-y-1.5 text-sm text-foreground/90 pl-0 list-none">
                {lines.map((line, i) => {
                  const isBullet = /^[•\-*]\s*/.test(line) || /^\d+\)\s*/.test(line);
                  const text = line.replace(/^[•\-*]\s*/, "").replace(/^\d+\)\s*/, "");
                  return (
                    <li key={i} className="flex gap-2">
                      {isBullet ? (
                        <span className="text-muted-foreground mt-0.5 shrink-0">•</span>
                      ) : null}
                      <span className={isBullet ? "" : "font-medium"}>{text || line}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {parsed.every((s) => !formatBody(s.body)?.length) && output.trim() && (
        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pt-2">
          {output}
        </p>
      )}
    </div>
  );
}
