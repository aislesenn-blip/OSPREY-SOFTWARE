import * as React from "react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  confirmed: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",

  pending: "bg-yellow-100 text-yellow-700",
  provisional: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-yellow-100 text-yellow-700",
  maintenance: "bg-yellow-100 text-yellow-700",

  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  terminated: "bg-red-100 text-red-700",
  retired: "bg-gray-100 text-gray-700",

  default: "bg-osprey-navy/10 text-osprey-navy",
};

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const colorClass = statusColors[status?.toLowerCase()] || statusColors.default;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        colorClass,
        className
      )}
      {...props}
    >
      {status ? (status.charAt(0).toUpperCase() + status.slice(1)) : 'Unknown'}
    </span>
  )
}
