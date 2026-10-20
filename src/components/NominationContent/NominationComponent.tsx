import { useState, useEffect } from "react";
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
    label: "Rejected / Withdrawn",
    test: (r) => r.status === "Rejected" || (r.status as string) === "Withdrawn",
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

  useEffect(() => {
    const handleUpdate = () => {
      setNominations(nominationService.getNominations());
    };

    window.addEventListener("easyapprove_nominations_updated", handleUpdate);
    return () => {
      window.removeEventListener("easyapprove_nominations_updated", handleUpdate);
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* Table Card with Filter Controls matching Reference Screenshot */}
      <NominationTable nominations={nominations} />
    </div>
  );
};

export default NominationComponent;
