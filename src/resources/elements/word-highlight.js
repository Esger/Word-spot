import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class WordHighlight {
	@bindable word;

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this._wordChangedSubscription = this._eventAggregator.subscribe('current-word', word => {
			if (word.length)
				this._updateBeams()
			else this._resetBeams();
		});
		this._multiplierSubscription = this._eventAggregator.subscribe('multiplier', multiplier => this.highlight = multiplier > 0);
		this._winSubscription = this._eventAggregator.subscribe('word-submitted', win => this._resetBeams(win));
	}

	detached() {
		this._wordChangedSubscription.dispose();
		this._multiplierSubscription.dispose();
		this._winSubscription.dispose();
	}

	_resetBeams(win = true) {
		this.confetti = win;
		this.highlight = false;
	}

	_updateBeams() {
		if (this.word.length > 1) {
			for (let i = 0; i < this.word.length - 1; i++) {
				const thisLetter = this.word[i];
				const nextLetter = this.word[i + 1];
				const angle = Math.atan2(nextLetter.y - thisLetter.y, nextLetter.x - thisLetter.x) * 180 / Math.PI;
				thisLetter.beam = {
					left: `calc(var(--distance) * ${thisLetter.x})`,
					top: `calc(var(--distance) * ${thisLetter.y})`,
					rotate: `${angle}deg`
				};
			}
		} else {
			this.word.forEach(letter => {
				letter.beam = '';
			});
		}
	}

}
