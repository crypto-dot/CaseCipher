"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileImage, Loader2, Plus, Search, Upload, Video } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCases, useCreateEvidence, useEvidence } from "@/lib/case-hooks";
import {
  DEFAULT_EVIDENCE_NUMBERING_RULE,
  formatNumberingRule,
  readNumberingSettings,
} from "@/lib/numbering-settings";
import type { Case } from "@/lib/types/case-types";
import {
  acquisitionMethodSchema,
  type EvidenceItem,
  type EvidenceMedia,
  evidenceStatusSchema,
  evidenceTypeSchema,
} from "@/lib/types/evidence-types";
import { cn } from "@/lib/utils";

const ALL_STATUSES = "all-statuses";
const ALL_TYPES = "all-types";

const evidenceFormSchema = z.object({
  caseId: z.uuid("Select a case"),
  evidenceNumber: z.string().trim().optional(),
  dateSeized: z.string().min(1, "Date seized is required"),
  evidenceType: evidenceTypeSchema,
  status: evidenceStatusSchema,
  make: z.string().trim().optional(),
  model: z.string().trim().optional(),
  serialNumber: z.string().trim().optional(),
  storageLocation: z.string().trim().optional(),
  seizedBy: z.string().trim().optional(),
  acquisitionMethod: acquisitionMethodSchema,
  acquisitionTool: z.string().trim().optional(),
  description: z.string().trim().optional(),
  media: z.any().optional(),
});

type EvidenceFormValues = z.infer<typeof evidenceFormSchema>;

function toMediaMeta(files: FileList | null): EvidenceMedia[] {
  if (!files) return [];
  return Array.from(files).map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    lastModified: file.lastModified,
  }));
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCaseNumber(caseItem: Case | undefined) {
  return caseItem?.caseNumber ?? caseItem?.id ?? "Unknown case";
}

function statusBadgeClass(status: string | null) {
  switch (status) {
    case "received":
      return "border-blue-400/30 bg-blue-500/15 text-blue-200";
    case "under_examination":
      return "border-orange-400/30 bg-orange-500/15 text-orange-200";
    case "in_queue":
      return "border-amber-400/30 bg-amber-500/15 text-amber-200";
    case "analysis_complete":
      return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
    case "returned":
      return "border-cyan-400/30 bg-cyan-500/15 text-cyan-200";
    default:
      return "border-white/10 bg-white/5 text-muted-foreground";
  }
}

export default function EvidencePage() {
  const [open, setOpen] = React.useState(false);
  const [selectedEvidence, setSelectedEvidence] =
    React.useState<EvidenceItem | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState(ALL_STATUSES);
  const [typeFilter, setTypeFilter] = React.useState(ALL_TYPES);
  const [defaultEvidenceNumber, setDefaultEvidenceNumber] = React.useState(() =>
    formatNumberingRule(DEFAULT_EVIDENCE_NUMBERING_RULE),
  );

  React.useEffect(() => {
    const { evidenceNumberingRule } = readNumberingSettings();
    setDefaultEvidenceNumber(formatNumberingRule(evidenceNumberingRule));
  }, []);

  const casesQuery = useCases();
  const evidenceQuery = useEvidence();
  const createEvidenceMut = useCreateEvidence();

  const cases = casesQuery.data ?? [];
  const evidence = evidenceQuery.data ?? [];
  const caseById = React.useMemo(
    () => new Map(cases.map((caseItem) => [caseItem.id, caseItem])),
    [cases],
  );

  const form = useForm<EvidenceFormValues>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues: {
      caseId: "",
      evidenceNumber: "",
      dateSeized: new Date().toISOString().slice(0, 10),
      evidenceType: "hard_drive",
      status: "received",
      make: "",
      model: "",
      serialNumber: "",
      storageLocation: "",
      seizedBy: "",
      acquisitionMethod: "physical",
      acquisitionTool: "",
      description: "",
      media: undefined,
    },
  });

  const selectedFiles = form.watch("media") as FileList | undefined;
  const media = React.useMemo(
    () => toMediaMeta(selectedFiles ?? null),
    [selectedFiles],
  );

  const filteredEvidence = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return evidence.filter((item) => {
      const caseItem = caseById.get(item.caseId);
      const matchesSearch =
        query.length === 0 ||
        [
          item.evidenceNumber,
          item.label,
          item.description,
          item.storageLocation,
          formatCaseNumber(caseItem),
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === ALL_STATUSES || item.status === statusFilter;
      const matchesType =
        typeFilter === ALL_TYPES || item.evidenceType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [caseById, evidence, search, statusFilter, typeFilter]);

  async function onSubmit(values: EvidenceFormValues) {
    await createEvidenceMut.mutateAsync({
      caseId: values.caseId,
      evidenceNumber: values.evidenceNumber || undefined,
      dateSeized: values.dateSeized,
      evidenceType: values.evidenceType,
      status: values.status,
      make: values.make || undefined,
      model: values.model || undefined,
      serialNumber: values.serialNumber || undefined,
      storageLocation: values.storageLocation || undefined,
      seizedBy: values.seizedBy || undefined,
      acquisitionMethod: values.acquisitionMethod,
      acquisitionTool: values.acquisitionTool || undefined,
      description: values.description || undefined,
      media,
    });
    form.reset();
    setOpen(false);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <header className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Evidence</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredEvidence.length} total{" "}
            {filteredEvidence.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Button
          type="button"
          className="rounded-lg bg-[hsl(213_94%_55%)] text-white  hover:bg-[hsl(213_94%_48%)]"
          onClick={() => setOpen(true)}
        >
          <Plus className="size-4" />
          Add Evidence
        </Button>
      </header>

      <div className="rounded-2xl border border-white/8 bg-[hsl(222_44%_8%/0.65)] p-3 ">
        <div className="grid gap-3 md:grid-cols-[1fr_9rem_9rem]">
          <label className="relative block" htmlFor="searchEvidence">
            <span className="sr-only">Search evidence</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="searchEvidence"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search evidence..."
              className="border-white/8 bg-[hsl(222_43%_11%/0.95)] pl-9"
            />
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-white/8 bg-[hsl(222_43%_11%/0.95)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>All Status</SelectItem>
              {evidenceStatusSchema.options.map((status) => (
                <SelectItem key={status} value={status}>
                  {titleCase(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="border-white/8 bg-[hsl(222_43%_11%/0.95)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TYPES}>All Types</SelectItem>
              {evidenceTypeSchema.options.map((type) => (
                <SelectItem key={type} value={type}>
                  {titleCase(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="min-h-0 overflow-x-auto rounded-2xl border border-white/8 bg-[hsl(222_44%_8%/0.65)]">
        <table className="w-full min-w-232 text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Evidence #</th>
              <th className="px-4 py-3 font-medium">Case</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Seized</th>
              <th className="px-4 py-3 font-medium">Hashes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {evidenceQuery.isLoading || casesQuery.isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Loading evidence...
                  </span>
                </td>
              </tr>
            ) : filteredEvidence.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No evidence found.
                </td>
              </tr>
            ) : (
              filteredEvidence.map((item) => {
                const caseItem = caseById.get(item.caseId);
                return (
                  <tr
                    key={item.id}
                    className="cursor-pointer text-foreground/95 transition-colors hover:bg-white/4 focus-visible:bg-white/4 focus-visible:outline-none"
                    aria-label={`Open details for ${item.evidenceNumber ?? item.label}`}
                    tabIndex={0}
                    onClick={() => setSelectedEvidence(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedEvidence(item);
                      }
                    }}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[hsl(213_94%_68%)]">
                      {item.evidenceNumber ?? item.id}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {formatCaseNumber(caseItem)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {titleCase(item.evidenceType ?? "other")}
                    </td>
                    <td className="max-w-56 px-4 py-3 text-muted-foreground">
                      <span className="line-clamp-1">
                        {item.description || item.label || "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border font-medium",
                          statusBadgeClass(item.status),
                        )}
                      >
                        {titleCase(item.status ?? "received")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.storageLocation ?? item.currentLocation ?? "--"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.dateSeized
                        ? new Date(
                            `${item.dateSeized}T00:00:00`,
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "--"}
                    </td>
                    <td className="max-w-48 px-4 py-3 font-mono text-[0.65rem] text-muted-foreground">
                      <div className="truncate">MD5 {item.hashMd5 ?? "--"}</div>
                      <div className="truncate">
                        SHA-256 {item.hashSha256 ?? "--"}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[min(92vh,58rem)] overflow-y-auto rounded-2xl border-white/8 bg-[hsl(222_44%_8%/0.98)] p-0 text-foreground sm:max-w-3xl">
          <DialogHeader className="border-b border-white/8 px-6 py-5">
            <DialogTitle className="text-2xl">Add Evidence</DialogTitle>
            <DialogDescription className="sr-only">
              Add a new evidence item and associate it with a case.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-5 px-6 py-5">
                <FormField
                  control={form.control}
                  name="caseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="border-white/8 bg-white/4">
                            <SelectValue placeholder="Select case" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cases.map((caseItem) => (
                            <SelectItem key={caseItem.id} value={caseItem.id}>
                              {formatCaseNumber(caseItem)} - {caseItem.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="evidenceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidence number</FormLabel>
                        <FormControl>
                          <Input placeholder="EVD-00009" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank to use {defaultEvidenceNumber}.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateSeized"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date seized</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="evidenceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border-white/8 bg-white/4">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {evidenceTypeSchema.options.map((type) => (
                              <SelectItem key={type} value={type}>
                                {titleCase(type)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border-white/8 bg-white/4">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {evidenceStatusSchema.options.map((status) => (
                              <SelectItem key={status} value={status}>
                                {titleCase(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="storageLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage location</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seizedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seized by</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="acquisitionMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acquisition method</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="border-white/8 bg-white/4">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {acquisitionMethodSchema.options.map((method) => (
                              <SelectItem key={method} value={method}>
                                {titleCase(method)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="acquisitionTool"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acquisition tool</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., FTK Imager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>MD5 hash</Label>
                    <Input
                      value="Generated after save"
                      readOnly
                      aria-readonly
                      className="font-mono text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SHA-256 hash</Label>
                    <Input
                      value="Generated after save"
                      readOnly
                      aria-readonly
                      className="font-mono text-muted-foreground"
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description / notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Evidence photos & videos</Label>
                  <label
                    htmlFor="evidencePhotosVideos"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/2 px-4 py-8 text-center text-muted-foreground transition-colors hover:bg-white/4"
                  >
                    <span className="flex items-center gap-2">
                      <FileImage className="size-5" />
                      <Video className="size-5" />
                    </span>
                    <span className="mt-3 text-sm font-medium">
                      Click or drag & drop photos/videos
                    </span>
                    <span className="mt-1 text-xs">
                      Supports JPG, PNG, MP4, MOV, etc.
                    </span>
                    <Input
                      id="evidencePhotosVideos"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="sr-only"
                      onChange={(event) =>
                        form.setValue("media", event.target.files, {
                          shouldValidate: true,
                        })
                      }
                    />
                  </label>
                  {media.length > 0 ? (
                    <div className="rounded-lg bg-white/3 px-3 py-2 text-xs text-muted-foreground">
                      <Upload className="mr-2 inline size-3.5" />
                      {media.length} {media.length === 1 ? "file" : "files"}{" "}
                      selected
                    </div>
                  ) : null}
                </div>
              </div>

              <DialogFooter className="border-t border-white/8 px-6 py-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createEvidenceMut.isPending}
                  className="bg-[hsl(213_94%_55%)] text-white hover:bg-[hsl(213_94%_48%)]"
                >
                  {createEvidenceMut.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Evidence"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedEvidence != null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSelectedEvidence(null);
        }}
      >
        <DialogContent className="max-h-[min(92vh,48rem)] overflow-y-auto rounded-2xl border-white/8 bg-[hsl(222_44%_8%/0.98)] p-0 text-foreground sm:max-w-2xl">
          {selectedEvidence ? (
            <>
              <DialogHeader className="border-b border-white/8 px-6 py-5">
                <div className="flex flex-wrap items-center gap-2 pr-8">
                  <Badge
                    variant="outline"
                    className="border-white/15 bg-white/4 font-mono text-[0.7rem] text-muted-foreground"
                  >
                    {selectedEvidence.evidenceNumber ?? selectedEvidence.id}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border font-medium",
                      statusBadgeClass(selectedEvidence.status),
                    )}
                  >
                    {titleCase(selectedEvidence.status ?? "received")}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl">
                  {selectedEvidence.label}
                </DialogTitle>
                <DialogDescription>
                  Associated with{" "}
                  {formatCaseNumber(caseById.get(selectedEvidence.caseId))}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 px-6 py-5">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    [
                      "Case",
                      formatCaseNumber(caseById.get(selectedEvidence.caseId)),
                    ],
                    [
                      "Type",
                      titleCase(selectedEvidence.evidenceType ?? "other"),
                    ],
                    ["Date seized", selectedEvidence.dateSeized ?? "Not set"],
                    [
                      "Storage location",
                      selectedEvidence.storageLocation ?? "Not set",
                    ],
                    ["Seized by", selectedEvidence.seizedBy ?? "Not set"],
                    [
                      "Acquisition method",
                      titleCase(selectedEvidence.acquisitionMethod ?? "other"),
                    ],
                    [
                      "Acquisition tool",
                      selectedEvidence.acquisitionTool ?? "Not set",
                    ],
                    [
                      "Serial number",
                      selectedEvidence.serialNumber ?? "Not set",
                    ],
                    ["Make", selectedEvidence.make ?? "Not set"],
                    ["Model", selectedEvidence.model ?? "Not set"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white/3 p-3">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                        {label}
                      </Label>
                      <p className="mt-1 wrap-break-word text-foreground">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="rounded-lg bg-white/3 p-3">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      MD5 hash
                    </Label>
                    <p className="mt-1 break-all font-mono text-xs text-foreground">
                      {selectedEvidence.hashMd5 ?? "Not generated"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/3 p-3">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      SHA-256 hash
                    </Label>
                    <p className="mt-1 break-all font-mono text-xs text-foreground">
                      {selectedEvidence.hashSha256 ?? "Not generated"}
                    </p>
                  </div>
                </div>

                {selectedEvidence.description ? (
                  <div className="rounded-lg bg-white/3 p-3">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Description / notes
                    </Label>
                    <p className="mt-1 text-sm text-foreground">
                      {selectedEvidence.description}
                    </p>
                  </div>
                ) : null}

                <div className="rounded-lg bg-white/3 p-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Evidence photos & videos
                  </Label>
                  {selectedEvidence.media?.length ? (
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {selectedEvidence.media.map((file) => (
                        <li
                          key={`${file.name}:${file.lastModified}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <span className="truncate">{file.name}</span>
                          <span className="shrink-0 text-xs">
                            {Math.ceil(file.size / 1024)} KB
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      No media attached.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
