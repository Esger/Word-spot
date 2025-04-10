import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { MySettingsService } from 'services/my-settings-service';
import { WordlistService } from 'services/word-list-service';
import $ from 'jquery';

@inject(Element, EventAggregator, MySettingsService, WordlistService)
export class App {
	title = 'Woord Spot';
	size = 3;
	count = 0;
	total = 0;
	constructor(element, eventAggregator, settingsService, wordlistService) {
		this._element = element;
		this._eventAggregator = eventAggregator;
		this._settingsService = settingsService;
		this._wordlistService = wordlistService;
	}
	attached() {
		this.highScore = this._settingsService.getSettings('high-score') || 0;
		this._wordSubscription = this._eventAggregator.subscribe('current-word', word => {
			this.word = this._wordlistService.getText(word);
			let bonus = 0;
			if (word.length == this.size) {
				if (word.every(letter => letter.x === word[0].x))
					bonus++;
				if (word.every(letter => letter.y === word[0].y))
					bonus++;
			}
			this.score = Math.pow(2, (word.length + bonus)) - 1;
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
					if (this.total > this.highScore) {
						this.highScore = this.total;
						this._settingsService.saveSettings('high-score', this.highScore);
					}
				}
			}, 25);
		});
	}

	detached() {
		this._wordSubscription.dispose();
		clearInterval(this._scoreTransferTimer);
	}
}
