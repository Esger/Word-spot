import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Letter {
	@bindable model;
	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
	}

	showSurroundingLetters() {
		this._eventAggregator.publish('letter-hovered', this.model);
	}

	toggleSelected() {
		this._eventAggregator.publish('letter-clicked', this.model);
	}
}
