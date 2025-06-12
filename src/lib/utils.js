import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export function formatDate(dateString){
    return format(new Date(dateString), "MMM d, yyyy");
  };