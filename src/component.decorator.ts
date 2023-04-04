import {guidGenerator} from './utils';
import {addDetector} from './change-detection.handler';

export interface ComponentOptions {
	id?: string;
	style: () => Promise<string>;
	template: () => Promise<string>;
	selector: () => string;
}

export function Component(options: ComponentOptions): any {
	return function _logic<T extends { new(...args: any[]): {} }>(constructor: T) {
		return class extends constructor {
			style: () => Promise<string>;
			template: () => Promise<string>;
			selector: () => string;
			id: string;
			constructor(...args: any[]) {
				super(...args);

				this.style = options.style;
				this.id = guidGenerator();
				this.template = options.template;
				this.selector = options.selector;

				return addDetector(this, false,undefined, this.selector(), this)
			}
		}
	};
}
