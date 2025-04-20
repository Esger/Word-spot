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
			const multiplier = this._getBonus(word);
			this.score = Math.pow(2, (word.length + multiplier)) - 1;
			this._eventAggregator.publish('multiplier', multiplier);
		});
		this._wordSubmittedSubscription = this._eventAggregator.subscribe('word-submitted', success => {
			this.count += success;
			if (!success) {
				this.score = 0;
				// return
			};
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

	_getBonus(word) {
		if (!Array.isArray(word) || !word.length) return 0;
		let multiplier = 0;
		const minX = word.reduce((min, letter) => Math.min(min, letter.x), word[0].x);
		const maxX = word.reduce((max, letter) => Math.max(max, letter.x), word[0].x);
		const minY = word.reduce((min, letter) => Math.min(min, letter.y), word[0].y);
		const maxY = word.reduce((max, letter) => Math.max(max, letter.y), word[0].y);
		const dx = maxX - minX;
		const dy = maxY - minY;
		if (word.length === this.size) {
			// horizontaal woord x2
			word.every(letter => letter.x === word[0].x) && multiplier++;
			// verticaal woord x2
			word.every(letter => letter.y === word[0].y) && multiplier++;
			// diagonaal woord x4
			const last = this.size - 1;
			const diagonals = [['0' + last, last + '0'], ['00', '' + last + last]]
			const wordStart = '' + word[0].x + word[0].y;
			const wordEnd = '' + word[word.length - 1].x + word[word.length - 1].y;
			if (diagonals.some(diagonal => diagonal.includes(wordStart) && diagonal.includes(wordEnd)))
				multiplier += 2;
		};
		switch (word.length) {
			case 4: // vierkant woord x2
				dx == 1 && dy == 1 && multiplier++;
				break;
			case 5: // plusje woord x2
				const smallestX = Math.min(...word.map(letter => letter.x));
				const letterWithSmallestX = word.find(letter => letter.x === smallestX);
				const lettersInRowSmallestX = word.filter(letter => letter.y === letterWithSmallestX.y).length;

				const smallestY = Math.min(...word.map(letter => letter.y));
				const letterWithSmallestY = word.find(letter => letter.y === smallestY);
				const lettersInColumnSmallestY = word.filter(letter => letter.x === letterWithSmallestY.x).length;


				(lettersInRowSmallestX == 3 && lettersInColumnSmallestY == 3) && multiplier++;
				break;
			case 6: // rechthoek 2x3 woord x4
				dx + dy == 3 && (multiplier += 2)
				break;
			case 8: // rechthoek 2x4 woord x4
				((dx == 3 && dy == 1) || (dx == 1 && dy == 3)) && (multiplier += 2);
			case 9: // vierkant woord x4
				dx == 2 && dx == 2 && (multiplier += 2);
				break;
			case 16: // vierkant woord x4
				dx == 3 && dx == 3 && (multiplier += 3);
				break;
		}


		return multiplier;
	}

	detached() {
		this._wordSubscription.dispose();
		this._wordSubmittedSubscription
		clearInterval(this._scoreTransferTimer);
	}
}
