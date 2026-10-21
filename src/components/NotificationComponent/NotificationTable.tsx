import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Bell, Check, Eye } from "lucide-react";
import { nominationService } from "@/services/nominationService";
import type { SystemNotification } from "@/mocks/notifications.mock";
import { DataTable } from "@/common/Datatable";
import { Pagination } from "@/common/Pagination";
import { TableSearch } from "@/common/TableSearch";
import { ActionMenu } from "@/common/ActionMenu";
import { toast } from "@/components/ui/sonner";

export const NotificationTable: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<SystemNotification[]>(() =>
    nominationService.getNotifications()
  );
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const refreshNotifications = () => {
    setNotifications(nominationService.getNotifications());
  };

  useEffect(() => {
    refreshNotifications();
    window.addEventListener("easyapprove_notifications_updated", refreshNotifications);
    return () => {
      window.removeEventListener("easyapprove_notifications_updated", refreshNotifications);
    };
  }, []);

  // Reset to page 1 whenever filter or search changes
  const handleFilterChange = (newFilter: "all" | "unread") => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id?: string) => {
    if (!id) return;
    nominationService.markNotificationRead(id);
    toast.success("Notification marked as read.");
  };

  const handleViewDetails = (notif: SystemNotification) => {
    const reqId = notif.requestId;
    if (!reqId) {
      toast.info("No linked request found for this notification.");
      return;
    }

    const isApprovalRelated =
      notif.type?.toLowerCase().includes("approval required") ||
      notif.type?.toLowerCase().includes("referral request") ||
      notif.title?.toLowerCase().includes("approval") ||
      notif.title?.toLowerCase().includes("delegated") ||
      notif.title?.toLowerCase().includes("clarification needed");

    try {
      sessionStorage.setItem(
        "ea_nav_source",
        JSON.stringify({
          page: "notifications",
          label: "Notifications",
          url: "/notifications",
        })
      );
    } catch { }

    if (isApprovalRelated) {
      navigate(`/approvals/${reqId}`);
    } else {
      navigate(`/my-nominations/${reqId}`);
    }
  };

  // Filter list by tab and search query
  const filteredList = useMemo(() => {
    const base = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;
    if (!search.trim()) return base;
    const q = search.trim().toLowerCase();
    return base.filter(
      (n) =>
        (n.type && n.type.toLowerCase().includes(q)) ||
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.message && n.message.toLowerCase().includes(q)) ||
        (n.time && n.time.toLowerCase().includes(q))
    );
  }, [notifications, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedList = useMemo(() => {
    return filteredList.slice(
      (safeCurrentPage - 1) * pageSize,
      safeCurrentPage * pageSize
    );
  }, [filteredList, safeCurrentPage, pageSize]);

  // Standardized columns matching required schema: Type, Message, Time (+ Actions)
  const columns = useMemo<ColumnDef<SystemNotification>[]>(
    () => [
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const n = row.original;
          const isUnread = !n.read;
          const typeText = n.type || n.title || "Notification";
          const isApproval =
            typeText.toLowerCase().includes("approval") ||
            typeText.toLowerCase().includes("review");
          const isApproved = typeText.toLowerCase().includes("approved");
          const isReferral = typeText.toLowerCase().includes("referral");

          const badgeClass = isApproved
            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
            : isApproval
            ? "bg-amber-50 text-amber-800 border-amber-200/80"
            : isReferral
            ? "bg-blue-50 text-blue-700 border-blue-200/80"
            : "bg-slate-100 text-slate-700 border-slate-200";

          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              {isUnread && (
                <span
                  className="w-2 h-2 rounded-full bg-blue-600 shrink-0"
                  title="Unread notification"
                />
              )}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}
              >
                {typeText}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "message",
        header: "Message",
        cell: ({ row }) => {
          const n = row.original;
          const isUnread = !n.read;
          return (
            <div className="max-w-xl py-0.5">
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isUnread ? "font-semibold text-slate-900" : "text-slate-700"
                }`}
              >
                {n.message}
              </p>
              {n.title && n.title !== n.type && (
                <p className="text-[11px] text-slate-400 mt-0.5">{n.title}</p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => {
          const n = row.original;
          return (
            <span className="font-mono text-xs text-slate-500 whitespace-nowrap">
              {n.time || "Just now"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const n = row.original;
          const isUnread = !n.read;

          const actions = [
            ...(n.requestId
              ? [
                  {
                    label: "View Details",
                    icon: <Eye className="w-4 h-4 text-blue-600 mr-2" />,
                    onClick: () => handleViewDetails(n),
                  },
                ]
              : []),
            ...(isUnread && n.id
              ? [
                  {
                    label: "Mark Read",
                    icon: <Check className="w-4 h-4 text-emerald-600 mr-2" />,
                    variant: "success" as const,
                    onClick: () => handleMarkAsRead(n.id),
                  },
                ]
              : []),
          ];

          if (actions.length === 0) return null;

          return (
            <div className="flex items-center justify-center w-full">
              <ActionMenu item={n} actions={actions} />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="space-y-4">
      {/* Standard Card Container matching Approval List */}
      <section className="card bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header Section matching standardized table toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          {/* Left: Icon Badge + Filter Tabs */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60 shadow-xs">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            {/* Filter Tabs matching HTML Prototype */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleFilterChange("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filter === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Notifications
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange("unread")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  filter === "unread"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right: Search */}
          <div className="w-full sm:w-64 md:w-72">
            <TableSearch
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search notifications..."
              allowClear
            />
          </div>
        </div>

        {/* Standardized React DataTable Component */}
        <DataTable
          columns={columns}
          data={paginatedList}
          emptyMessage="No notifications found in this view."
          tableClassName="tbl"
          headerClassName="bg-[#0B132B]"
          headCellClassName="text-xs font-semibold text-white tracking-normal py-3.5 px-4"
          cellClassName="py-3.5 px-4 text-xs border-b border-slate-100"
          rowClassName={(row) =>
            !row.read
              ? "bg-blue-50/40 hover:bg-blue-50/60 transition"
              : "hover:bg-slate-50/80 transition"
          }
        />

        {/* Standardized React Pagination Component */}
        {filteredList.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <Pagination
              currentPage={safeCurrentPage}
              pageSize={pageSize}
              totalRecords={filteredList.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationTable;

