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
				this._updateBeams()
			else this._resetBeams();
		});
		this._multiplierSubscription = this._eventAggregator.subscribe('multiplier', multiplier => this.highlight = multiplier > 0);
		this._winSubscription = this._eventAggregator.subscribe('word-submitted', confetti => this._resetBeams(confetti));
	}

	detached() {
		this._wordChangedSubscription.dispose();
		this._multiplierSubscription.dispose();
		this._winSubscription.dispose();
	}

	_resetBeams(confetti = true) {
		this.confetti = confetti;
		this.highlight = false;
		this.beams = [];
		this.previousLength = 0;
		setTimeout(_ => {
		});
	}

	_updateBeams() {
		if (this.word.length > this.previousLength && this.word.length > 1) {
			const lastLetter = this.word[this.word.length - 1];
			const preLastLetter = this.word[this.word.length - 2];
			const angle = Math.atan2(lastLetter.y - preLastLetter.y, lastLetter.x - preLastLetter.x) * 180 / Math.PI;
			const beam = {
				left: `calc(var(--distance) * ${preLastLetter.x})`,
				top: `calc(var(--distance) * ${preLastLetter.y})`,
				rotate: `${angle}deg`
			}
			this.beams.push(beam);
		} else {
			this.beams.splice(this.word.length - 1);
		}

		this.previousLength = this.word.length;
	}

}
