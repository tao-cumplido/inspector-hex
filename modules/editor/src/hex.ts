export function hex(value: number, pad = 2): string {
	return value.toString(16).padStart(pad, '0');
}
