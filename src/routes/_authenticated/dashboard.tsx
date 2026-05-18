import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/AuthProvider";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Admin Panel" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAdmin } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin
            ? "You have admin access. Manage users from the Users tab."
            : "You're signed in as a regular user."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Account", value: user?.email ?? "—" },
          { label: "Role", value: isAdmin ? "Admin" : "User" },
          { label: "Status", value: "Active" },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className="mt-1.5 font-medium truncate">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
