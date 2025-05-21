import { Model } from './base/Model';
import { FormErrors, IForm, IOrder, IOrderTotal, ICard } from '../types/index';
import { EventEmitter } from './base/events';

export type CatalogChangeEvent = {
	catalog: CardItem[];
};

export class CardItem extends Model<ICard> {
	id: string;
	category: string;
	title: string;
	image: string;
	description: string;
	price: number | null;
	index: number;
	button: string;
}

export interface IAppState {
	basketItems: string[];
	basketTotal: number;
	catalog: CardItem[];
	order: IForm | null;
	preview: string | null;
}

export class AppState extends Model<IAppState> {
	basketItems: string[] = [];
	basketTotal: number = 0;
	catalog: CardItem[] = [];
	order: IForm = {
		payment: '',
		address: '',
		email: '',
		phone: '',
	};
	preview: CardItem | null;
	formErrors: FormErrors = {};

	constructor(data: Partial<{}>, events: EventEmitter) {
		super(data, events);
	}

	addItemToBasket(item: CardItem): void {
		this.basketItems.push(item.id);
		this.basketTotal = this.getTotal() + item.price;
		this.events.emit('basket:changed', this.basketItems);
	}

	deleteItemToBasket(item: CardItem): void {
		const indexDelete = this.basketItems.indexOf(item.id);
		if (indexDelete >= 0) {
			this.basketItems.splice(indexDelete, 1);
			this.basketTotal = this.getTotal() - item.price;
			this.events.emit('basket:changed', this.basketItems);
		}
	}

	checkItemInBasket(item: CardItem) {
		return this.basketItems.includes(item.id);
	}

	clearBasket(): void {
		this.basketItems = [];
		this.basketTotal = 0;
		this.order = {
			payment: '',
			address: '',
			email: '',
			phone: '',
		};
	}

	getOrder(): IOrder {
		return {
			...this.order,
			items: this.basketItems,
			total: this.basketTotal,
		};
	}

	getTotal() {
		return this.basketTotal;
	}

	setCatalog(items: CardItem[]) {
		this.catalog = items.map((items) => new CardItem(items, this.events));
		this.events.emit('catalog:changed', { catalog: this.catalog });
	}

	setPreview(items: CardItem) {
		this.preview = items;
		this.events.emit('preview:changed', items);
	}

	setOrderField(field: keyof IOrderTotal, value: string) {
		if (field === 'payment') {
			this.order.payment = value;
		}
		if (field === 'address') {
			this.order.address = value;
		}
		this.validatePayment();
	}

	validatePayment() {
		const errors: typeof this.formErrors = {};
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		if (!this.order.payment) {
			errors.payment = 'Необходимо выбрать способ оплаты';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	setContactField(field: keyof IOrderTotal, value: string) {
		if (field === 'email') {
			this.order.email = value;
		}
		if (field === 'phone') {
			this.order.phone = value;
		}
		this.validateContact();
	}

	validateContact() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('contactErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
