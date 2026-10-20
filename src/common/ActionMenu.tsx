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
            icon: <Eye className="w-4 h-4 text-blue-600 mr-2" />,
            onClick: onView,
          },
        ]
      : []),
    ...(onEdit
      ? [
          {
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-gray-600 mr-2" />,
            onClick: onEdit,
          },
        ]
      : []),
    ...(onApprove
      ? [
          {
            label: "Approve",
            icon: <Check className="w-4 h-4 text-green-600 mr-2" />,
            onClick: onApprove,
          },
        ]
      : []),
    ...(onReject
      ? [
          {
            label: "Reject",
            icon: <XCircle className="w-4 h-4 text-red-600 mr-2" />,
            onClick: onReject,
            variant: "danger" as const,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            label: "Delete",
            icon: <Trash2 className="w-4 h-4 text-red-600 mr-2" />,
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
          "p-1.5 rounded-md hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none cursor-pointer flex items-center justify-center",
          className
        )}
      >
        {triggerIcon || <Menu className="w-4 h-4 text-slate-700" strokeWidth={2} />}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={5}
          className="bg-white shadow-lg rounded-md p-1.5 min-w-[130px] border border-gray-100 z-50 text-sm animate-in fade-in-80"
        >
          {allActions.map((action, idx) => (
            <DropdownMenu.Item
              key={idx}
              disabled={action.disabled}
              onClick={() => {
                action.onClick(item);
                setOpen(false);
              }}
              className={cn(
                "flex items-center px-2.5 py-1.5 rounded-sm hover:bg-gray-100 cursor-pointer outline-none transition-colors",
                action.variant === "danger"
                  ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                  : action.variant === "success"
                  ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                  : "text-gray-700 hover:text-gray-900",
                action.disabled && "opacity-50 pointer-events-none"
              )}
            >
              {action.icon}
              <span>{action.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default ActionMenu;