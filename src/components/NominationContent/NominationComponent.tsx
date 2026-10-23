import { useState, useEffect, useMemo } from "react";
import NominationTable from "./NominationTable";
import { nominationService } from "@/services/nominationService";
import type Nomination from "@/dataTypes/nomination";

export type TabKey =
  | "all"
  | "pending"
  | "clarification"
  | "modify"
  | "approved"
  | "rejected"
  | "reassigned";

interface TabDef {
  key: TabKey;
  label: string;
  test: (r: Nomination) => boolean;
}

export const TABS: TabDef[] = [
  { key: "all", label: "All Requests", test: () => true },
  {
    key: "pending",
    label: "Pending Approvals",
    test: (r) =>
      r.status === "Pending" ||
      r.status === "In Review" ||
      r.status === "Under Review",
  },
  {
    key: "clarification",
    label: "Clarifications",
    test: (r) =>
      r.status === ("Clarification Required" as any) ||
      r.status === ("CLARIFICATION REQUIRED" as any),
  },
  {
    key: "modify",
    label: "Under Modification",
    test: (r) =>
      r.status === ("Under Modification" as any) ||
      r.status === ("MODIFICATION REQUIRED" as any),
  },
  {
    key: "approved",
    label: "Approved",
    test: (r) => r.status === "Approved",
  },
  {
    key: "rejected",
    label: "Rejected",
    test: (r) => r.status === "Rejected" || (r.status as string) === "REJECTED",
  },
  {
    key: "withdrawn",
    label: "Withdrawn",
    test: (r) => (r.status as string)?.toLowerCase().includes("withdraw"),
  },
  {
    key: "reassigned",
    label: "Delegated",
    test: (r) =>
      (r.status as string) === "Re-assigned" ||
      Boolean(r.reassignmentHistory && r.reassignmentHistory.length > 0) ||
      Boolean(r.reassignCount && r.reassignCount > 0),
  },
];

const NominationComponent = () => {
  const [nominations, setNominations] = useState<Nomination[]>(() =>
    nominationService.getNominations()
  );

  const currentUserEmail = (
    localStorage.getItem("userEmail") || "user@srmtech.com"
  )
    .toLowerCase()
    .trim();

  useEffect(() => {
    // Immediately synchronize with latest stored nominations on mount
    setNominations(nominationService.getNominations());

    const handleUpdate = () => {
      setNominations(nominationService.getNominations());
    };

    window.addEventListener("easyapprove_nominations_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("easyapprove_nominations_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const userRole = (localStorage.getItem("userRole") || "user").toLowerCase();

  // Filter requests authored by the currently logged-in user (Admin views all organization requests)
  const myRequests = useMemo(() => {
    if (userRole === "admin") {
      return nominations;
    }

    return nominations.filter((r) => {
      const email = (r.requesterEmail || r.nomineeEmail || "").toLowerCase().trim();
      const origSubmitter = (r.originalSubmitter || "").toLowerCase().trim();
      const reqName = (r.requesterName || r.nominee || "").toLowerCase().trim();

      // Direct email match
      if (email === currentUserEmail || origSubmitter === currentUserEmail) return true;

      // Demo User identity alias matching (user@srmtech.com, user@gmail.com, "Demo User")
      if (
        currentUserEmail === "user@srmtech.com" ||
        currentUserEmail === "user@gmail.com" ||
        currentUserEmail.startsWith("user@")
      ) {
        return (
          email === "user@srmtech.com" ||
          email === "user@gmail.com" ||
          origSubmitter === "user@srmtech.com" ||
          origSubmitter === "user@gmail.com" ||
          reqName === "demo user" ||
          reqName === "user"
        );
      }

      // Approver identity alias matching (approver@srmtech.com, approver@gmail.com)
      if (
        currentUserEmail === "approver@srmtech.com" ||
        currentUserEmail === "approver@gmail.com" ||
        currentUserEmail.startsWith("approver@")
      ) {
        return (
          email === "approver@srmtech.com" ||
          email === "approver@gmail.com" ||
          origSubmitter === "approver@srmtech.com" ||
          origSubmitter === "approver@gmail.com" ||
          reqName.includes("approver")
        );
      }

      return false;
    });
  }, [nominations, currentUserEmail, userRole]);

  return (
    <div className="space-y-5">
      {/* Table Card with Filter Controls matching Reference Screenshot */}
      <NominationTable nominations={myRequests} />
    </div>
  );
};

export default NominationComponent;
