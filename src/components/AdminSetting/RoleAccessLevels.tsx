import React, { useState, useMemo, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/common/Datatable";
import { TableSearch } from "@/common/TableSearch";
import { Pagination } from "@/common/Pagination";
import { TableToolbarActions } from "@/common/TableToolbarActions";
import { exportToCsv } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import BackToSetting from "../BackToSetting";

export interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  designation: string;
  vertical: string;
  role: "admin" | "user";
  active: boolean;
  altEmail?: string;
}

const VERTICALS = [
  "Automotive & Mobility",
  "Digital & Enterprise IT",
  "Industrial & Semiconductor",
  "Healthcare & Life Sciences",
  "Corporate Functions",
];

const ROLES: ("admin" | "user")[] = ["user", "admin"];

const INITIAL_USERS: EnterpriseUser[] = [
  {
    id: "u_user",
    name: "Demo User",
    email: "user@srmtech.com",
    password: "123",
    designation: "Senior Business Analyst",
    vertical: "Digital & Enterprise IT",
    role: "user",
    active: true,
  },
  {
    id: "u_admin",
    name: "Demo Admin",
    email: "admin@srmtech.com",
    password: "123",
    designation: "VP & Head of Operations",
    vertical: "Corporate Functions",
    role: "admin",
    active: true,
  },
  {
    id: "u_priya",
    name: "Priya Nair",
    email: "priya.nair@srmtech.com",
    password: "123",
    designation: "Senior Project Manager",
    vertical: "Automotive & Mobility",
    role: "user",
    active: true,
  },
  {
    id: "u_karthik",
    name: "Karthik Raman",
    email: "karthik.raman@srmtech.com",
    password: "123",
    designation: "Corporate Finance Controller",
    vertical: "Corporate Functions",
    role: "admin",
    active: true,
  },
  {
    id: "u_rajesh",
    name: "Dr. Rajesh Varma",
    email: "rajesh.varma@srmtech.com",
    password: "123",
    designation: "Lead Clinical Systems Specialist",
    vertical: "Healthcare & Life Sciences",
    role: "user",
    active: true,
  },
  {
    id: "u_ananya",
    name: "Ananya Deshmukh",
    email: "ananya.deshmukh@srmtech.com",
    password: "123",
    designation: "Semiconductor Engineering Lead",
    vertical: "Industrial & Semiconductor",
    role: "admin",
    active: true,
  },
  {
    id: "u_vikram",
    name: "Vikram Seth",
    email: "vikram.seth@srmtech.com",
    password: "123",
    designation: "Senior DevOps & Cloud Architect",
    vertical: "Digital & Enterprise IT",
    role: "user",
    active: true,
  },
  {
    id: "u_meera",
    name: "Meera Krishnan",
    email: "meera.krishnan@srmtech.com",
    password: "123",
    designation: "Head of Brand & Digital Marketing",
    vertical: "Corporate Functions",
    role: "user",
    active: true,
  },
];

const STORAGE_KEY = "easyapprove_enterprise_users";

export const RoleAccessLevels: React.FC = () => {
  const [users, setUsers] = useState<EnterpriseUser[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_USERS;
  });

  const saveUsers = (updated: EnterpriseUser[]) => {
    setUsers(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verticalFilter, setVerticalFilter] = useState("all");

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [draftRole, setDraftRole] = useState("all");
  const [draftStatus, setDraftStatus] = useState("all");
  const [draftVertical, setDraftVertical] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EnterpriseUser | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formVertical, setFormVertical] = useState(VERTICALS[0]);
  const [formRole, setFormRole] = useState<"admin" | "user">("user");
  const [formActive, setFormActive] = useState<"Active" | "Inactive">("Active");
  const [formPassword, setFormPassword] = useState("123");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sessionEmail = localStorage.getItem("userEmail") || "admin@srmtech.com";

  // Filter Logic
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter !== "all" && (statusFilter === "active" ? !u.active : u.active)) return false;
      if (verticalFilter !== "all" && u.vertical !== verticalFilter) return false;

      if (!q) return true;
      const haystack = `${u.name} ${u.email} ${u.designation} ${u.vertical} ${u.role}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [users, search, roleFilter, statusFilter, verticalFilter]);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, verticalFilter]);

  // Pagination Slice
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Active filter check
  const hasActiveFilters =
    roleFilter !== "all" || statusFilter !== "all" || verticalFilter !== "all";

  const activeFilterCount =
    (roleFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (verticalFilter !== "all" ? 1 : 0);

  const handleOpenFilterPanel = () => {
    setDraftRole(roleFilter);
    setDraftStatus(statusFilter);
    setDraftVertical(verticalFilter);
    setIsFilterPanelOpen(true);
  };

  const handleApplyFilters = () => {
    setRoleFilter(draftRole);
    setStatusFilter(draftStatus);
    setVerticalFilter(draftVertical);
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
    toast.success("Filters applied.");
  };

  const handleResetFilters = () => {
    setDraftRole("all");
    setDraftStatus("all");
    setDraftVertical("all");
    setRoleFilter("all");
    setStatusFilter("all");
    setVerticalFilter("all");
    setCurrentPage(1);
    setIsFilterPanelOpen(false);
    toast.info("Filters cleared.");
  };

  const filterPanelContent = (
    <div className="space-y-5 text-xs">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Security Role
        </label>
        <select
          value={draftRole}
          onChange={(e) => setDraftRole(e.target.value)}
          className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Account Status
        </label>
        <select
          value={draftStatus}
          onChange={(e) => setDraftStatus(e.target.value)}
          className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Business Vertical
        </label>
        <select
          value={draftVertical}
          onChange={(e) => setDraftVertical(e.target.value)}
          className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
        >
          <option value="all">All Verticals</option>
          {VERTICALS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Admin Guard from Prototype
  const adminGuard = (user: EnterpriseUser, newRole: "admin" | "user", newActive: boolean) => {
    if (user.email.toLowerCase() === sessionEmail.toLowerCase() && !newActive) {
      return "You cannot deactivate your own administrative account.";
    }
    const wasActiveAdmin = user.role === "admin" && user.active;
    if (
      wasActiveAdmin &&
      (newRole !== "admin" || !newActive) &&
      users.filter((u) => u.role === "admin" && u.active).length <= 1
    ) {
      return "At least one active administrator is required to maintain system access.";
    }
    return "";
  };

  // Toggle user active status
  const handleToggleUser = (user: EnterpriseUser) => {
    const newActive = !user.active;
    if (!newActive) {
      const guard = adminGuard(user, user.role, false);
      if (guard) {
        toast.error(guard);
        return;
      }
    }
    const updated = users.map((u) => (u.id === user.id ? { ...u, active: newActive } : u));
    saveUsers(updated);
    toast.success(`User ${user.name} ${newActive ? "activated" : "deactivated"}.`);
  };

  // Open modal for Create
  const handleAddUser = () => {
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormDesignation("");
    setFormVertical(VERTICALS[1]);
    setFormRole("user");
    setFormActive("Active");
    setFormPassword("123");
    setErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleEditUser = (user: EnterpriseUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormDesignation(user.designation);
    setFormVertical(user.vertical);
    setFormRole(user.role);
    setFormActive(user.active ? "Active" : "Inactive");
    setFormPassword("");
    setErrors({});
    setIsModalOpen(true);
  };

  // Submit Modal
  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const name = formName.trim();
    const email = formEmail.trim().toLowerCase();
    const designation = formDesignation.trim();
    const active = formActive === "Active";

    if (!name) newErrors.name = "Enter the full name.";

    if (!editingUser) {
      if (!email) {
        newErrors.email = "Enter a valid email address.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Enter a valid email address.";
      } else if (
        !email.endsWith("@srmtech.com") &&
        !email.endsWith("@srmuniv.ac.in") &&
        !email.endsWith("@srmist.edu.in")
      ) {
        newErrors.email = "Must use an approved SRM domain (@srmtech.com, @srmuniv.ac.in, @srmist.edu.in).";
      } else if (users.some((u) => u.email.toLowerCase() === email)) {
        newErrors.email = "A user with this email already exists.";
      }
      if (!formPassword) {
        newErrors.password = "Enter a demo password.";
      }
    }

    if (!designation) newErrors.designation = "Enter the employee designation.";
    if (!formVertical) newErrors.vertical = "Select a business vertical.";

    if (editingUser) {
      const guard = adminGuard(editingUser, formRole, active);
      if (guard) newErrors.role = guard;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please resolve the highlighted validation errors.");
      return;
    }

    if (editingUser) {
      const updated = users.map((u) => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name,
            designation,
            vertical: formVertical,
            role: formRole,
            active,
            ...(formPassword ? { password: formPassword } : {}),
          };
        }
        return u;
      });
      saveUsers(updated);
      toast.success(`User ${editingUser.name} successfully updated.`);
    } else {
      const newUser: EnterpriseUser = {
        id: `u_${Date.now()}`,
        name,
        email,
        password: formPassword || "123",
        designation,
        vertical: formVertical,
        role: formRole,
        active,
      };
      saveUsers([...users, newUser]);
      toast.success(`User ${name} created.`);
    }

    setIsModalOpen(false);
  };

  const handleExportUsers = () => {
    const exportData = filteredUsers.map((u) => ({
      "Full Name": u.name,
      "Official Email": u.email,
      "Designation": u.designation,
      "Business Vertical": u.vertical,
      "Role": u.role === "admin" ? "Admin" : "User",
      "Status": u.active ? "Active" : "Inactive",
    }));
    exportToCsv(exportData, "users-directory.csv");
    toast.success("Users directory exported to CSV successfully.");
  };

  // Columns definition matching HTML prototype
  const columns = useMemo<ColumnDef<EnterpriseUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Full Name",
        cell: ({ row }) => (
          <div className="font-semibold text-slate-900 whitespace-nowrap min-w-[9rem]">
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Official Email",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600 whitespace-nowrap min-w-[11rem]">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => (
          <span className="text-slate-800 text-xs whitespace-nowrap min-w-[10rem]">
            {row.original.designation}
          </span>
        ),
      },
      {
        accessorKey: "vertical",
        header: "Business Vertical",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-slate-700 whitespace-nowrap min-w-[11rem]">
            {row.original.vertical}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const isAdmin = row.original.role === "admin";
          return (
            <div className="min-w-[5rem]">
              <span
                className={`badge ${
                  isAdmin ? "badge-reassigned" : "badge-withdrawn"
                }`}
              >
                {isAdmin ? "Admin" : "User"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.active;
          return (
            <div className="min-w-[5.5rem]">
              <span
                className={`badge ${
                  isActive ? "badge-approved" : "badge-rejected"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-1.5 min-w-[9.5rem] whitespace-nowrap">
              <button
                type="button"
                onClick={() => handleEditUser(u)}
                className="btn btn-sm btn-outline !text-xs flex items-center gap-1 cursor-pointer"
                title="Edit user details"
              >
                <i className="fa-solid fa-pen text-[10px]"></i> Edit
              </button>
              <button
                type="button"
                onClick={() => handleToggleUser(u)}
                className={`btn btn-sm ${
                  u.active ? "btn-danger-outline" : "btn-outline"
                } !text-xs cursor-pointer`}
                title={u.active ? "Deactivate account" : "Activate account"}
              >
                {u.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, sessionEmail]
  );

  return (
    <div className="p-3.5 sm:p-5 md:p-6 space-y-5">
      {/* Show back button only if navigated from admin settings subpages */}
      {window.location.pathname.includes("/admin-setting/") && (
        <div className="mb-2">
          <BackToSetting />
        </div>
      )}

      {/* Page Header matching HTML prototype */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Groups &amp; Users Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage employee roles, approval permissions, and organizational verticals.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddUser}
          className="btn btn-primary flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
        >
          <i className="fa-solid fa-user-plus mr-1"></i> Add Enterprise User
        </button>
      </div>

      {/* Main Card */}
      <section className="card bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Toolbar matching Prototype */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <TableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by name, email, designation..."
              allowClear
            />
          </div>

          <TableToolbarActions
            isFilterOpen={isFilterPanelOpen}
            onOpenFilter={handleOpenFilterPanel}
            onCloseFilter={() => setIsFilterPanelOpen(false)}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleResetFilters}
            filterPanelTitle="Filter Users Directory"
            filterPanelContent={filterPanelContent}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            onExport={handleExportUsers}
            exportTitle="Export Users CSV"
            onPrint={() => window.print()}
            showFilterAction={true}
          />
        </div>

        {/* Reusable Data Table with contained horizontal scroll and aligned cells */}
        <DataTable
          columns={columns}
          data={paginatedUsers}
          emptyMessage="No users match your search query."
          containerClassName="rounded-none border-0 shadow-none overflow-x-auto"
          tableClassName="w-full border-collapse table-auto text-left min-w-[700px]"
          headerClassName="bg-[#0B132B]"
          headCellClassName="text-xs font-semibold text-white tracking-normal py-3.5 px-4"
          cellClassName="py-3 px-4 text-xs border-b border-slate-100 align-middle"
          rowClassName="hover:bg-slate-50/80 transition"
        />

        {/* Reusable Shared Pagination */}
        {filteredUsers.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalRecords={filteredUsers.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>
        )}
      </section>

      {/* Add / Edit Enterprise User Modal matching HTML prototype */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <i className={`fa-solid ${editingUser ? "fa-user-pen text-blue-600" : "fa-user-plus text-[#08805e]"}`}></i>
                {editingUser ? "Edit Enterprise User" : "Add Enterprise User"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none cursor-pointer p-1"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Enter full employee name"
                  className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${
                    errors.name ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:border-[#08805e] focus:ring-[#08805e]/20"
                  }`}
                  required
                />
                {errors.name && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.name}</p>}
              </div>

              {/* Official SRM Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official SRM Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formEmail}
                  readOnly={!!editingUser}
                  onChange={(e) => {
                    setFormEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="name@srmtech.com"
                  className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${
                    editingUser
                      ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                      : errors.email
                      ? "border-rose-400 focus:ring-rose-200"
                      : "border-slate-300 focus:border-[#08805e] focus:ring-[#08805e]/20"
                  }`}
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {editingUser
                    ? "Official email cannot be modified."
                    : "Authorized domains: @srmtech.com, @srmuniv.ac.in, @srmist.edu.in"}
                </p>
                {errors.email && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>}
              </div>

              {/* Designation / Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formDesignation}
                  onChange={(e) => {
                    setFormDesignation(e.target.value);
                    if (errors.designation) setErrors((prev) => ({ ...prev, designation: "" }));
                  }}
                  placeholder="e.g. Senior Project Manager"
                  className={`w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 transition ${
                    errors.designation ? "border-rose-400 focus:ring-rose-200" : "border-slate-300 focus:border-[#08805e] focus:ring-[#08805e]/20"
                  }`}
                  required
                />
                {errors.designation && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.designation}</p>
                )}
              </div>

              {/* Business Vertical */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Vertical <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formVertical}
                  onChange={(e) => setFormVertical(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
                  required
                >
                  {VERTICALS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Security Role & Account Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Security Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as "admin" | "user")}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r === "admin" ? "Admin" : "User"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formActive}
                    onChange={(e) => setFormActive(e.target.value as "Active" | "Inactive")}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {errors.role && <p className="text-[11px] text-rose-600 font-medium">{errors.role}</p>}

              {/* Demo Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {editingUser ? "Reset Demo Password" : "Demo Password"} {!editingUser && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={editingUser ? "Leave blank to preserve current password" : "123"}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#08805e] focus:ring-2 focus:ring-[#08805e]/20 transition font-mono"
                  required={!editingUser}
                />
                <p className="text-[11px] text-slate-400 mt-1">Demo sandbox simulation only.</p>
                {errors.password && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.password}</p>}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#08805e] hover:bg-[#06684c] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAccessLevels;