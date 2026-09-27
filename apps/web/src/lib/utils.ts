import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date) {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return format(date, "MMM dd, yyyy");
}

export function formatDateTime(dateString: string | Date) {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
  return format(date, "MMM dd, yyyy HH:mm");
}

export function getInitials(name: string) {
  if (!name) return "";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function getStatusColor(status: string) {
  const s = status.toUpperCase();
  switch (s) {
    case 'ACTIVE':
    case 'COMPLETED':
    case 'PRESENT':
    case 'APPROVED':
    case 'VERIFIED':
      return 'green';
    case 'INACTIVE':
    case 'DROPPED':
    case 'ABSENT':
    case 'REJECTED':
      return 'red';
    case 'PENDING':
    case 'LATE':
    case 'IN_PROGRESS':
      return 'yellow';
    default:
      return 'gray';
  }
}
