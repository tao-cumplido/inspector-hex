export function assert(value: unknown, message = `Value '${JSON.stringify(value)}' is not defined`): asserts value {
	if (value === null || typeof value === "undefined") {
		throw new Error(message);
	}
}

assert.return = <T>(value: T | null | undefined): T => {
	assert(value);
	return value;
};
