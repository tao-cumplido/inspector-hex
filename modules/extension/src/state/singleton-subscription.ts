import { Disposable } from "vscode";

export class SingletonSubscription extends Disposable {
	protected static get<C extends { prototype: SingletonSubscription; }>(this: C): C["prototype"] {
		// @ts-expect-error
		if (!this.instance) {
			throw new Error("instance not yet created");
		}

		// @ts-expect-error
		return this.instance;
	}

	protected subscriptions: Disposable[] = [];

	constructor() {
		super(() => {});

		// @ts-expect-error
		if (this.constructor.instance) {
			throw new Error("instance already created");
		}

		// @ts-expect-error
		this.constructor.instance = this;
	}

	override dispose() {
		super.dispose();
		for (const subscription of this.subscriptions) {
			subscription.dispose();
		}
	}
}
