export class MySettingsService {
	_settingsName = 'word-spot';
	_version = 'v0.1'; // increase when settings object changes
	_settings = {};

	constructor() {
		this._loadSettings();
	}

	saveSettings(setting, value) {
		this._settings[setting] = value;
		localStorage.setItem(this._settingsName, JSON.stringify(this._settings));
	}

	getSettings(setting) {
		if (!setting) return this._settings;
		return this._settings[setting];
	}

	_defaultSettings() {
		return {
			version: this._version,
		}
	}

	_loadSettings() {
		let settings = JSON.parse(localStorage.getItem(this._settingsName));
		if (!settings || settings === 'undefined' || settings.version !== this._version) {
			this._settings = this._defaultSettings();
			this.saveSettings(this._settings);
		}
		else this._settings = settings;
	}
}
