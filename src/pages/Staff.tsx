/** Staff management — roles, invites, permissions matrix. */
import React, { useState } from "react";
import { Check, Minus, Plus, ShieldCheck, UserRound, UserRoundPlus, Users } from "lucide-react";
import { Avatar, Badge, Button, Card, CardHead, Field, Input, Modal, PageHeader, Select, StatCard, statusTone } from "../components/ui";
import { useApp } from "../state/store";
import type { StaffMember } from "../data/mockData";
import { fmtDay, uid } from "../lib/format";
import { planLimit } from "../lib/plans";

const ROLES: StaffMember["role"][] = ["Owner", "Admin", "Manager", "Cashier", "Staff"];

const PERMISSIONS: Array<{ label: string; roles: Record<string, boolean> }> = [
  { label: "Record sales", roles: { Owner: true, Admin: true, Manager: true, Cashier: true, Staff: true } },
  { label: "View stock levels", roles: { Owner: true, Admin: true, Manager: true, Cashier: true, Staff: true } },
  { label: "Add / edit products", roles: { Owner: true, Admin: true, Manager: true, Cashier: false, Staff: false } },
  { label: "Record expenses", roles: { Owner: true, Admin: true, Manager: true, Cashier: false, Staff: false } },
  { label: "View profit & reports", roles: { Owner: true, Admin: true, Manager: true, Cashier: false, Staff: false } },
  { label: "Manage staff & settings", roles: { Owner: true, Admin: true, Manager: false, Cashier: false, Staff: false } },
];

export default function Staff() {
  const { data, dispatch, toast } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Cashier" as StaffMember["role"] });
  const [errs, setErrs] = useState<{ name?: string; email?: string }>({});

  const active = data.staff.filter((s) => s.status === "Active").length;

  const save = () => {
    if (data.staff.length >= planLimit(data.plan, "staff")) {
      toast("Your plan has reached its staff limit. Upgrade to add team members.", "warning");
      return;
    }
    const e: typeof errs = {};
    if (form.name.trim().length < 2) e.name = "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    setErrs(e);
    if (Object.keys(e).length) return;
    dispatch({
      type: "STAFF_SAVE",
      member: { id: uid("st"), name: form.name.trim(), email: form.email.trim(), role: form.role, status: "Invited", lastActive: new Date().toISOString() },
    });
    toast(`Invite request created for ${form.email.trim()}.`);
    setOpen(false);
    setForm({ name: "", email: "", role: "Cashier" });
  };

  const setStatus = (s: StaffMember, status: StaffMember["status"]) => {
    dispatch({ type: "STAFF_STATUS", id: s.id, status });
    toast(status === "Suspended" ? `${s.name} suspended.` : `${s.name} reactivated.`, status === "Suspended" ? "warning" : "success");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Staff" sub="Your team and what each role can do"
        actions={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> Add Staff</Button>} />

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Team Members" value={data.staff.length} prefix="" icon={<Users className="size-4" />} tone="brand" sub={<span>on the books</span>} />
        <StatCard label="Active Now" value={active} prefix="" icon={<UserRound className="size-4" />} tone="ok" sub={<span>signed in recently</span>} />
        <StatCard label="Pending Invites" value={data.staff.filter((s) => s.status === "Invited").length} prefix="" icon={<UserRoundPlus className="size-4" />} tone="warn" sub={<span>waiting to join</span>} />
      </div>

      <Card className="overflow-hidden">
        <div className="tbl-wrap">
          <table className="tbl !min-w-[720px]">
            <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Last Active</th><th className="!text-right">Actions</th></tr></thead>
            <tbody>
              {data.staff.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} />
                      <div>
                        <p className="font-bold text-ink">{s.name}</p>
                        <p className="text-[11px] text-faint">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge tone={s.role === "Owner" ? "gold" : s.role === "Admin" || s.role === "Manager" ? "brand" : "neutral"}>
                      {s.role === "Owner" && <ShieldCheck className="size-3" />}{s.role}
                    </Badge>
                  </td>
                  <td><Badge tone={statusTone(s.status)} dot={s.status === "Active"}>{s.status}</Badge></td>
                  <td className="text-sub">{fmtDay(s.lastActive)}</td>
                  <td className="text-right">
                    {s.role !== "Owner" && (
                      s.status === "Suspended"
                        ? <Button size="sm" variant="success" onClick={() => setStatus(s, "Active")}>Reactivate</Button>
                        : <Button size="sm" variant="secondary" onClick={() => setStatus(s, "Suspended")}>Suspend</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHead title="Role permissions" sub="What each role can see and do on the Business plan" />
        <div className="tbl-wrap mt-3">
          <table className="tbl !min-w-[680px]">
            <thead><tr><th>Capability</th>{ROLES.map((r) => <th key={r} className="!text-center">{r}</th>)}</tr></thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.label}>
                  <td className="font-semibold text-ink">{p.label}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="text-center">
                      {p.roles[r] ? <Check className="size-4 text-ok inline" /> : <Minus className="size-4 text-line2 inline" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add staff member" sub="They'll receive an invite by email"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Send Invite</Button></>}>
        <div className="space-y-4">
          <Field label="Full name" error={errs.name}>
            <Input value={form.name} invalid={!!errs.name} placeholder="Kojo Antwi" onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Email" error={errs.email}>
            <Input type="email" value={form.email} invalid={!!errs.email} placeholder="kojo@gmail.com" onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Role" hint="Cashiers can sell but can't see your profit.">
            <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as StaffMember["role"] }))}>
              {ROLES.filter((r) => r !== "Owner").map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
