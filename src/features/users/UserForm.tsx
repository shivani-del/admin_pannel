import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/common/MultiSelect";
import { PROJECT_OPTIONS, BUDGET_OPTIONS } from "./constants";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "./schema";
import type { UserRow } from "./api";

interface Props {
  initial?: UserRow;
  onSubmit: (values: CreateUserInput | UpdateUserInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function UserForm({ initial, onSubmit, onCancel, submitting }: Props) {
  const isEdit = !!initial;
  const schema = isEdit ? updateUserSchema : createUserSchema;

  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: initial?.full_name ?? "",
      email: initial?.email ?? "",
      mobile: initial?.mobile ?? "",
      projects: initial?.projects ?? [],
      budgets: initial?.budgets ?? [],
      password: "",
      secure_pin: "",
    },
  });

  useEffect(() => {
    form.reset({
      full_name: initial?.full_name ?? "",
      email: initial?.email ?? "",
      mobile: initial?.mobile ?? "",
      projects: initial?.projects ?? [],
      budgets: initial?.budgets ?? [],
      password: "",
      secure_pin: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" error={errors.full_name?.message}>
          <Input {...form.register("full_name")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...form.register("email")} />
        </Field>
        <Field label="Mobile" error={errors.mobile?.message}>
          <Input {...form.register("mobile")} placeholder="+1 555 0100" />
        </Field>
        <Field
          label={isEdit ? "Password (leave blank to keep)" : "Password"}
          error={errors.password?.message}
        >
          <Input type="password" autoComplete="new-password" {...form.register("password")} disabled={isEdit} />
        </Field>
        <Field
          label={isEdit ? "Secure Pin (leave blank to keep)" : "Secure Pin"}
          error={errors.secure_pin?.message}
        >
          <Input type="password" inputMode="numeric" {...form.register("secure_pin")} disabled={isEdit} />
        </Field>
      </div>

      <Field label="Projects" error={errors.projects?.message as string | undefined}>
        <Controller
          control={form.control}
          name="projects"
          render={({ field }) => (
            <MultiSelect
              options={PROJECT_OPTIONS}
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="Select projects"
            />
          )}
        />
      </Field>

      <Field label="Budgets" error={errors.budgets?.message as string | undefined}>
        <Controller
          control={form.control}
          name="budgets"
          render={({ field }) => (
            <MultiSelect
              options={BUDGET_OPTIONS}
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder="Select budgets"
            />
          )}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create user"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
