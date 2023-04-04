import {ComponentOptions} from './component.decorator';

type ComponentName = string;
type BindingId = string;

export interface MetaDataInformation<T> {
	instance: T;
	id: string;
	lastValue: unknown;
	path: string;
	innerHtml?: string;
	element: () => HTMLElement
}

export interface MetaDataCollection {
	[index: ComponentName]: {
		instance?: any;
		varBindings?: { [index: BindingId]: MetaDataInformation<any> }
		ifBindings?: { [index: BindingId]: MetaDataInformation<any> }
	}
}

export class MetadataStore {
	data: MetaDataCollection = {};
	constructor() {
	}
	addVarBinding<T extends ComponentOptions>(instance: T, bindingInfo: MetaDataInformation<T>) {
		const componentName = instance.selector();
		if (!this.data[componentName]) {
			this.data[componentName] = {instance: instance};
		}
		if (!this.data[componentName].varBindings) {
			this.data[componentName]['varBindings'] = {} ;
		}

		this.data[componentName].varBindings[bindingInfo.id] = bindingInfo;
	}
	addIfBinding<T extends ComponentOptions>(instance: T, bindingInfo: MetaDataInformation<T>) {
		const componentName = instance.selector();
		if (!this.data[componentName]) {
			this.data[componentName] = {instance: instance};
		}
		if (!this.data[componentName].ifBindings) {
			this.data[componentName]['ifBindings'] = {} ;
		}

		this.data[componentName].ifBindings[bindingInfo.id] = bindingInfo;
	}
	getComponentInstance(selector: string) {
		return this.data[selector];
	}
}
let metaDataStore: MetadataStore;
if(!metaDataStore) {
	metaDataStore =   new MetadataStore();
}
export {metaDataStore};

