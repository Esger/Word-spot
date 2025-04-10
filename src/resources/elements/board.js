import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { WordlistService } from 'services/word-list-service';
@inject(EventAggregator, WordlistService)
export class Board {
	@bindable wordCount = 0;
	@bindable size = 3;
	letters = [];
	_letterPool = [];
	word = [];

	constructor(eventAggregator, wordlistService) {
		this._eventAggregator = eventAggregator;
		this._wordlistService = wordlistService;
		this.fillPool();
		this._fillLetters();
		this._addLetterClickedSubscription();
	}

	detached() {
		this._letterClickedSubscription?.dispose();
		this._hoverSubscription.dispose();
	}

	wordCountChanged() {
		const oldSize = this.size;
		this.size = Math.min(Math.floor(this.wordCount / 10) + 3, 10);
		(oldSize !== this.size) && this._fillLetters();
	}

	_addLetter(letter) {
		if (this.word.includes(letter)) {
			this._setAnimation('down');
			const removeFromWord = this.word.splice(this.word.indexOf(letter) + 1);
			removeFromWord.forEach(l => l.inWord = false);
		} else {
			letter.inWord = true;
			this.word.push(letter);
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
			this._eventAggregator.publish('current-word', this.word);
		});
	}

	_addLetterClickedSubscription() {
		this._letterClickedSubscription = this._eventAggregator.subscribe('letter-clicked', letter => {

			if (!this._firstLetter) {
				this._addHoverSubscription()
				this._firstLetter = letter;
				letter.wordStart = true;
				this.word = [];
				this._addLetter(letter);
				this._surroundingLetters(letter);
			} else {
				this._checkWord().then(resolve => {
					if (resolve) {
						this._win();
						this._eventAggregator.publish('word-submitted', true);
					} else {
						this._wrong();
						this._eventAggregator.publish('word-submitted', false);
						this._eventAggregator.publish('current-word', '');
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
			const word = this._wordlistService.getText(this.word);
			const wordIsValid = this._wordlistService.isValid(word);
			resolve(wordIsValid);
		});
	}

	_removeWordFromBoard() {
		this.word.forEach(letter => {
			const $letter = $('#letter-' + letter.id);
			$letter.one('transitionend', _ => {
				letter.entering = true;
				letter.y = -1;
				do {
					letter.letter = this._getRandomLetter().letter;
				} while (!this._hasVowels(this.letters));
				setTimeout(_ => {
					// top of column
					letter.y = this.size - 1 - this.letters.filter(l => !l.removed && l.x === letter.x).length;
					letter.removed = false;
					letter.entering = false;
				});
			});
			letter.removed = true;
			letter.inWord = false;
			letter.oldLetter = letter.letter;
			letter.letter = undefined;
			const lettersAbove = this.letters.filter(l => l.y < letter.y && l.x === letter.x);
			lettersAbove.forEach(l => l.y++);
		});
	}

	_win() {
		this._setAnimation('right');
		this._removeWordFromBoard();
	}

	_wrong() {
		this._setAnimation('down');
		const word = this.word.map(letter => letter.letter).join('');
	}

	_setAnimation(direction = 'right') {
		if (direction === 'right')
			document.getElementById('feedback').style.setProperty('--translate', '25vw 0');
		if (direction === 'down')
			document.getElementById('feedback').style.setProperty('--translate', '0 30vw');
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
			const count = letter.frequency * 100;
			for (let i = 0; i < count; i++) {
				this._letterPool.push({ letter: letter.letter });
			}
		});
	}

	_hasVowels(letters) {
		const vowels = ['A', 'E', 'I', 'O', 'U'];
		return letters.some(letter => vowels.includes(letter.letter));
	}

	_getRandomLetter() {
		return this._letterPool[Math.floor(Math.random() * this._letterPool.length)];
	}

	_fillLetters() {
		this.letters = [];
		while (!this._hasVowels(this.letters)) {
			for (let y = 0; y < this.size; y++) {
				for (let x = 0; x < this.size; x++) {
					const letter = this._getRandomLetter();
					letter.x = x;
					letter.y = y;
					letter.id = this.letters.length;
					this.letters.push(structuredClone(letter));
				}
			}
		}
	}
}
