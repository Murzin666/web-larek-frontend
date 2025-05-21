import './scss/styles.scss';

import { WebLarekAPI } from './components/WebLarekAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppState, CatalogChangeEvent, CardItem } from './components/AppData';
import { Page } from './components/Page';
import { Card, CardBasket } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { FormErrors, IForm, IOrder, IOrderTotal, ICard } from './types/index';
import { PaymentForm, ContactForm } from './components/Order';
import { Success } from './components/common/Success';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const contactTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const paymentForm = new PaymentForm(cloneTemplate(orderTemplate), events);
const contact = new ContactForm(cloneTemplate(contactTemplate), events);

// Дальше идет поймали событие, сделали что нужно

// Изменились элементы каталога
events.on<CatalogChangeEvent>('catalog:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			category: item.category,
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
		});
	});
});

// Получаем товары с сервера
api.getCardItems()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});

events.on('order.address:change',	(data: { field: keyof IOrder; value: string }) => {
		appData.setOrderField(data.field, data.value);
});

events.on('payment:changed',	(data: { field: keyof IOrder; value: string }) => {
	data.field="payment";
	appData.setOrderField(data.field, data.value);
});

// Изменилось состояние валидации формы платежного метода
events.on('formErrors:change', (errors: FormErrors) => {
	const { payment, address } = errors;
	paymentForm.valid = !payment && !address;
	paymentForm.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

events.on('contacts.phone:change',	(data: { field: keyof IOrder; value: string }) => {
		appData.setContactField(data.field, data.value);
});

events.on('contacts.email:change',	(data: { field: keyof IOrder; value: string }) => {
	appData.setContactField(data.field, data.value);
});

// Изменилось состояние валидации формы контактов
events.on('contactErrors:change', (errors: FormErrors) => {
	const { email, phone } = errors;
	contact.valid = !email && !phone;
	contact.errors = Object.values({ email, phone })
		.filter((i) => !!i)
		.join('; ');
});

// Открыть форму платежного метода
events.on('order:open', () => {
	modal.render({
		content: paymentForm.render({
			payment: '',
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// Открыть форму контактов
events.on('order:submit', () => {
	modal.render({
		content: contact.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
});


// Открыть закрытую корзину
events.on('basket:open', () => {
	modal.render({
		content: basket.render(),
	});
});

// Изменения в корзине, но лучше все пересчитать
events.on('basket:changed', () => {
	page.counter = appData.basketItems.length;
	basket.items = appData.basketItems.map((id, index) => {
		const item = appData.catalog.find((item) => item.id === id);
		const cardItem = new CardBasket(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				appData.deleteItemToBasket(item);
			},
		});
		item.index = index + 1;

		return cardItem.render({
			index: item.index,
			title: item.title,
			price: item.price,
		});
	});
	basket.total = appData.getTotal();
});

// Открыть карточку
events.on('card:select', (item: CardItem) => {
	appData.setPreview(item);
});

// Изменен открытый выбранный товар
events.on('preview:changed', (item: CardItem) => {
	const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			if (!appData.checkItemInBasket(item)) {
				events.emit('itemBasket:add', item);
                card.button = 'Убрать';

			} else {
				events.emit('itemBasket:delete', item);
                card.button = 'В корзину';
			}
		},
	});

	modal.render({
		content: card.render({
			...item,
			button: appData.checkItemInBasket(item) ? 'Убрать' : 'В корзину',
		}),
	});
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

events.on('itemBasket:add', (item: CardItem) => {
	appData.addItemToBasket(item);
	modal.close();
});

events.on('itemBasket:delete', (item: CardItem) => {
	appData.deleteItemToBasket(item);
});

// Отправка формы заказа
events.on('contacts:submit', () => {
	api
		.orderLots(appData.getOrder())
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
				},
			});

			modal.render({
				content: success.render({}),
			});
			success.total = appData.basketTotal;
			appData.clearBasket();
			events.emit('basket:changed');
		})
		.catch((err) => {
			console.error(err);
		});
});