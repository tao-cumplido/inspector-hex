import { Disposable } from 'vscode';

export class SingletonDisposable extends Disposable {
	protected static get<C extends { prototype: SingletonDisposable }>(this: C): C['prototype'] {
		// @ts-expect-error;
		if (!this.instance) {
			throw new Error('instance not yet created');
		}

		// @ts-expect-error;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return this.instance;
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	constructor(onDipose = () => {}) {
		super(onDipose);

		// @ts-expect-error
		if (this.constructor.instance) {
			throw new Error('instance already created');
		}

		// @ts-expect-error;
		this.constructor.instance = this;
	}
}
