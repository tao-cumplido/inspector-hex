import type { HostMessageMap } from '@hex/types';

export type Stat = HostMessageMap['stat'] & {
	fileRows: number;
	offsetHexDigitCount: number;
};

export const stat: Stat = {
	fileSize: 0,
	fileRows: 0,
	offsetHexDigitCount: 0,
};
