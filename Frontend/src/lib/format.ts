import { format, parseISO } from 'date-fns';

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, h:mm a');
  } catch {
    return '—';
  }
}

export function formatTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'h:mm a');
  } catch {
    return '—';
  }
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function formatRelative(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'MMM d, h:mm a');
  } catch {
    return '—';
  }
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
