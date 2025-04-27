import { inject, bindable } from 'aurelia-framework';
@inject(Element)
export class MenuCustomElement {
	@bindable targetPopover;
	@bindable menuIcon;
	constructor(element) {
		this._element = element;
	}
	attached() {
		$(this._element).find('.menuToggle').attr('popovertarget', this.targetPopover);
		$(this._element).find('[popover]').attr('id', this.targetPopover);
	}
}
