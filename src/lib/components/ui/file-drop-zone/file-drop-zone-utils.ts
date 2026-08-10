export const BYTE = 1;
export const KILOBYTE = 1000;
export const MEGABYTE = 1000 * KILOBYTE;
export const GIGABYTE = 1000 * MEGABYTE;

export const ACCEPT_IMAGE = "image/*";
export const ACCEPT_VIDEO = "video/*";
export const ACCEPT_AUDIO = "audio/*";

/**
 * Formats a byte count using the largest supported decimal unit.
 *
 * @param bytes - File size in bytes.
 * @returns A rounded size labelled as B, KB, MB, or GB.
 */
export function displaySize(bytes: number): string {
	if (bytes < KILOBYTE) return `${bytes.toFixed(0)} B`;
	if (bytes < MEGABYTE) return `${(bytes / KILOBYTE).toFixed(0)} KB`;
	if (bytes < GIGABYTE) return `${(bytes / MEGABYTE).toFixed(0)} MB`;
	return `${(bytes / GIGABYTE).toFixed(0)} GB`;
}
