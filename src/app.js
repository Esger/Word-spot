import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { MySettingsService } from 'services/my-settings-service';
import { WordlistService } from 'services/word-list-service';
import $ from 'jquery';

@inject(Element, EventAggregator, MySettingsService, WordlistService)
export class App {
	size = 3;
	count = 0;
	total = 0;
	languages = [
		{ code: 'en-UK', name: 'English' },
		{ code: 'nl-NL', name: 'Nederlands' }
	]
	translations = {
		'en-UK': {
			'title': 'Word Spot'
		},
		'nl-NL': {
			'title': 'Woord Spot',
		}
	}
	constructor(element, eventAggregator, settingsService, wordlistService) {
		this._element = element;
		this._eventAggregator = eventAggregator;
		this._settingsService = settingsService;
		this._wordlistService = wordlistService;
		const lang = navigator.language || navigator.userLanguage;
		const selectedLanguage = this.languages.find(l => l.code === lang) || this.languages[0];
		this.selectedLanguageCode = selectedLanguage.code;
		$('html').attr('lang', this.selectedLanguageCode.code);
		this._wordlistService.setLanguage(selectedLanguage);
	}

	attached() {
		this.highScore = this._settingsService.getSettings('high-score') || 0;
		this._wordSubscription = this._eventAggregator.subscribe('current-word', word => {
			this.score = 0;
			if (this._isAnimating) return;
			this.word = this._wordlistService.getText(word);
			const multiplier = this._getBonus(word);
			this.score = Math.pow(2, (word.length + multiplier)) - 1;
			this._eventAggregator.publish('multiplier', multiplier);
		});
		this._wordSubmittedSubscription = this._eventAggregator.subscribe('word-submitted', success => {
			if (this._isAnimating) return;
			this._isAnimating = true;
			this.count += success;
			if (!success) this.score = 0;
			this._scoreTransferTimer = setInterval(_ => {
				if (this.score > 0) {
					this.total++;
					this.score--;
				} else {
					clearInterval(this._scoreTransferTimer);
					setTimeout(_ => this._isAnimating = false, this.word.length * 200);
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
		let multiplier = 0;
		if (!Array.isArray(word) || word.length < 2) return multiplier;
		const minX = word.reduce((min, letter) => Math.min(min, letter.x), word[0].x);
		const maxX = word.reduce((max, letter) => Math.max(max, letter.x), word[0].x);
		const minY = word.reduce((min, letter) => Math.min(min, letter.y), word[0].y);
		const maxY = word.reduce((max, letter) => Math.max(max, letter.y), word[0].y);
		const dx = maxX - minX;
		const dy = maxY - minY;
		const bonuses = [];
		if (word.length === this.size) {
			// horizontaal woord x2
			const isRow = word.every(letter => letter.x === word[0].x);
			if (isRow) {
				bonuses.push('verticaal');
				multiplier++;
			}
			// verticaal woord x2
			const isColumn = word.every(letter => letter.y === word[0].y);
			if (isColumn) {
				bonuses.push('horizontaal');
				multiplier++;
			}
			// diagonaal woord x4
			const last = this.size - 1;
			const diagonals = [['0' + last, last + '0'], ['00', '' + last + last]]
			const wordStart = '' + word[0].x + word[0].y;
			const wordEnd = '' + word[word.length - 1].x + word[word.length - 1].y;
			if (diagonals.some(diagonal => diagonal.includes(wordStart) && diagonal.includes(wordEnd))) {
				bonuses.push('diagonaal');
				multiplier += 2;
			}
		};
		switch (word.length) {
			case 4: // vierkant woord x2
				const is2x2 = dx + dy == 2;
				if (!is2x2) break;

				bonuses.push('vierkant2x2');
				multiplier++;
				break;
			case 5: // plusje woord x2
				const smallestX = Math.min(...word.map(letter => letter.x));
				const letterWithSmallestX = word.find(letter => letter.x === smallestX);
				const lettersInRowSmallestX = word.filter(letter => letter.y === letterWithSmallestX.y).length;

				const smallestY = Math.min(...word.map(letter => letter.y));
				const letterWithSmallestY = word.find(letter => letter.y === smallestY);
				const lettersInColumnSmallestY = word.filter(letter => letter.x === letterWithSmallestY.x).length;

				if (lettersInRowSmallestX == 3 && lettersInColumnSmallestY == 3) {
					bonuses.push('plusje');
					multiplier++;
				}
				break;
			case 6: // rechthoek 2x3 woord x4
				const is2x3 = dx + dy == 3;
				if (!is2x3) break;

				bonuses.push('rechthoek2x3');
				multiplier += 2;
				break;
			case 8: // rechthoek 2x4 woord x4
				const is2x4 = ((dx == 3 && dy == 1) || (dx == 1 && dy == 3))
				if (!is2x4) break;

				bonuses.push('rechthoek2x4');
				multiplier += 2;
				break;
			case 9: // vierkant woord x4
				const is3x3 = dx == 2 && dy == 2;
				if (!is3x3) break;

				bonuses.push('vierkant3x3');
				multiplier += 2;
				break;
			case 16: // vierkant woord x8
				const is4x4 = dx == 3 && dx == 3;
				if (!is4x4) break;

				bonuses.push('vierkant4x4');
				multiplier += 3;
				break;
		}
		return multiplier;
	}

	detached() {
		this._wordSubscription.dispose();
		this._wordSubmittedSubscription
		clearInterval(this._scoreTransferTimer);
	}

	changeLanguage(language) {
		this.selectedLanguageCode = language.code;
		this._wordlistService.setLanguage(language);
		$('nav')[0].hidePopover();
	}
}
