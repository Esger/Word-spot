import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import $ from 'jquery';

@inject(Element, EventAggregator)
export class App {
	title = 'Woord Spot';
	count = 0;
	total = 0;
	constructor(element, eventAggregator) {
		this._element = element;
		this._eventAggregator = eventAggregator;
	}
	attached() {
		this._wordSubscription = this._eventAggregator.subscribe('current-word', word => {
			this.word = word;
			console.log('word', this.word);
			this.score = Math.pow(2, word.length) - 1;
		});
		this._wordSubmittedSubscription = this._eventAggregator.subscribe('word-submitted', success => {
			this.count += success;
			this._scoreTransferTimer = setInterval(_ => {
				if (this.score > 0) {
					this.total++;
					this.score--;
				} else {
					clearInterval(this._scoreTransferTimer);
					this.word = '';
				}
			}, 25)
		})
	}

	detached() {
		this._wordSubscription.dispose();
	}
}
