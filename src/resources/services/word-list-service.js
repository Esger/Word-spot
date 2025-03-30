export class WordlistService {

	constructor() {
		this.init();
	}

	async init() {
		this.wordlist = await this.loadWordlists();
	}

	async loadWordlists() {
		const [wordlist1, wordlist2] = await Promise.all([
			this.loadWordlist('assets/OpenTaal-210G-flexievormen.txt'),
			this.loadWordlist('assets/OpenTaal-210G-basis-gekeurd.txt')
		]);

		const unionSet = wordlist1.union(wordlist2);
		return unionSet;
	}

	async loadWordlist(filename) {
		const response = await fetch(filename);
		const text = await response.text();
		return new Set(text.split('\n').map(word => word.trim().toLowerCase()));
	}

	valid(word) {
		const valid = this.wordlist.has(word.toLowerCase());
		return valid;
	}
}
