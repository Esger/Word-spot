import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { MySettingsService } from 'services/my-settings-service';
import $ from 'jquery';

@inject(Element, EventAggregator, MySettingsService)
export class App {
	title = 'Woord Spot';
	count = 0;
	total = 0;
	constructor(element, eventAggregator, settingsService) {
		this._element = element;
		this._eventAggregator = eventAggregator;
		this.settingsService = settingsService;
	}
	attached() {
		this.highScore = this.settingsService.getSettings('high-score') || 0;
		this._wordSubscription = this._eventAggregator.subscribe('current-word', word => {
			this.word = word;
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
					if (this.total > this.highScore) {
						this.highScore = this.total;
						this.settingsService.saveSettings('high-score', this.highScore);
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
