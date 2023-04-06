import {ComponentOptions} from './component.decorator';
import {metaDataStore, MetadataStore} from './metadata-store';

type ChangeDetectionChangesFn = <T>(instance: T, changes: keyof T[]) => void;
export const toObject = <T = any>(variable: T) => variable as any as object;

class ChangeDetectionHandler<T extends Record<string, unknown>> {
	constructor(private onChanges: ChangeDetectionChangesFn,
				private onRead: ChangeDetectionChangesFn,
				private isChildProxy?: boolean,
				private prependPath?: string,
				private instanceName?: string,
				private rootInstance?: any) {
	}

	buildPropertyChangePath(property: any) {
		return this.prependPath ? this.prependPath + '.' + property : property;
	}

	get(instance: T, instanceProperty: keyof T): any {
		this.onChanges(this.rootInstance, [this.buildPropertyChangePath(instanceProperty)] as any as keyof T[]);
		const propValue: ChangeDetectionHandler<any> = instance[instanceProperty] as any as ChangeDetectionHandler<any>;
		if (typeof propValue === 'object'  && !propValue.isChildProxy) {
			return addDetector(
				instance[instanceProperty] as any,
				true,
				// @ts-ignore
				`${this.prependPath ? this.prependPath + '[' : ''}${typeof parseInt(instanceProperty as any) === 'number' ? instanceProperty : `'${instanceProperty}'`}${this.prependPath ? ']' : ''}`,
				this.instanceName,
				this.rootInstance
			);
		}
		if (typeof instance[instanceProperty] === 'function') {
			(instance[instanceProperty] as typeof Function) = (instance[instanceProperty] as typeof Function).bind(instance);
		}
		return instance[instanceProperty];
	}

	set(instance: T, instanceProperty: keyof T, value: any): any {
		instance[instanceProperty] = value;
		console.log(this.prependPath, instanceProperty);
		if (typeof value === 'object' && !(value as ChangeDetectionHandler<any>).isChildProxy) {
			instance[instanceProperty] = addDetector(
				value,
				true,
				// @ts-ignore

				`${this.prependPath ? this.prependPath + '[' : ''}${typeof parseInt(instanceProperty as any) === 'number' ? instanceProperty : `'${instanceProperty}'`}${this.prependPath ? ']' : ''}`,
				// `${this.prependPath ? this.prependPath + '.' : ''}${instanceProperty as any}`,
				this.instanceName,
				this.rootInstance
			) as any;
		}
		this.onChanges(this.rootInstance, [this.buildPropertyChangePath(instanceProperty)] as any as keyof T[]);
		return true;
	}
}

function globalOnChanges<T extends ComponentOptions>(instance: T, changedVars: string[]) {
	const varBindingsPerInstance = metaDataStore.data[instance.selector.bind(instance)()]?.varBindings;
	const ifBindingsPerInstance = metaDataStore.data[instance.selector.bind(instance)()]?.ifBindings;
	Object.keys(ifBindingsPerInstance ?? {})?.forEach(binding => {
		const prop = ifBindingsPerInstance[binding];
		const varInstance = instance[prop.path as keyof  T];
		const el = prop.element();
		if(varInstance === prop.lastValue)
			return;


		prop.lastValue = varInstance;

		if(!prop || !el)
			return;
		if(varInstance) {
			el.innerHTML = prop.innerHtml;
		} else {
			prop.innerHtml = el.innerHTML;
			el.innerHTML = '';
		}
	});

	Object.keys(varBindingsPerInstance ?? {})?.forEach(binding => {
		const prop = varBindingsPerInstance[binding];
		if(changedVars.includes(prop.path)) {
			let varInstance = instance[prop.path as keyof  T];
			if(prop.path.includes('.')) {
				varInstance = instance as any;
				prop.path.split('.').forEach((path: string) => {
					const match = path.match(/\[(.*?)\]/g)
					varInstance = varInstance[path.replace(/\[(.*?)\]/g,'') as keyof  typeof varInstance] as any;
					if(match) {
						console.log(varInstance,path,path.replace(/\[(.*?)\]/g,''));
						const index = parseInt(match[0].replace(/\[(.*?)\]/g,'$1'));
						// @ts-ignore

						// @ts-ignore
						varInstance = varInstance[index] as any
						// @ts-ignore
						console.log(index, varInstance['prop']);
					}

					/*varInstance = varInstance[path as keyof  typeof varInstance] as any;
					if(typeof varInstance === 'function') {
						varInstance = varInstance();
					}*/
				})
			}
			if(typeof varInstance === 'function') {
				varInstance = varInstance();
			}
			const el = prop.element();
			if(!el)
				return;
			el.innerHTML = varInstance as string;
		}
	})
}
export const addDetector = <T>(instance: T,isChildProxy = false, prependPath?: string, instanceName?: string, rootInstance?: any) => {

	return new Proxy(
		toObject(instance),
		// @ts-ignore
		new ChangeDetectionHandler((i,changes) => {
			globalOnChanges(rootInstance as any,changes as any);
			// eslint-disable-next-line @typescript-eslint/no-empty-function
		}, () => {}, isChildProxy, prependPath,instanceName, rootInstance)
	) as any as T;
}
export function addRootDetector<T extends ComponentOptions>(instance: any, instanceName: string) {
	return new Proxy(
		toObject(instance),
		// @ts-ignore
		new ChangeDetectionHandler((i,changes) => {
			globalOnChanges(instance as any,changes as any);
			// eslint-disable-next-line @typescript-eslint/no-empty-function
		}, () => {}, false, undefined,instanceName)
	) as any as T;
}
