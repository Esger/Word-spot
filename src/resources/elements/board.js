import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { WordlistService } from 'services/word-list-service';
@inject(Element, EventAggregator, WordlistService)
export class Board {
	@bindable wordCount = 0;
	@bindable size = 3;
	@bindable language;
	_maxSize = 9;
	_minSize = 3;
	letters = [];
	_letterPool = [];
	word = [];

	constructor(element, eventAggregator, wordlistService) {
		this._element = element;
		this._eventAggregator = eventAggregator;
		this._wordlistService = wordlistService;
		this._addLetterClickedSubscription();
	}

	bind() {
		this._fillPool();
		this._fillLetters();
	}

	detached() {
		this._letterClickedSubscription?.dispose();
		this._hoverSubscription.dispose();
	}

	wordCountChanged() {
		const oldSize = this.size;
		const wordsToNextLevel = 10;
		const minLetterSize = 50;
		const maxSize = Math.min(this._element.clientWidth / minLetterSize, this._maxSize);
		const minSize = 3;
		this.size = Math.floor(Math.min((this.wordCount / wordsToNextLevel) + minSize, maxSize));
		(oldSize !== this.size) && this._fillLetters();
	}

	onTouchMove(event) {
		const x = event.touches[0].clientX;
		const y = event.touches[0].clientY;
		const target = document.elementFromPoint(x, y);
		const targetId = target.parentElement.id.split('-')[1];
		const letter = this.letters.find(letter => letter.id == targetId);
		if (typeof letter === 'object' && letter.id !== this._previousId) {
			this._eventAggregator.publish('letter-hovered', letter);
			this._previousId = letter.id
		}
	}

	_addLetter(letter) {
		if (this.word.includes(letter)) {
			this._setAnimation('down');
			const removeFromWord = this.word.splice(this.word.indexOf(letter) + 1);
			removeFromWord.forEach(l => l.inWord = false);
		} else {
			this.word.push(letter);
			letter.inWord = true;
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
			if (!this._firstLetter) return;
			if (typeof letter !== 'object') return;
			if (letter.adjacent || letter.inWord) {
				this._addLetter(letter);
				this._surroundingLetters(letter);
				this._eventAggregator.publish('current-word', this.word);
			}
		});
	}

	_addLetterClickedSubscription() {
		this._letterClickedSubscription = this._eventAggregator.subscribeOnce('letter-clicked', letter => {

			if (!this._firstLetter) {
				this._addHoverSubscription();
				this._firstLetter = letter;
				letter.wordStart = true;
				this.word = [];
				this._addLetter(letter);
				this._surroundingLetters(letter);
				this._addLetterClickedSubscription();
				this._eventAggregator.publish('current-word', this.word);
			} else {
				this._checkWord().then(resolve => {
					this._hoverSubscription?.dispose();
					this._resetStates();
					this._firstLetter = null;
					this._eventAggregator.publish('word-submitted', resolve);
					if (resolve) {
						this._win();
					} else {
						this.waitForAnimations = true;
						this._wrong();
						this._eventAggregator.publish('current-word', []);
						this.word = [];
						setTimeout(_ => {
							this.waitForAnimations = false;
						}, 500);
					}
					this._addLetterClickedSubscription();
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
		this.word.forEach((letter, index, word) => {
			const $letter = $('#letter-' + letter.id);
			$letter.one('transitionend', _ => {
				letter.entering = true;
				letter.y = -1;
				do {
					letter.letter = this._getRandomLetter().letter;
				} while (!this._hasVowels(this.letters) && !this._allVowels());
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
			if (word.indexOf(letter) === word.length - 1) {
				this.word = [];
			}
		});
	}

	_win() {
		this._setAnimation('right');
		this._removeWordFromBoard();
	}

	_wrong() {
		this._setAnimation('down');
	}

	_setAnimation(direction = 'right') {
		if (direction === 'right')
			document.getElementById('feedback').style.setProperty('--translate', '25vw 0');
		if (direction === 'down')
			document.getElementById('feedback').style.setProperty('--translate', '0 30vw');
	}

	_surroundingLetters(centerLetter) {
		this.letters.forEach(letter => letter.adjacent = false);
		const surroundingLetters = this.letters.filter(letter => {
			const isSelf = letter.id === centerLetter.id;
			return !letter.inWord && !isSelf && Math.abs(centerLetter.x - letter.x) <= 1 && Math.abs(centerLetter.y - letter.y) <= 1;
		});
		surroundingLetters.forEach(letter => letter.adjacent = true);
	}

	_fillPool() {
		this._letterPool = this._wordlistService.getLetterPool(this.language);
	}

	_hasVowels(letters) {
		const vowels = ['A', 'E', 'I', 'O', 'U'];
		return letters.some(letter => vowels.includes(letter.letter));
	}

	_allVowels() {
		const vowels = ['A', 'E', 'I', 'O', 'U'];
		return this.letters.every(letter => vowels.includes(letter.letter));
	}
	_getRandomLetter() {
		return this._letterPool[Math.floor(Math.random() * this._letterPool.length)];
	}

	_fillLetters() {
		this.letters = [];
		while (!this._hasVowels(this.letters) && this._allVowels()) {
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
