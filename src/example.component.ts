import {Component} from './component.decorator';

@Component({
	selector: () => 'main',
	template: () => require('./component.html'),
	style: () => require('./component.scss')
})
export class ExampleComponent {
	constructor() {
		setTimeout(() => {
				this.prop1 = 'Component1'
			},
			2000);
	}

	prop1 = '1';

	prop2 = {
		prop3: 'Component1'
	}
	bool1 = true;
	bool2 = false;
	fn1() {
		return this.prop2.prop3;
	}
	items = [{prop: 1}, {prop:2}];
}
