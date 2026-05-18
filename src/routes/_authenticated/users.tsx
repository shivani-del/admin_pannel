import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/features/users/UsersPage";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({ meta: [{ title: "Users — Admin Panel" }] }),
  component: UsersPage,
});
