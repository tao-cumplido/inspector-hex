import type { PotentialDecoder } from "@hex/types";
import { ByteOrder, Encoding } from "@nishin/reader";
import type { QuickPickItem } from "vscode";

import { unicode } from "./unicode";

export interface DecoderItem extends QuickPickItem {
	readonly decoder: PotentialDecoder;
}

export const defaultDecoder: DecoderItem = {
	label: "ASCII",
	decoder: unicode(Encoding.ASCII),
};

export const builtinDecoders: DecoderItem[] = [
	defaultDecoder,
	{
		label: "ISO 8859-1",
		decoder: unicode(Encoding.ISO88591),
	},
	{
		label: "UTF-8",
		decoder: unicode(Encoding.UTF8),
	},
	{
		label: "UTF-16 BE",
		decoder: unicode(Encoding.UTF16, ByteOrder.BigEndian),
	},
	{
		label: "UTF-16 LE",
		decoder: unicode(Encoding.UTF16, ByteOrder.LittleEndian),
	},
	{
		label: "UTF-32 BE",
		decoder: unicode(Encoding.UTF32, ByteOrder.BigEndian),
	},
	{
		label: "UTF-32 LE",
		decoder: unicode(Encoding.UTF32, ByteOrder.LittleEndian),
	},
];
