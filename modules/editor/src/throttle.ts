export function throttle(callback: () => void, time: number): () => void {
	let flag = false;

	return () => {
		if (flag) {
			return;
		}

		flag = true;

		setTimeout(() => {
			callback();
			flag = false;
		}, time);
	};
}
