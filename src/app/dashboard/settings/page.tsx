"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Save } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  formatNumberingRule,
  normalizeNumberingRule,
  numberingSettingsSchema,
  POPULAR_NUMBERING_RULES,
  readNumberingSettings,
  writeNumberingSettings,
} from "@/lib/numbering-settings";

type SettingsFormValues = z.infer<typeof numberingSettingsSchema>;

type RuleOption = {
  value: string;
  label: string;
  description?: string;
};

function buildRuleOptions(customRules: string[], currentRules: string[]) {
  const customOptions = customRules.map((rule) => ({
    value: rule,
    label: "Custom rule",
    description: "Saved from your settings.",
  }));
  const currentOptions = currentRules
    .map(normalizeNumberingRule)
    .filter(Boolean)
    .map((rule) => ({
      value: rule,
      label: "Current rule",
      description: "Currently selected in this form.",
    }));

  return Array.from(
    new Map(
      [...POPULAR_NUMBERING_RULES, ...customOptions, ...currentOptions].map(
        (option) => [option.value, option],
      ),
    ).values(),
  );
}

function NumberingRuleCombobox({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: RuleOption[];
  placeholder: string;
}) {
  const normalizedValue = normalizeNumberingRule(value);
  const visibleOptions = options.filter((option) => {
    const query = normalizedValue.toLowerCase();
    return (
      query.length === 0 ||
      option.value.toLowerCase().includes(query) ||
      option.label.toLowerCase().includes(query)
    );
  });
  const hasExactOption = options.some(
    (option) => option.value === normalizedValue,
  );

  return (
    <Combobox
      items={options.map((option) => option.value)}
      inputValue={value}
      onInputValueChange={(nextValue) => onChange(nextValue)}
      onValueChange={(nextValue) => {
        if (typeof nextValue === "string") onChange(nextValue);
      }}
      value={value || null}
    >
      <ComboboxInput
        className="w-full border-white/8 bg-white/4"
        placeholder={placeholder}
        showClear
      />
      <ComboboxContent>
        <ComboboxList>
          {visibleOptions.map((option) => (
            <ComboboxItem key={option.value} value={option.value}>
              <span className="flex min-w-0 flex-col">
                <span className="font-medium">{option.value}</span>
                <span className="text-xs text-muted-foreground">
                  {option.label}
                  {option.description ? ` - ${option.description}` : ""}
                </span>
              </span>
            </ComboboxItem>
          ))}
          {normalizedValue && !hasExactOption ? (
            <>
              <ComboboxSeparator />
              <ComboboxItem value={normalizedValue}>
                Use custom rule "{normalizedValue}"
              </ComboboxItem>
            </>
          ) : null}
          <ComboboxEmpty>
            Type a rule like CASE-YYYY-MM, then save it as a custom option.
          </ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default function SettingsPage() {
  const [customRules, setCustomRules] = React.useState<string[]>([]);
  const [saved, setSaved] = React.useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(numberingSettingsSchema),
    defaultValues: {
      caseNumberingRule: "CASE-YYYY-MM",
      evidenceNumberingRule: "EVD-YYYY-MM",
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    const settings = readNumberingSettings();
    setCustomRules(settings.customNumberingRules);
    form.reset({
      caseNumberingRule: settings.caseNumberingRule,
      evidenceNumberingRule: settings.evidenceNumberingRule,
    });
  }, [form]);

  const caseRule = form.watch("caseNumberingRule");
  const evidenceRule = form.watch("evidenceNumberingRule");
  const options = React.useMemo(
    () => buildRuleOptions(customRules, [caseRule, evidenceRule]),
    [caseRule, customRules, evidenceRule],
  );

  function onSubmit(values: SettingsFormValues) {
    writeNumberingSettings(values);
    const nextSettings = readNumberingSettings();
    setCustomRules(nextSettings.customNumberingRules);
    form.reset({
      caseNumberingRule: nextSettings.caseNumberingRule,
      evidenceNumberingRule: nextSettings.evidenceNumberingRule,
    });
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how new cases and evidence are numbered when you leave the
          number field blank.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Numbering rules</CardTitle>
          <CardDescription>
            Popular formats use an agency or item prefix, a year token, and a
            month token. New custom rules are saved into the combobox after you
            submit them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="caseNumberingRule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case numbering rule</FormLabel>
                      <NumberingRuleCombobox
                        onChange={(nextValue) => {
                          field.onChange(normalizeNumberingRule(nextValue));
                          setSaved(false);
                        }}
                        options={options}
                        placeholder="Search or enter CASE-YYYY-MM"
                        value={field.value}
                      />
                      <FormDescription>
                        Preview: {formatNumberingRule(field.value)}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evidenceNumberingRule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence numbering rule</FormLabel>
                      <NumberingRuleCombobox
                        onChange={(nextValue) => {
                          field.onChange(normalizeNumberingRule(nextValue));
                          setSaved(false);
                        }}
                        options={options}
                        placeholder="Search or enter EVD-YYYY-MM"
                        value={field.value}
                      />
                      <FormDescription>
                        Preview: {formatNumberingRule(field.value)}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-xl border border-white/8 bg-white/3 p-4 text-sm text-muted-foreground">
                Rules can use one literal text segment, one year token
                <span className="font-medium text-foreground"> YYYY or YY</span>
                , one month token
                <span className="font-medium text-foreground"> MM or M</span>,
                and single separators
                <span className="font-medium text-foreground"> -, /, or _</span>
                . Examples: CASE-YYYY-MM, YYYY-MM-CASE, YY_M_EVD.
              </div>

              <div className="flex items-center justify-between gap-3">
                <div
                  className="flex items-center gap-2 text-sm text-emerald-300"
                  aria-live="polite"
                >
                  {saved ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      Settings saved
                    </>
                  ) : null}
                </div>
                <Button type="submit" disabled={!form.formState.isValid}>
                  <Save className="size-4" />
                  Save settings
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
