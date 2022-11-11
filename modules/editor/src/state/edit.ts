class RangeSet extends Set<number> {
	hasRange(start: number, length: number) {
		for (let i = start; i < start + length; i++) {
			if (this.has(i)) {
				return true;
			}
		}

		return false;
	}
}

export const selectedOffsets = new RangeSet();
