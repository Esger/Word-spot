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
			const removeFromWord = this._word.splice(this._word.indexOf(letter) + 1);
			removeFromWord.forEach(l => l.inWord = false);
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

	_addHoverSubscription() {
		this._hoverSubscription = this._eventAggregator.subscribe('letter-hovered', letter => {
			if (!this._firstLetter)
				return;
			this._addLetter(letter);
			this._surroundingLetters(letter);
		});
	}

	_addLetterClickedSubscription() {
		this._letterClickedSubscription = this._eventAggregator.subscribe('letter-clicked', letter => {

			if (!this._firstLetter) {
				this._addHoverSubscription()
				this._firstLetter = letter;
				letter.wordStart = true;
				this._word = [];
				this._addLetter(letter);
				this._surroundingLetters(letter);
			} else {
				this._checkWord().then(resolve => {
					if (resolve) {
						console.log('win: ', this._word);
						this._win();
					} else {
						console.log('loose: ', this._word);
						this._wrong();
					}
					this._resetStates();
					this._firstLetter = null;
					this._hoverSubscription?.dispose();
				});
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

	_removeWordFromBoard() {
		this._word.forEach(letter => {
			const $letter = $('#letter-' + letter.id);
			$letter.one('transitionend', _ => {
				letter.entering = true;
				letter.y = -1;
				setTimeout(_ => {
					letter.letter = this._letterPool[Math.floor(Math.random() * this._letterPool.length)].letter;
					letter.y = this.size - 1 - this.letters.filter(l => !l.removed && l.x === letter.x).length;
					letter.removed = false;
					letter.entering = false;
				});
			});
			letter.removed = true;
			letter.inWord = false;
			const lettersAbove = this.letters.filter(l => l.y < letter.y && l.x === letter.x);
			lettersAbove.forEach(l => l.y++);
		});
	}

	_win() {
		this._removeWordFromBoard();
		const word = this._word.map(letter => letter.letter).join('');
	}

	_wrong() {
		const word = this._word.map(letter => letter.letter).join('');
	}

	_surroundingLetters(centreLetter) {
		this.letters.forEach(letter => letter.adjacent = false);
		const surroundingLetters = this.letters.filter(letter => {
			const isSelf = letter.id === centreLetter.id;
			return !letter.inWord && !isSelf && Math.abs(centreLetter.x - letter.x) <= 1 && Math.abs(centreLetter.y - letter.y) <= 1;
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
