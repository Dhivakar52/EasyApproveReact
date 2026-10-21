import { useState } from "react";
import type { ReactNode } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Menu, Eye, Pencil, Trash2, Check, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionMenuItem<T> {
  label: string;
  icon?: ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "danger" | "success";
  disabled?: boolean;
}

export interface ActionMenuProps<T> {
  item: T;
  actions?: ActionMenuItem<T>[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onApprove?: (item: T) => void;
  onReject?: (item: T) => void;
  triggerIcon?: ReactNode;
  align?: "center" | "end" | "start";
  side?: "bottom" | "top" | "left" | "right";
  className?: string;
}

export function ActionMenu<T>({
  item,
  actions,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  triggerIcon,
  align = "end",
  side = "bottom",
  className,
}: ActionMenuProps<T>) {
  const [open, setOpen] = useState(false);

  // Combine standard convenience props with custom actions
  const allActions: ActionMenuItem<T>[] = [
    ...(actions || []),
    ...(onView
      ? [
        {
          label: "View",
          icon: <Eye className="w-4 h-4 text-blue-600" />,
          onClick: onView,
        },
      ]
      : []),
    ...(onEdit
      ? [
        {
          label: "Edit",
          icon: <Pencil className="w-4 h-4 text-gray-600" />,
          onClick: onEdit,
        },
      ]
      : []),
    ...(onApprove
      ? [
        {
          label: "Approve",
          icon: <Check className="w-4 h-4 text-green-600" />,
          onClick: onApprove,
        },
      ]
      : []),
    ...(onReject
      ? [
        {
          label: "Reject",
          icon: <XCircle className="w-4 h-4 text-red-600" />,
          onClick: onReject,
          variant: "danger" as const,
        },
      ]
      : []),
    ...(onDelete
      ? [
        {
          label: "Delete",
          icon: <Trash2 className="w-4 h-4 text-red-600" />,
          onClick: onDelete,
          variant: "danger" as const,
        },
      ]
      : []),
  ];

  if (allActions.length === 0) return null;

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger
        className={cn(
          "w-8 h-8 rounded-lg hover:bg-slate-100 active:bg-slate-200 text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer inline-flex items-center justify-center mx-auto border border-transparent hover:border-slate-200/80",
          className
        )}
        title="Actions"
        aria-label="Actions"
      >
        {triggerIcon || <Menu className="w-4 h-4 text-slate-700 shrink-0" strokeWidth={2} />}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={12}
          avoidCollisions={true}
          className="bg-white shadow-xl rounded-xl p-1.5 min-w-[150px] border border-slate-200/90 z-[60] text-xs font-medium text-slate-700 animate-in fade-in-80 zoom-in-95 focus:outline-none"
        >
          {allActions.map((action, idx) => (
            <DropdownMenu.Item
              key={idx}
              disabled={action.disabled}
              onSelect={() => {
                action.onClick(item);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer outline-none transition-colors text-xs font-medium select-none",
                action.variant === "danger"
                  ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 active:bg-rose-100"
                  : action.variant === "success"
                    ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/80 active:bg-emerald-100"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/90 active:bg-slate-200/70",
                action.disabled && "opacity-50 pointer-events-none"
              )}
            >
              {action.icon && (
                <span className="shrink-0 flex items-center justify-center w-4 h-4 [&>*]:w-4 [&>*]:h-4 [&>*]:!mr-0">
                  {action.icon}
                </span>
              )}
              <span className="whitespace-nowrap font-medium">{action.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default ActionMenu;