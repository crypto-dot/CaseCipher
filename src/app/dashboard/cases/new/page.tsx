"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCase } from "@/lib/case-hooks";
import {
  type CaseAttachment,
  type CasePriority,
  casePrioritySchema,
  caseStatusLabel,
  caseStatusSchema,
} from "@/lib/types/case-types";
import { type Assignee, getAssigneeFullName, mockAssignees } from "@/lib/mocks";
import { cn } from "@/lib/utils";

function toAttachmentMeta(files: FileList | null): CaseAttachment[] {
  if (!files) return [];
  return Array.from(files).map((f) => ({
    name: f.name,
    size: f.size,
    type: f.type || "application/octet-stream",
    lastModified: f.lastModified,
  }));
}

const newCaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  client: z.string().min(2, "Client must be at least 2 characters"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  status: caseStatusSchema,
  assignee: z.string().optional(),
  priority: casePrioritySchema,
  incidentDate: z.date().optional(),
  incidentTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Use HH:mm")
    .optional()
    .or(z.literal("")),
  attachments: z.any().optional(), // FileList from <input type="file" />
});

type NewCaseTypes = z.infer<typeof newCaseSchema>;

export default function NewCasePage() {
  const router = useRouter();
  const createCaseMut = useCreateCase();

  const form = useForm<NewCaseTypes>({
    resolver: zodResolver(newCaseSchema),
    defaultValues: {
      title: "",
      client: "",
      description: "",
      status: "new_case",
      assignee: undefined,
      priority: "medium",
      incidentDate: undefined,
      incidentTime: "",
      attachments: undefined,
    },
    mode: "onSubmit",
  });

  const files = form.watch("attachments") as FileList | undefined;
  const fileMetas = React.useMemo(
    () => toAttachmentMeta(files ?? null),
    [files],
  );

  async function onSubmit(values: NewCaseTypes) {
    await createCaseMut.mutateAsync({
      title: values.title,
      client: values.client,
      description: values.description || undefined,
      status: values.status,
      assignedTo: values.assignee || "",
      priority: values.priority,
      incidentDate: values.incidentDate
        ? format(values.incidentDate, "yyyy-MM-dd")
        : undefined,
      incidentTime: values.incidentTime || undefined,
      attachments: fileMetas.length ? fileMetas : undefined,
    });
    router.push("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create case</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Full intake details for a new case.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case details</CardTitle>
          <CardDescription>
            Fill out the intake fields; attachments are stored as metadata
            locally.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Intake: slip-and-fall incident"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Northwind Logistics"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Context, next steps, key people involved…"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional. Include anything that helps triage.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {caseStatusSchema.options.map((s) => (
                            <SelectItem key={s} value={s}>
                              {caseStatusLabel(s)}
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
                  name="assignee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockAssignees.map((assignee: Assignee) => (
                            <SelectItem key={assignee.id} value={assignee.id}>
                              {getAssigneeFullName(assignee)}
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(
                            Object.keys(
                              casePrioritySchema,
                            ) as Array<CasePriority>
                          ).map((p: CasePriority) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="incidentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value, "PPP")
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Optional.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="incidentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>Optional.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments</Label>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(e) =>
                    form.setValue("attachments", e.target.files as FileList, {
                      shouldValidate: true,
                    })
                  }
                />
                <div className="text-xs text-muted-foreground">
                  Attach files to this case. (This demo stores file metadata
                  locally.)
                </div>
                {fileMetas.length ? (
                  <div className="rounded-md border p-3">
                    <div className="text-xs font-medium text-muted-foreground">
                      Selected files
                    </div>
                    <ul className="mt-2 space-y-1 text-sm">
                      {fileMetas.map((f) => (
                        <li
                          key={`${f.name}:${f.lastModified}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <span className="truncate">{f.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {Math.ceil(f.size / 1024)} KB
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <Separator />

              <Button
                type="submit"
                className="w-fit"
                disabled={createCaseMut.isPending}
              >
                {createCaseMut.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create case"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
