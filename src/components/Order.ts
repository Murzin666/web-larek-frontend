import { Form } from './common/Form';
import { IForm } from '../types';
import { IEvents } from './base/events';
import { ensureAllElements } from '../utils/utils';

export class PaymentForm extends Form<IForm> {
  protected _allButton: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

    this._allButton = ensureAllElements<HTMLButtonElement>('.button_alt', this.container);
    this._allButton.forEach(btn => {
      btn.addEventListener('click', (event) => {
        if (btn.classList.contains('button_alt-active')) return;
        this._allButton.forEach(button => {
          button.classList.toggle('button_alt-active', button === btn)
        });
        events.emit('payment:changed', btn);
      });
    });
	}

	set address(address: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value = address;
	}
}

export class ContactForm extends Form<IForm> {
  constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
  }

  set email(email: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value = email;
	}

  set phone(phone: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value = phone;
	}
}