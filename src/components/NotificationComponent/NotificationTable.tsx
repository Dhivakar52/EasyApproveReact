import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { nominationService } from "@/services/nominationService";
import type { SystemNotification } from "@/mocks/notifications.mock";
import { toast } from "@/components/ui/sonner";

export const NotificationTable: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<SystemNotification[]>(() =>
    nominationService.getNotifications()
  );
  const [filter, setFilter] = useState<"all" | "unread">("all");

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

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedList =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

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
    } catch {}

    if (isApprovalRelated) {
      navigate(`/approvals/${reqId}`);
    } else {
      navigate(`/my-nominations/${reqId}`);
    }
  };

  const getNotifIcon = (notif: SystemNotification) => {
    const text = (notif.type + " " + notif.title).toLowerCase();
    if (text.includes("reminder") || text.includes("deadline")) return "fa-clock";
    if (text.includes("reject")) return "fa-circle-xmark";
    if (text.includes("approved")) return "fa-circle-check";
    if (text.includes("clarif")) return "fa-circle-question";
    if (text.includes("reassign") || text.includes("delegat")) return "fa-user-gear";
    return "fa-bell";
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs matching HTML Prototype */}
      <div className="tabs mb-4" role="tablist" aria-label="Notification filters">
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          onClick={() => setFilter("all")}
          className="tab"
        >
          All Notifications
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "unread"}
          onClick={() => setFilter("unread")}
          className="tab"
        >
          Unread Alerts <span className="n">{unreadCount}</span>
        </button>
      </div>

      {/* Notifications List Card matching HTML Prototype */}
      <section className="card bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {displayedList.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {displayedList.map((n, idx) => {
              const iconClass = getNotifIcon(n);
              const isUnread = !n.read;
              return (
                <article
                  key={n.id || `notif_${idx}`}
                  className={`p-4 sm:p-5 flex gap-4 transition-colors ${
                    isUnread ? "bg-blue-50/40" : "bg-white hover:bg-slate-50/50"
                  }`}
                >
                  {/* Status / Category Icon Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                      isUnread
                        ? "bg-blue-100 text-blue-600 font-bold"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <i className={`fa-solid ${iconClass}`}></i>
                  </div>

                  {/* Notification Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">
                        {n.title || n.type || "Notification"}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {n.time || "Just now"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 break-words leading-relaxed">
                      {n.message}
                    </p>

                    {/* Action Buttons */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {n.requestId && (
                        <button
                          type="button"
                          onClick={() => handleViewDetails(n)}
                          className="btn btn-sm btn-outline !text-xs !py-1 px-3 inline-flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-eye text-blue-600"></i> View Details
                        </button>
                      )}
                      {isUnread && n.id && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(n.id)}
                          className="btn btn-sm btn-outline !text-xs !py-1 px-3 text-slate-600 hover:text-slate-900"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">
            <i className="fa-regular fa-bell-slash text-2xl text-slate-300 block mb-2"></i>
            No notifications found in this view.
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationTable;
