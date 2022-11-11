import type { QuickPickItem } from 'vscode';
import { ByteOrder, DataType, Encoding } from '@nishin/reader';

import type { PotentialDecoder } from '@hex/types';

import { unicode } from './unicode';

export interface DecoderItem extends QuickPickItem {
	readonly decoder: PotentialDecoder;
}

export const defaultDecoder: DecoderItem = {
	label: 'ASCII',
	decoder: unicode(DataType.char(Encoding.ASCII)),
};

export const builtinDecoders: DecoderItem[] = [
	defaultDecoder,
	{
		label: 'ISO 8859-1',
		decoder: unicode(DataType.char(Encoding.ISO88591)),
	},
	{
		label: 'UTF-8',
		decoder: unicode(DataType.char(Encoding.UTF8)),
	},
	{
		label: 'UTF-16 BE',
		decoder: unicode(DataType.char(Encoding.UTF16, ByteOrder.BigEndian)),
	},
	{
		label: 'UTF-16 LE',
		decoder: unicode(DataType.char(Encoding.UTF16, ByteOrder.LittleEndian)),
	},
	{
		label: 'UTF-32 BE',
		decoder: unicode(DataType.char(Encoding.UTF32, ByteOrder.BigEndian)),
	},
	{
		label: 'UTF-32 LE',
		decoder: unicode(DataType.char(Encoding.UTF32, ByteOrder.LittleEndian)),
	},
];
