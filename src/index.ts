import 'reflect-metadata';
import {metaDataStore} from './metadata-store';
import {guidGenerator} from './utils';
import {render} from './renderer';
import {ExampleComponent} from './example.component';
import {ExampleTwoComponent} from './example-two.component';


const example = new ExampleComponent();
const example2 = new ExampleTwoComponent();



// @ts-ignore
window.gci = metaDataStore.getComponentInstance.bind(metaDataStore);

window.onload = async () => {

	// @ts-ignore
	await render(example)
	// @ts-ignore
	await render(example2);
}
setInterval(() => {

	example.prop1 = 'Component1 ' +guidGenerator();
	// example2.prop1 = 'Component2 ' +guidGenerator();
	example.prop2.prop3 = 'Component1 prop3 ' + guidGenerator();
	// @ts-ignore
	example.items[0].prop = guidGenerator();
	// example.fn1();
},1000)
