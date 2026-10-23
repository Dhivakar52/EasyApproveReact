import React from "react";
import type { Nomination } from "@/dataTypes/nomination";
import {
  getStatusConfig,
  getStatusDisplayLabel,
  getStandardStatusKey,
} from "@/config/status.config";

export interface StatusBadgeProps {
  status?: string | null;
  nomination?: Nomination | null;
  displayLabel?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  nomination,
  displayLabel,
  className = "",
  size = "sm",
  showIcon = true,
}) => {
  const input = nomination || status;
  const config = getStatusConfig(input);
  const text = displayLabel || getStatusDisplayLabel(input);

  const sizeClasses = {
    xs: "px-2 py-0.5 text-[10px] gap-1",
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-sm gap-2",
  }[size];

  const iconSizes = {
    xs: "text-[9px]",
    sm: "text-[10px]",
    md: "text-[11px]",
    lg: "text-xs",
  }[size];

  return (
    <span
      data-status={config.key}
      data-color={config.colorName}
      className={`inline-flex items-center rounded-full font-semibold border whitespace-nowrap transition-colors ${config.badgeClass} ${sizeClasses} ${className}`}
    >
      {showIcon && <i className={`${config.iconClass} ${iconSizes} shrink-0`} />}
      <span>{text}</span>
    </span>
  );
};

/**
 * Standard renderStatusBadge helper for React Tables, Dashboards, and Lists.
 * Compatible with existing renderStatusBadge(row.original) usages.
 */
export const renderStatusBadge = (
  statusOrNomination: string | Nomination | null | undefined
): React.ReactElement => {
  if (typeof statusOrNomination === "string") {
    return <StatusBadge status={statusOrNomination} />;
  }
  return <StatusBadge nomination={statusOrNomination} />;
};

export default StatusBadge;
