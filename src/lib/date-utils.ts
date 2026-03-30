import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Safely converts a value (Firestore Timestamp, Date, or ISO string) to a Date object.
 * Returns null if the value is invalid or null.
 */
export const toDate = (val: any): Date | null => {
  if (!val) return null;
  
  let date: Date;
  if (val.toDate && typeof val.toDate === 'function') {
    date = val.toDate();
  } else {
    date = new Date(val);
  }

  if (isNaN(date.getTime())) return null;
  return date;
};

/**
 * Safely formats a date value using date-fns format.
 * Returns fallback if the date is invalid.
 */
export const formatDate = (val: any, formatStr: string, fallback: string = '-'): string => {
  const date = toDate(val);
  if (!date) return fallback;
  return format(date, formatStr, { locale: fr });
};

/**
 * Safely formats a date value using date-fns formatDistanceToNow.
 * Returns fallback if the date is invalid.
 */
export const formatDistance = (val: any, fallback: string = "à l'instant"): string => {
  const date = toDate(val);
  if (!date) return fallback;
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
};
