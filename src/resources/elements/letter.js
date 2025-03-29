import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Letter {
	@bindable model;
	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
	}

	toggleSelected() {
		this.model.selected = !this.model.selected;
		this._eventAggregator.publish('letter-selected', this.model);
	}
}
