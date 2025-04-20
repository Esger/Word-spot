import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Letter {
	@bindable model;
	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this.backgroundPosition = this._getRandomPercentage() + ' ' + this._getRandomPercentage();
	}

	_getRandomPercentage() {
		return Math.floor(Math.random() * 100) + '%';
	}

	showSurroundingLetters() {
		this._eventAggregator.publish('letter-hovered', this.model);
	}

	toggleSelected() {
		this._eventAggregator.publish('letter-clicked', this.model);
	}
}
