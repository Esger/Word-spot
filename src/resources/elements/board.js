import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Board {
	size = 7;
	letters = [];
	letterPool = [];

	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this.fillPool();
		this.fillLetters();
		this._wordStartSubscription = this._eventAggregator.subscribe('letter-selected', () => this.surroundingLetters());
	}

	surroundingLetters() {
		console.log('yo');
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
		this.letterPool = [];
		alphabet.forEach(letter => {
			for (let i = 0; i < letter.frequency; i++) {
				this.letterPool.push({ letter: letter.letter });
			}
		});
	}

	fillLetters() {
		this.letters = [];
		for (let y = 0; y < this.size; y++) {
			for (let x = 0; x < this.size; x++) {
				const letter = this.letterPool[Math.floor(Math.random() * this.letterPool.length)];
				letter.x = x;
				letter.y = y;
				this.letters.push(structuredClone(letter));
			}
		}
	}
}
