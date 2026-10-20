import { useState, useEffect } from "react";
import NotificationTable from "../components/NotificationComponent/NotificationTable";
import { nominationService } from "@/services/nominationService";
import { toast } from "@/components/ui/sonner";

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
    <div className="space-y-5 p-5">
      {/* Page Header matching HTML prototype */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
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
          className="btn btn-outline !text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fa-solid fa-check-double mr-1"></i> Mark All as Read
        </button>
      </div>

      <NotificationTable />
    </div>
  );
};

export default NotificationPage;