import 'reflect-metadata';
import {metaDataStore} from './metadata-store';
import {guidGenerator} from './utils';
import {render} from './renderer';
import {ExampleComponent} from './example.component';


const example = new ExampleComponent();



// @ts-ignore
window.gci = metaDataStore.getComponentInstance.bind(metaDataStore);

window.onload = () => {

	// @ts-ignore
	render(example).then().catch();
}
setInterval(() => {

	example.prop1 = guidGenerator();
	example.prop2.prop3 = guidGenerator();
	example.fn1();
},1000)
