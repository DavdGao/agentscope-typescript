import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge.
 *
 * @param {...any} inputs - Class values to merge.
 * @returns A merged class name string.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
