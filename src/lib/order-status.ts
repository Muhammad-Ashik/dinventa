export const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING_CONFIRMATION: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  CONFIRMED: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  DECLINED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  SHIPPED: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  DELIVERED: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: "Pending",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
