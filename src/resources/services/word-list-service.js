export class WordlistService {

	constructor() {
		// this.init();
	}

	async init(language) {
		this.wordlist = await this.loadWordlists(language);
	}

	async loadWordlists(language) {
		const fileNames = {
			'nl-NL': [
				'assets/wordlists/OpenTaal-210G-flexievormen.txt',
				'assets/wordlists/OpenTaal-210G-basis-gekeurd.txt'
			],
			'en-UK': [
				'assets/wordlists/English-Words-Alpha.txt',
			]
		}
		// if (!fileNames[language.code]) return;
		let unionSet;
		if (fileNames[language.code].length > 1) {
			const [wordlist1, wordlist2] = await Promise.all(fileNames[language.code].map(file => this.loadWordlist(file)));
			unionSet = wordlist1.union(wordlist2);
		} else {
			const wordlist = await this.loadWordlist(fileNames[language.code]);
			unionSet = new Set(wordlist);
		}
		return unionSet;
	}

	async loadWordlist(filename) {
		const response = await fetch(filename);
		const text = await response.text();
		return new Set(text.split('\n').map(word => this._normalizeAccents(word.trim().toLowerCase())));
	}

	_normalizeAccents(word) {
		return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}

	setLanguage(language) {
		this.init(language);
	}

	getText(word) {
		if (!Array.isArray(word)) return word;
		return word.map(letter => letter.letter).join('');
	}

	isValid(word) {
		const valid = this.wordlist.has(word.toLowerCase());
		return valid;
	}

	getLetterPool(language) {
		const frequencies = {
			'nl-NL': [
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
			],
			'en-UK': [
				{ "letter": "E", "frequency": 12.70 },
				{ "letter": "T", "frequency": 9.06 },
				{ "letter": "A", "frequency": 8.17 },
				{ "letter": "O", "frequency": 7.51 },
				{ "letter": "I", "frequency": 6.97 },
				{ "letter": "N", "frequency": 6.75 },
				{ "letter": "S", "frequency": 6.33 },
				{ "letter": "H", "frequency": 6.09 },
				{ "letter": "R", "frequency": 5.99 },
				{ "letter": "D", "frequency": 4.25 },
				{ "letter": "L", "frequency": 4.03 },
				{ "letter": "C", "frequency": 2.78 },
				{ "letter": "U", "frequency": 2.76 },
				{ "letter": "M", "frequency": 2.41 },
				{ "letter": "W", "frequency": 2.36 },
				{ "letter": "F", "frequency": 2.23 },
				{ "letter": "G", "frequency": 2.02 },
				{ "letter": "Y", "frequency": 1.97 },
				{ "letter": "P", "frequency": 1.93 },
				{ "letter": "B", "frequency": 1.49 },
				{ "letter": "V", "frequency": 0.98 },
				{ "letter": "K", "frequency": 0.77 },
				{ "letter": "J", "frequency": 0.15 },
				{ "letter": "X", "frequency": 0.15 },
				{ "letter": "Q", "frequency": 0.10 },
				{ "letter": "Z", "frequency": 0.07 }
			]

		};

		const letterPool = [];
		frequencies[language.code].forEach(letter => {
			const count = letter.frequency * 100;
			for (let i = 0; i < count; i++) {
				letterPool.push({ letter: letter.letter });
			}
		});
		return letterPool;
	}

}
