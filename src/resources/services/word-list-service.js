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
}
