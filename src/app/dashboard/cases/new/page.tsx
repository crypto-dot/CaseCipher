"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCase } from "@/lib/case-hooks";
import {
  casePrioritySchema,
  caseStatusLabel,
  caseStatusSchema,
  caseTypeSchema,
} from "@/lib/types/case-types";

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional();

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
  .optional()
  .or(z.literal(""));

const newCaseSchema = z.object({
  caseNumber: optionalText,
  caseName: z.string().trim().min(3, "Case name must be at least 3 characters"),
  status: caseStatusSchema,
  priority: casePrioritySchema,
  caseType: caseTypeSchema,
  requestor: optionalText,
  assignedExaminer: optionalText,
  subjectName: optionalText,
  department: optionalText,
  dateReceived: optionalDate,
  dateDue: optionalDate,
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
});

type NewCaseTypes = z.infer<typeof newCaseSchema>;

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function NewCasePage() {
  const router = useRouter();
  const createCaseMut = useCreateCase();

  const form = useForm<NewCaseTypes>({
    resolver: zodResolver(newCaseSchema),
    defaultValues: {
      caseNumber: "",
      caseName: "",
      description: "",
      status: "new_case",
      priority: "medium",
      caseType: "HR Misconduct",
      requestor: "",
      assignedExaminer: "",
      subjectName: "",
      department: "",
      dateReceived: "",
      dateDue: "",
    },
    mode: "onSubmit",
  });

  async function onSubmit(values: NewCaseTypes) {
    await createCaseMut.mutateAsync({
      caseNumber: values.caseNumber,
      caseName: values.caseName,
      description: values.description || undefined,
      status: values.status,
      priority: values.priority,
      caseType: values.caseType,
      requestor: values.requestor,
      assignedExaminer: values.assignedExaminer,
      subjectName: values.subjectName,
      department: values.department,
      dateReceived: values.dateReceived || undefined,
      dateDue: values.dateDue || undefined,
    });
    router.push("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Create new case
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the full case intake details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case details</CardTitle>
          <CardDescription>
            These fields match the new-case intake workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="caseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case number</FormLabel>
                      <FormControl>
                        <Input placeholder="CSE-26-0545" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="caseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Evidence packet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                          {caseStatusSchema.options.map((status) => (
                            <SelectItem key={status} value={status}>
                              {caseStatusLabel(status)}
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
                          {casePrioritySchema.options.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {titleCase(priority)}
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
                  name="caseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select case type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {caseTypeSchema.options.map((caseType) => (
                            <SelectItem key={caseType} value={caseType}>
                              {caseType}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="requestor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requestor</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. HR Department, Legal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedExaminer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned examiner</FormLabel>
                      <FormControl>
                        <Input placeholder="Examiner name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subjectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Person under investigation"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Subject's department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateReceived"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date received</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateDue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date due</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                        placeholder="Context, next steps, key people involved..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCaseMut.isPending}>
                  {createCaseMut.isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create case"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
