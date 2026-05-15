import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { AuthUserRow } from "@/lib/cms-types";
import { createAuthUser, deleteAuthUser, updateAuthUser } from "@/server/kbeauty-rpc";

type Props = {
  users: AuthUserRow[];
  currentUserId: string;
  onChanged: () => void;
};

export function AdminUsersPanel({ users, currentUserId, onChanged }: Props) {
  const createFn = useServerFn(createAuthUser);
  const updateFn = useServerFn(updateAuthUser);
  const deleteFn = useServerFn(deleteAuthUser);

  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [busy, setBusy] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const startEdit = (u: AuthUserRow) => {
    setEditId(u.id);
    setEditEmail(u.email);
    setEditPassword("");
    setShowCreate(false);
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await createFn({ data: { email: createEmail, password: createPassword } });
      if (!res.ok) {
        toast.error("message" in res && res.message ? res.message : "Could not create user.");
        return;
      }
      toast.success("User created");
      setShowCreate(false);
      setCreateEmail("");
      setCreatePassword("");
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setBusy(true);
    try {
      const res = await updateFn({
        data: {
          id: editId,
          ...(editEmail.trim() ? { email: editEmail.trim() } : {}),
          ...(editPassword ? { password: editPassword } : {}),
        },
      });
      if (!res.ok) {
        if (res.error === "NOTHING_TO_UPDATE") {
          toast.message("Enter a new email or password.");
          return;
        }
        toast.error("message" in res && res.message ? res.message : "Could not update user.");
        return;
      }
      toast.success("User updated");
      setEditId(null);
      setEditPassword("");
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (u: AuthUserRow) => {
    if (u.id === currentUserId) {
      toast.error("You cannot delete your own account while signed in.");
      return;
    }
    if (!window.confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await deleteFn({ data: { id: u.id } });
      if (!res.ok) {
        toast.error("message" in res && res.message ? res.message : "Could not delete user.");
        return;
      }
      toast.success("User deleted");
      if (editId === u.id) setEditId(null);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Admin users</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Supabase Authentication users who can sign in at /backend.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setShowCreate((v) => !v);
            setEditId(null);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary disabled:opacity-50 self-start"
        >
          <Plus className="w-4 h-4" />
          Add user
        </button>
      </div>

      {showCreate ? (
        <form
          onSubmit={onCreate}
          className="rounded-2xl border border-border bg-background p-5 space-y-4 max-w-md"
        >
          <h3 className="text-sm font-medium">New admin user</h3>
          <Field label="Email" type="email" value={createEmail} onChange={setCreateEmail} required />
          <Field
            label="Password"
            type="password"
            value={createPassword}
            onChange={setCreatePassword}
            required
            minLength={8}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-foreground text-background px-5 py-2 text-sm hover:bg-primary disabled:opacity-50"
            >
              Create user
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-full border border-border px-5 py-2 text-sm hover:border-primary/40"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {editId ? (
        <form
          onSubmit={onUpdate}
          className="rounded-2xl border border-primary/30 bg-background p-5 space-y-4 max-w-md"
        >
          <h3 className="text-sm font-medium">Edit user</h3>
          <Field label="Email" type="email" value={editEmail} onChange={setEditEmail} required />
          <Field
            label="New password (leave blank to keep)"
            type="password"
            value={editPassword}
            onChange={setEditPassword}
            minLength={8}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-foreground text-background px-5 py-2 text-sm hover:bg-primary disabled:opacity-50"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setEditId(null)}
              className="rounded-full border border-border px-5 py-2 text-sm hover:border-primary/40"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Confirmed</th>
              <th className="p-3">Last sign-in</th>
              <th className="p-3 w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border align-middle">
                <td className="p-3">
                  <span className="font-medium">{u.email}</span>
                  {u.id === currentUserId ? (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-primary">You</span>
                  ) : null}
                </td>
                <td className="p-3 text-muted-foreground">{u.emailConfirmed ? "Yes" : "No"}</td>
                <td className="p-3 text-muted-foreground whitespace-nowrap">
                  {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleString() : "—"}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => startEdit(u)}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary"
                      aria-label={`Edit ${u.email}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busy || u.id === currentUserId}
                      onClick={() => void onDelete(u)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-40"
                      aria-label={`Delete ${u.email}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No users yet. Add one above.</p>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}
