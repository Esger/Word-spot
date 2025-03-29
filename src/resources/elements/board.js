export class Board {
	alphabet = [
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
	size = 6;
	letters = [];
	letterPool = [];

	constructor() {
		this.alphabet.forEach(letter => {
			for (let i = 0; i < letter.frequency; i++) {
				this.letterPool.push({ letter: letter.letter });
			}
		});
		for (let i = 0; i < this.size * this.size; i++) {
			const letter = this.letterPool[Math.floor(Math.random() * this.letterPool.length)];
			this.letters.push(letter);
		}
	}
}
