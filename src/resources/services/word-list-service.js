export class WordlistService {

	constructor() {
		this.init();
	}

	async init() {
		this.wordlist = await this.loadWordlists();
	}

	async loadWordlists() {
		const [wordlist1, wordlist2] = await Promise.all([
			this.loadWordlist('assets/wordlists/OpenTaal-210G-flexievormen.txt'),
			this.loadWordlist('assets/wordlists/OpenTaal-210G-basis-gekeurd.txt')
		]);

		const unionSet = wordlist1.union(wordlist2);
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

	isValid(word) {
		const valid = this.wordlist.has(word.toLowerCase());
		return valid;
	}
}
