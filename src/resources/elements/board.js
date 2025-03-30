import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { resolve } from 'promise-polyfill';

@inject(EventAggregator)
export class Board {
	size = 7;
	letters = [];
	_letterPool = [];
	_word = [];

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this.fillPool();
		this.fillLetters();
		this._addLetterClickedSubscription();
	}

	detached() {
		this._letterClickedSubscription?.dispose();
		this._hoverSubscription.dispose();
	}

	_addLetter(letter) {
		if (this._word.includes(letter)) {
			if (this._word[this._word.length - 2] === letter) {
				const out = this._word.pop();
				out.inWord = false;
			}
		} else {
			letter.inWord = true;
			this._word.push(letter);
		}
	}

	_resetStates() {
		this.letters.forEach(letter => {
			letter.adjacent = false;
			letter.inWord = false;
			letter.wordStart = null;
			letter.selected = false;
		});
	}

	_addLetterClickedSubscription() {
		this._letterClickedSubscription = this._eventAggregator.subscribe('letter-clicked', letter => {

			if (!this._firstLetter) {
				this._hoverSubscription = this._eventAggregator.subscribe('letter-hovered', letter => {
					if (!this._firstLetter)
						return;
					this._addLetter(letter);
					this._surroundingLetters(letter)
				});
				this._firstLetter = letter;
				letter.wordStart = true;
				this._word = [];
				this._addLetter(letter);
				this._surroundingLetters(letter);
			} else {
				if (this._word.includes(letter)) {
					const isFirstLetter = this._word.indexOf(letter) === 0;
					if (isFirstLetter) {
						this._firstLetter = null;
						this._resetStates();
						this._word.pop();
					} else {
						const isLastLetter = this._word.indexOf(letter) === this._word.length - 1;
						if (isLastLetter) {
							this._lastLetter = letter;
							this._checkWord().then(resolve => {
								if (resolve) {
									console.log('win: ', this._word);
									this._win();
								} else {
									console.log('loose: ', this._word);
									this._word.pop();
									this._resetStates();
								}
							});
						}
					}
				} else {
					this._lastLetter = letter;
				}
			}
		});
	}

	_checkWord() {
		return new Promise((resolve, reject) => {
			if (this._word.length < 3)
				resolve(false);
			else
				resolve(true);
		});
	}

	_win() {
		const word = this._word.map(letter => letter.letter).join('');
		this.letters.forEach(letter => {
			letter.adjacent = false;
			letter.inWord = false;
			letter.wordStart = false;
			letter.selected = false;
		});
		this._firstLetter = null;
		this._hoverSubscription?.dispose();
	}

	_surroundingLetters(centreLetter) {
		// if (!this._firstLetter) 
		// 	return;
		this.letters.forEach(letter => letter.adjacent = false);
		const surroundingLetters = this.letters.filter(letter => {
			const isSelf = letter.id === centreLetter.id;
			return !letter.wordStart && !isSelf && Math.abs(centreLetter.x - letter.x) <= 1 && Math.abs(centreLetter.y - letter.y) <= 1;
		});
		surroundingLetters.forEach(letter => letter.adjacent = true);
	}

	fillPool() {
		const alphabet = [
			{ "letter": "E", "frequency": 18.91 },
			{ "letter": "N", "frequency": 10.03 },
			{ "letter": "A", "frequency": 7.49 },
			{ "letter": "T", "frequency": 6.79 },
			{ "letter": "I", "frequency": 6.50 },
			{ "letter": "R", "frequency": 6.41 },
			{ "letter": "O", "frequency": 6.06 },
			{ "letter": "D", "frequency": 5.93 },
			{ "letter": "S", "frequency": 3.73 },
			{ "letter": "L", "frequency": 3.57 },
			{ "letter": "G", "frequency": 3.40 },
			{ "letter": "H", "frequency": 2.38 },
			{ "letter": "K", "frequency": 2.25 },
			{ "letter": "M", "frequency": 2.21 },
			{ "letter": "U", "frequency": 1.99 },
			{ "letter": "B", "frequency": 1.58 },
			{ "letter": "P", "frequency": 1.57 },
			{ "letter": "V", "frequency": 1.48 },
			{ "letter": "W", "frequency": 1.38 },
			{ "letter": "J", "frequency": 1.36 },
			{ "letter": "Z", "frequency": 1.13 },
			{ "letter": "F", "frequency": 0.81 },
			{ "letter": "C", "frequency": 0.73 },
			{ "letter": "X", "frequency": 0.04 },
			{ "letter": "Y", "frequency": 0.04 },
			{ "letter": "Q", "frequency": 0.01 }
		];
		this._letterPool = [];
		alphabet.forEach(letter => {
			for (let i = 0; i < letter.frequency; i++) {
				this._letterPool.push({ letter: letter.letter });
			}
		});
	}

	fillLetters() {
		this.letters = [];
		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				const letter = this._letterPool[Math.floor(Math.random() * this._letterPool.length)];
				letter.x = x;
				letter.y = y;
				letter.id = this.letters.length;
				this.letters.push(structuredClone(letter));
			}
		}
	}
}
