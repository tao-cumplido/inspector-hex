const decodedValue = {
	oneOf: [
		{
			type: ['string', 'null'],
		},
		{
			type: 'object',
			properties: {
				text: {
					type: 'string',
				},
				length: {
					type: 'integer',
					minimum: 1,
				},
				style: {
					type: 'object',
					properties: {
						color: {
							type: 'string',
						},
					},
					additionalProperties: false,
				},
			},
			additionalProperties: false,
		},
	],
} as const;

const decoderResult = {
	type: 'object',
	properties: {
		offset: {
			type: 'integer',
			minimum: 0,
		},
		values: {
			type: 'array',
			items: decodedValue,
		},
	},
	required: ['offset', 'values'],
	additionalProperties: false,
} as const;

export const schemas = {
	decodedValue,
	decoderResult,
} as const;
