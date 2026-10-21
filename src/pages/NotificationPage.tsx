import { useState, useEffect } from "react";
import NotificationTable from "../components/NotificationComponent/NotificationTable";
import { nominationService } from "@/services/nominationService";
import { toast } from "@/components/ui/sonner";
import { CheckCheck } from "lucide-react";

const NotificationPage = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = () => {
    const list = nominationService.getNotifications();
    setUnreadCount(list.filter((n) => !n.read).length);
  };

  useEffect(() => {
    refreshUnread();
    window.addEventListener("easyapprove_notifications_updated", refreshUnread);
    return () => {
      window.removeEventListener("easyapprove_notifications_updated", refreshUnread);
    };
  }, []);

  const handleMarkAllAsRead = () => {
    nominationService.markAllNotificationsRead();
    toast.success("All notifications marked as read.");
  };

  return (
    <div className="p-3.5 sm:p-5 md:p-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Notifications &amp; Audit Alerts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Chronological activity logs and workflow status updates.
          </p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCheck className="w-4 h-4 text-blue-600" />
          <span>Mark All as Read</span>
        </button>
      </div>

      <NotificationTable />
    </div>
  );
};

export default NotificationPage;