import { z } from "zod";

const SETTINGS_KEY = "casecipher:numbering-settings:v1";

export const DEFAULT_CASE_NUMBERING_RULE = "YYYY-####";
export const DEFAULT_EVIDENCE_NUMBERING_RULE = "BATES-YYYY-MM-####";

export const CASE_NUMBERING_RULES = [
  {
    value: "YYYY-####",
    label: "Year plus sequence",
    description: "Simple, common default such as 2026-0042.",
  },
  {
    value: "YY-####",
    label: "Short year plus sequence",
    description: "Compact incident-style numbering such as 26-0042.",
  },
  {
    value: "LIT-YYYY-####",
    label: "Type prefix, year, sequence",
    description: "Practice-area or matter type prefix such as LIT-2026-0042.",
  },
  {
    value: "CLIENT-YYYY-####",
    label: "Client-matter style",
    description: "Client or matter prefix with a matter sequence.",
  },
  {
    value: "AGENCY-YY-####",
    label: "Law enforcement incident style",
    description: "Agency prefix, short year, and incident sequence.",
  },
] as const;

export const EVIDENCE_NUMBERING_RULES = [
  {
    value: "BATES-YYYY-MM-####",
    label: "Bates numbering",
    description: "Producing-party prefix plus zero-padded sequence.",
  },
  {
    value: "SMITH-YYYY-MM-####",
    label: "Bates party prefix",
    description: "Producing-party prefix with a fixed-width sequence.",
  },
  {
    value: "P-YYYY-####",
    label: "Plaintiff exhibit style",
    description: "Party-prefixed exhibit numbering with filing year.",
  },
  {
    value: "EVD-YYYY-MM-####",
    label: "Evidence item style",
    description: "Evidence prefix, date bucket, and item sequence.",
  },
  {
    value: "ABC-YYYY-MM-####",
    label: "Forensic exhibit reference",
    description: "Examiner or officer initials plus sequence.",
  },
] as const;

export const POPULAR_NUMBERING_RULES = [
  ...CASE_NUMBERING_RULES,
  ...EVIDENCE_NUMBERING_RULES,
] as const;

const ALLOWED_RULE_REGEX =
  /^(?!.*[-_/]{2})(?:YYYY|YY|MM|M|#+|[A-Z0-9]+)(?:[-_/](?:YYYY|YY|MM|M|#+|[A-Z0-9]+))*$/i;
const DUPLICATE_YEAR_TOKEN_REGEX =
  /(?:^|[-_/])(YYYY|YY)(?=$|[-_/]).*(?:^|[-_/])\1(?=$|[-_/])/i;
const DUPLICATE_MONTH_TOKEN_REGEX =
  /(?:^|[-_/])(MM|M)(?=$|[-_/]).*(?:^|[-_/])\1(?=$|[-_/])/i;
const SEQUENCE_TOKEN_REGEX = /(?:^|[-_/])(#{4})(?=$)/;

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
  if (!SEQUENCE_TOKEN_REGEX.test(normalized)) return false;

  const tokens = normalized.split(/[-_/]/);
  const yearTokenCount = tokens.filter(
    (token) => token === "YYYY" || token === "YY",
  ).length;
  const monthTokenCount = tokens.filter(
    (token) => token === "MM" || token === "M",
  ).length;
  const sequenceTokenCount = tokens.filter((token) =>
    /^#{4}$/.test(token),
  ).length;

  return (
    yearTokenCount + monthTokenCount > 0 &&
    yearTokenCount <= 1 &&
    monthTokenCount <= 1 &&
    sequenceTokenCount === 1
  );
}

export const numberingRuleSchema = z
  .string()
  .trim()
  .min(1, "Enter a numbering rule")
  .max(50, "Numbering rules must be 50 characters or less")
  .transform(normalizeNumberingRule)
  .refine(isValidNumberingRule, {
    message:
      "Use a date token (YYYY, YY, MM, or M), single -, /, or _ separators, and end with ####.",
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

export function formatNumberingRule(
  rule: string,
  sequence = 1,
  date = new Date(),
) {
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
          return /^#{4}$/.test(token)
            ? String(sequence).padStart(token.length, "0")
            : token;
      }
    })
    .join("");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function makeNextNumber(
  rule: string,
  existingNumbers: string[],
  date = new Date(),
) {
  const basePattern = formatNumberingRule(rule, 0, date).replace(/0{4,}$/, "");
  const sequenceRegex = new RegExp(`^${escapeRegExp(basePattern)}(\\d+)$`, "i");
  const next =
    existingNumbers
      .map((number) => sequenceRegex.exec(number)?.[1])
      .map((value) => (value ? Number.parseInt(value, 10) : Number.NaN))
      .filter(Number.isFinite)
      .reduce((max, value) => Math.max(max, value), 0) + 1;

  return formatNumberingRule(rule, next, date);
}

export function previewNextNumber(
  rule: string,
  existingNumbers: string[],
  date = new Date(),
) {
  if (!isValidNumberingRule(rule)) return "";
  return makeNextNumber(rule, existingNumbers, date);
}
