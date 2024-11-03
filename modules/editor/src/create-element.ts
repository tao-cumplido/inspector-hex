export interface CreateElementData {
	classList?: string[];
	style?: Record<string, string | undefined>;
	content?: string | Node | Node[];
}

export function createElement<T extends keyof HTMLElementTagNameMap>(
	name: T,
	data?: CreateElementData,
): HTMLElementTagNameMap[T] {
	const element = document.createElement(name);

	if (data?.classList) {
		for (const className of data.classList) {
			if (className) {
				element.classList.add(className);
			}
		}
	}

	if (data?.style) {
		for (const property in data.style) {
			element.style.setProperty(property, data.style[property]!);
		}
	}

	if (typeof data?.content === "string") {
		element.textContent = data.content;
	} else if (data?.content instanceof Array) {
		const fragment = document.createDocumentFragment();
		for (const child of data.content) {
			fragment.appendChild(child);
		}
		element.appendChild(fragment);
	} else if (data?.content) {
		element.appendChild(data.content);
	}

	return element;
}
