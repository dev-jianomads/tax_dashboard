import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatProcessTime(time: number) {
  if (time < 1) {
    return `${Math.round(time * 1000)}ms`;
  }
  return `${time.toFixed(2)}s`;
}

export function getDefaultDateRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    from: startOfMonth.toISOString().split('T')[0],
    to: endOfMonth.toISOString().split('T')[0],
  };
}
