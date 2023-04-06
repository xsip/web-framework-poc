import {ComponentOptions} from './component.decorator';
import {guidGenerator} from './utils';
import {metaDataStore} from './metadata-store';

export async function render<T extends ComponentOptions>(instance: T) {
	// @ts-ignore
	let template: string = await instance.template().default;
	// @ts-ignore
	let style: string = await instance.style().default;



	template.match(/\{\{(.*?)\}\}/g).forEach(templateVar => {
		const fixedVar = templateVar.replace(/\{\{(.*?)\}\}/g, '$1');
		let varInstance = instance[fixedVar as keyof typeof instance];
		if(fixedVar.includes('.')) {
			varInstance = instance as any;
			fixedVar.split('.').forEach(path => {
				const match = path.match(/\[(.*?)\]/g)
				varInstance = varInstance[path.replace(/\[(.*?)\]/g,'') as keyof  typeof varInstance] as any;
				if(match) {
					const index = parseInt(match[0].replace(/\[(.*?)\]/g,'$1'));
					console.log(index, varInstance);
					// @ts-ignore
					varInstance = varInstance[index] as any

				}

				if(typeof varInstance === 'function') {
					varInstance = varInstance();
				}
			})
		}

		const bindingId= guidGenerator();
		metaDataStore.addVarBinding(instance,{
			instance,
			lastValue: varInstance,
			path: fixedVar,
			id: bindingId,
			element: () => document.querySelector(`[binding-id="${bindingId}"]`)
		});

		if(typeof varInstance === 'function') {
			varInstance = varInstance();
		}
		template = template.replace(templateVar, `<ctx component-id="${instance.selector()}" binding-id="${bindingId}">${varInstance}</ctx>`);
	});

	template.match(/\\*if="(.*?)"/g)?.forEach(templateVar => {
		const fixedVar = templateVar.replace(/\\*if="(.*?)"/g, '$1');
		let varInstance = instance[fixedVar as keyof typeof instance];
		if(fixedVar.includes('.')) {
			varInstance = instance as any;
			fixedVar.split('.').forEach(path => {
				varInstance = varInstance[path as keyof  typeof varInstance] as any;
			})
		}
		const bindingId= guidGenerator();
		template = template.replace(templateVar, `component-id="${instance.selector()}" binding-id="${bindingId}"`);
		const innerHtml = template.match(new RegExp(`<(.*?) binding-id="${bindingId}">(.*?)</(.*?)>`))[2];
		metaDataStore.addIfBinding(instance,{
			instance,
			innerHtml,
			lastValue: varInstance,
			path: fixedVar,
			id: bindingId,
			element: () => document.querySelector(`[binding-id="${bindingId}"]`)
		});
		if(!varInstance) {
			template = template.replace(innerHtml,'');
		}
		console.log(fixedVar, varInstance);
	});


	template.match(/\\*for="(.*?)"/g)?.forEach(templateVar => {
		const fixedVar = templateVar.replace(/\\*for="(.*?)"/g, '$1');
		const [item, of] = fixedVar.split('=>');
		const items: any[] = instance[of as keyof typeof instance] as any[];
		console.log(fixedVar, item, of, items);
		const bindingId= guidGenerator();
		template = template.replace(templateVar, `component-id="${instance.selector()}" binding-id="${bindingId}"`);
		const innerHtml = template.match(new RegExp(`<(.*?) binding-id="${bindingId}">(.*?)</(.*?)>`))[0];
		console.log(innerHtml);
		let index = template.indexOf(innerHtml) + innerHtml.length;

		for(const _item in items) {
			let varInstance = items[_item];
			template = [template.slice(0, index), innerHtml, template.slice(index)].join('');
			index+= innerHtml.length;
		}
		/*if(fixedVar.includes('.')) {
			varInstance = instance as any;
			fixedVar.split('.').forEach(path => {
				varInstance = varInstance[path as keyof  typeof varInstance] as any;
			})
		}
		const bindingId= guidGenerator();
		template = template.replace(templateVar, `component-id="${instance.selector()}" binding-id="${bindingId}"`);
		const innerHtml = template.match(new RegExp(`<(.*?) binding-id="${bindingId}">(.*?)</(.*?)>`))[2];
		metaDataStore.addIfBinding(instance,{
			instance,
			innerHtml,
			lastValue: varInstance,
			path: fixedVar,
			id: bindingId,
			element: () => document.querySelector(`[binding-id="${bindingId}"]`)
		});
		if(!varInstance) {
			template = template.replace(innerHtml,'');
		}
		console.log(fixedVar, varInstance);*/
	});

	console.log(metaDataStore.data);
	document.querySelector(instance.selector()).outerHTML = template;
}
