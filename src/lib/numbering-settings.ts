import { z } from "zod";

const SETTINGS_KEY = "casecipher:numbering-settings:v1";

export const DEFAULT_CASE_NUMBERING_RULE = "CASE-YYYY-MM";
export const DEFAULT_EVIDENCE_NUMBERING_RULE = "EVD-YYYY-MM";

export const POPULAR_NUMBERING_RULES = [
  {
    value: "CASE-YYYY-MM",
    label: "Agency prefix, year, month",
    description: "Common for internal case queues and monthly intake batches.",
  },
  {
    value: "YYYY-MM-CASE",
    label: "Date first, agency prefix",
    description: "Sorts naturally by year and month before the case type.",
  },
  {
    value: "YY-M-CASE",
    label: "Compact date first",
    description: "Short year and month for teams with shorter identifiers.",
  },
  {
    value: "CASE_YYYY_MM",
    label: "Underscore-separated",
    description: "Useful for file-system friendly case folders.",
  },
  {
    value: "YYYY/MM/CASE",
    label: "Slash-separated date first",
    description: "Follows many document-control date conventions.",
  },
  {
    value: "EVD-YYYY-MM",
    label: "Evidence prefix, year, month",
    description: "Matches evidence-label workflows with a clear item prefix.",
  },
] as const;

const ALLOWED_RULE_REGEX =
  /^(?!.*[-_/]{2})(?:YYYY|YY|MM|M|[A-Z][A-Z0-9]*)(?:[-_/](?:YYYY|YY|MM|M|[A-Z][A-Z0-9]*))*$/i;
const DUPLICATE_YEAR_TOKEN_REGEX =
  /(?:^|[-_/])(YYYY|YY)(?=$|[-_/]).*(?:^|[-_/])\1(?=$|[-_/])/i;
const DUPLICATE_MONTH_TOKEN_REGEX =
  /(?:^|[-_/])(MM|M)(?=$|[-_/]).*(?:^|[-_/])\1(?=$|[-_/])/i;

type NumberingSettings = {
  caseNumberingRule: string;
  evidenceNumberingRule: string;
  customNumberingRules: string[];
};

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function normalizeNumberingRule(rule: string) {
  return rule.trim().toUpperCase();
}

export function isValidNumberingRule(rule: string) {
  const normalized = normalizeNumberingRule(rule);
  if (!ALLOWED_RULE_REGEX.test(normalized)) return false;
  if (DUPLICATE_YEAR_TOKEN_REGEX.test(normalized)) return false;
  if (DUPLICATE_MONTH_TOKEN_REGEX.test(normalized)) return false;

  const tokens = normalized.split(/[-_/]/);
  const hasYear = tokens.some((token) => token === "YYYY" || token === "YY");
  const hasMonth = tokens.some((token) => token === "MM" || token === "M");
  const hasLiteral = tokens.some(
    (token) => !["YYYY", "YY", "MM", "M"].includes(token),
  );

  return hasYear && hasMonth && hasLiteral;
}

export const numberingRuleSchema = z
  .string()
  .trim()
  .min(1, "Enter a numbering rule")
  .max(50, "Numbering rules must be 50 characters or less")
  .transform(normalizeNumberingRule)
  .refine(isValidNumberingRule, {
    message:
      "Use one text segment, one year token (YYYY or YY), one month token (MM or M), and single -, /, or _ separators.",
  });

export const numberingSettingsSchema = z.object({
  caseNumberingRule: numberingRuleSchema,
  evidenceNumberingRule: numberingRuleSchema,
});

export function readNumberingSettings(): NumberingSettings {
  const defaults: NumberingSettings = {
    caseNumberingRule: DEFAULT_CASE_NUMBERING_RULE,
    evidenceNumberingRule: DEFAULT_EVIDENCE_NUMBERING_RULE,
    customNumberingRules: [],
  };

  if (typeof window === "undefined") return defaults;

  const parsed = safeParse<Partial<NumberingSettings>>(
    window.localStorage.getItem(SETTINGS_KEY),
  );
  if (!parsed) return defaults;

  return {
    caseNumberingRule: isValidNumberingRule(parsed.caseNumberingRule ?? "")
      ? normalizeNumberingRule(parsed.caseNumberingRule ?? "")
      : defaults.caseNumberingRule,
    evidenceNumberingRule: isValidNumberingRule(
      parsed.evidenceNumberingRule ?? "",
    )
      ? normalizeNumberingRule(parsed.evidenceNumberingRule ?? "")
      : defaults.evidenceNumberingRule,
    customNumberingRules: Array.isArray(parsed.customNumberingRules)
      ? parsed.customNumberingRules
          .map(normalizeNumberingRule)
          .filter(isValidNumberingRule)
      : defaults.customNumberingRules,
  };
}

export function writeNumberingSettings(
  settings: Pick<
    NumberingSettings,
    "caseNumberingRule" | "evidenceNumberingRule"
  >,
) {
  if (typeof window === "undefined") return;

  const normalized = {
    caseNumberingRule: normalizeNumberingRule(settings.caseNumberingRule),
    evidenceNumberingRule: normalizeNumberingRule(
      settings.evidenceNumberingRule,
    ),
  };
  const existing = readNumberingSettings();
  const customNumberingRules = Array.from(
    new Set([
      ...existing.customNumberingRules,
      normalized.caseNumberingRule,
      normalized.evidenceNumberingRule,
    ]),
  ).filter(
    (rule) =>
      isValidNumberingRule(rule) &&
      !POPULAR_NUMBERING_RULES.some((option) => option.value === rule),
  );

  window.localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ ...normalized, customNumberingRules }),
  );
}

export function formatNumberingRule(rule: string, date = new Date()) {
  const year = String(date.getFullYear());
  const shortYear = year.slice(-2);
  const month = String(date.getMonth() + 1);
  const paddedMonth = month.padStart(2, "0");

  return normalizeNumberingRule(rule)
    .split(/([-_/])/)
    .map((token) => {
      switch (token) {
        case "YYYY":
          return year;
        case "YY":
          return shortYear;
        case "MM":
          return paddedMonth;
        case "M":
          return month;
        default:
          return token;
      }
    })
    .join("");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function makeUniqueNumber(
  baseNumber: string,
  existingNumbers: string[],
) {
  if (!existingNumbers.includes(baseNumber)) return baseNumber;

  const suffixRegex = new RegExp(`^${escapeRegExp(baseNumber)}-(\\d+)$`, "i");
  const next =
    existingNumbers
      .map((number) => suffixRegex.exec(number)?.[1])
      .map((value) => (value ? Number.parseInt(value, 10) : Number.NaN))
      .filter(Number.isFinite)
      .reduce((max, value) => Math.max(max, value), 1) + 1;

  return `${baseNumber}-${String(next).padStart(2, "0")}`;
}
