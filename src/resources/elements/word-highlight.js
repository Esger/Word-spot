import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class WordHighlight {
	@bindable word = [];
	beams = [];
	previousLength = 0;

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this._wordChangedSubscription = this._eventAggregator.subscribe('current-word', word => {
			if (word.length)
				this._updateHighlight()
			else this._resetBeams();
		});
		this._winSubscription = this._eventAggregator.subscribe('word-submitted', confetti => this._resetBeams(confetti));
	}

	_resetBeams(confetti = true) {
		this.confetti = confetti;
		setTimeout(() => {
			this.beams = [];
			this.previousLength = 0;
		});
	}

	_updateHighlight() {
		if (this.word.length > this.previousLength && this.word.length > 1) {
			for (let i = this.word.length - 2; i < this.word.length - 1; i++) {
				const angle = Math.atan2(this.word[i + 1].y - this.word[i].y, this.word[i + 1].x - this.word[i].x) * 180 / Math.PI;
				const beam = {
					left: `calc(var(--distance) * ${this.word[i].x})`,
					top: `calc(var(--distance) * ${this.word[i].y})`,
					rotate: `${angle}deg`,
				}
				this.beams.push(beam);
			}
		} else {
			this.beams.splice(this.word.length - 1);
		}

		this.previousLength = this.word.length;
	}
}
