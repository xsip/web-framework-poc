import {Component} from './component.decorator';

@Component({
	selector: () => 'main2',
	template: () => require('./component2.html'),
	style: () => require('./component.scss')
})
export class ExampleTwoComponent {
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
}
