import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import $ from 'jquery';

@inject(Element, EventAggregator)
export class App {
	title = 'Woord Spot';
	constructor(element, eventAggregator) {
		this._element = element;
		this._eventAggregator = eventAggregator;
		this._determineTouchDevice();
	}

	_determineTouchDevice() {
		this._setIsTouchDevice('ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0);
		$('body').one('touchstart', _ => this._setIsTouchDevice(true))
	}

	_setIsTouchDevice(isTouch) {
		$('html').toggleClass('touch-device', isTouch);
		sessionStorage.setItem('touch-device', isTouch);
	}

}
