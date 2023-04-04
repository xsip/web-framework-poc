import {Component} from './component.decorator';

@Component({
	selector: () => 'main',
	template: () => require('./index.html'),
	style: () => require('./index.scss')
})
export class ExampleComponent {
	constructor() {
		setTimeout(() => {
				this.prop1 = '2'
			},
			2000);
	}

	prop1 = '1';

	prop2 = {
		prop3: '2'
	}
	bool1 = true;
	bool2 = false;
	fn1() {
		return this.prop2.prop3;
	}
}
