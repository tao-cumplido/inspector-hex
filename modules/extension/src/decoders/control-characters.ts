import type { RenderControlCharacters } from "@inspector-hex/api";

export function resolveControlCharacter(
	codePoint: number,
	render: RenderControlCharacters | readonly RenderControlCharacters[],
): string | undefined {
	if (typeof render !== "string") {
		for (const priorityRender of render) {
			const resolved = resolveControlCharacter(codePoint, priorityRender);

			if (resolved) {
				return resolved;
			}
		}

		return undefined;
	}

	switch (render) {
		case "hex":
			return codePoint.toString(16).padStart(2, "0");
		case "abbreviation":
			return {
				0x00: "NUL",
				0x01: "SOH",
				0x02: "STX",
				0x03: "ETX",
				0x04: "EOT",
				0x05: "ENQ",
				0x06: "ACK",
				0x07: "BEL",
				0x08: "BS",
				0x09: "HT",
				0x0a: "LF",
				0x0b: "VT",
				0x0c: "FF",
				0x0d: "CR",
				0x0e: "SO",
				0x0f: "SI",
				0x10: "DLE",
				0x11: "DC1",
				0x12: "DC2",
				0x13: "DC3",
				0x14: "DC4",
				0x15: "NAK",
				0x16: "SYN",
				0x17: "ETB",
				0x18: "CAN",
				0x19: "EM",
				0x20: "SP",
				0x1a: "SUB",
				0x1b: "ESC",
				0x1c: "FS",
				0x1d: "GS",
				0x1e: "RS",
				0x1f: "US",
				0x7f: "DEL",
			}[codePoint];
		case "escape":
			return {
				0x00: "\\0",
				0x07: "\\a",
				0x08: "\\b",
				0x09: "\\t",
				0x0a: "\\n",
				0x0b: "\\v",
				0x0c: "\\f",
				0x0d: "\\r",
				0x27: "\\e",
			}[codePoint];
		case "caret":
			return {
				0x00: "^@",
				0x01: "^A",
				0x02: "^B",
				0x03: "^C",
				0x04: "^D",
				0x05: "^E",
				0x06: "^F",
				0x07: "^G",
				0x08: "^H",
				0x09: "^I",
				0x0a: "^J",
				0x0b: "^K",
				0x0c: "^L",
				0x0d: "^M",
				0x0e: "^N",
				0x0f: "^O",
				0x10: "^P",
				0x11: "^Q",
				0x12: "^R",
				0x13: "^S",
				0x14: "^T",
				0x15: "^U",
				0x16: "^V",
				0x17: "^W",
				0x18: "^X",
				0x19: "^Y",
				0x1a: "^Z",
				0x1b: "^[",
				0x1c: "^\\",
				0x1d: "^]",
				0x1e: "^^",
				0x1f: "^_",
				0x7f: "^?",
			}[codePoint];
		case "picture":
			return {
				0x00: "␀",
				0x01: "␁",
				0x02: "␂",
				0x03: "␃",
				0x04: "␄",
				0x05: "␅",
				0x06: "␆",
				0x07: "␇",
				0x08: "␈",
				0x09: "␉",
				0x0a: "␊",
				0x0b: "␋",
				0x0c: "␌",
				0x0d: "␍",
				0x0e: "␎",
				0x0f: "␏",
				0x10: "␐",
				0x11: "␑",
				0x12: "␒",
				0x13: "␓",
				0x14: "␔",
				0x15: "␕",
				0x16: "␖",
				0x17: "␗",
				0x18: "␘",
				0x19: "␙",
				0x20: "␠",
				0x1a: "␚",
				0x1b: "␛",
				0x1c: "␜",
				0x1d: "␝",
				0x1e: "␞",
				0x1f: "␟",
				0x7f: "␡",
			}[codePoint];
	}
}
