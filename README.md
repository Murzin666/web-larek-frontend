# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## В основе планируется использовать архитектуру MVP
Код приложения разделен на слои согласно парадигме MVP.
 1. Слой представления, отвечает за отображение данных на странице. Код представления будет содержаться в Modal.ts
 2. Слой данных, отвечает за хранение и изменение данных. Код хранения данных будет содержаться в AppData.ts
 3. Презентер, отвечает за связь представления и данных. Код презентера будет содержаться в index.ts

## Слой Презентер
1. Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

2. Модель данных приложения
const appData = new AppState({}, events);

3. Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

4. Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const paymentForm = new PaymentForm(cloneTemplate(orderTemplate), events);
const contact = new ContactForm(cloneTemplate(contactTemplate), events);

 - Дальше идет поймали событие, сделали что нужно

5. Изменились элементы каталога
events.on<CatalogChangeEvent>('catalog:changed')

6. Получаем товары с сервера
api.getCardItems()

7. Изменились данные адреса
events.on('order.address:change')

8. Изменились данные способа платежа
events.on('payment:changed')

9. Изменилось состояние валидации формы платежного метода
events.on('formErrors:change')

10. Изменились данные телефона
events.on('contacts.phone:change')

11. Изменились данные почты
events.on('contacts.email:change')

12. Изменилось состояние валидации формы контактов
events.on('contactErrors:change')

13. Открыть форму платежного метода
events.on('order:open')

14. Открыть форму контактов
events.on('order:submit')

15. Открыть закрытую корзину
events.on('basket:open')

16. Изменения в корзине, но лучше все пересчитать
events.on('basket:changed')

17. Открыть карточку
events.on('card:select')

18. Изменен открытый выбранный товар
events.on('preview:changed')

19. Блокируем прокрутку страницы если открыта модалка
events.on('modal:open')

20. Разблокируем прокрутку страницы если закрыта модалка
events.on('modal:close')

21. Добавляем товар в корзину
events.on('itemBasket:add')

22. Удаляем товар из корзины
events.on('itemBasket:delete')

23. Отправка формы заказа
events.on('contacts:submit')

## Базовые классы

1. Класс api
Класс имеет такие методы:
  - handleResponse - Возвращает promise с данными ответа или ошибки.
  - get - отправляет GET-запрос на сервер и обрабатывает ответ через handleResponse
  - post - Отправляет запрос с указанным методом и телом и обрабатывает ответ через handleResponse

2. Класс event
Класс имеет такие методы:
  - on - Установить обработчик на событие
  - off - Снять обработчик с события
  - emit - Инициировать событие с данными
  - onAll - Слушать все события
  - offAll - Сбросить все обработчики
  - trigger - Сделать коллбек триггер, генерирующий событие при вызове

3. Класс Component
Класс имеет такие методы:
  - setText - Установить текстовое содержимое
  - setDisabled - Сменить статус блокировки
  - setHidden - Скрыть
  - setVisible - Показать
  - setImage - Установить изображение с алтернативным текстом
  - render - Вернуть корневой DOM-элемент

4. Класс Model
Класс имеет такие методы:
  - emitChanges - Сообщить всем что модель поменялась

## Остальные классы

1. Класс WebLarekAPI
Класс имеет такие методы:
  - getCardItems - получить список карточек товаров с сервера
  - orderLots - получить ответ при покупке заказа

export interface IWebLarekAPI {
  getCardItems: () => Promise<ICard[]>;
  orderLots: (order: IOrderTotal) => Promise<IOrderResult>;
}

2. Класс Card
Класс имеет такие методы:
  - set id - установить id товара
  - get id - получить id товара
  - set category - установить категорию товара
  - set title - установить заголовок товара
  - get title - получить заголовок товара
  - set image - установить изображение товара
  - set description - установить описание товара
  - set price - установить цену

3. Класс CardBasket
Класс имеет такие методы:
  - set index - установиить индекс в корзине для товара
  - set title - установить название товара в корзине
  - set price - установить цену для товара

4. Класс Page
Класс имеет такие методы:
  - set counter - установить значение количество товаров в корзине
  - set catalog - установить каталог товаров на странице
  - set locked - установить блокировку или разблокировку прокрутку страницы

interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

5. Класс Modal
Класс имеет такие методы:
  - set content - устанавливает содержимое модального окна
  - open - открывает модальное окно
  - close - закрывает модальное окно
  - render - заполняет модальное окно контентом и возвращает её DOM-элемент

interface IModalData {
    content: HTMLElement;
}

6. Класс Basket
Класс имеет такие методы:
  - set items - устанавливает список товаров в корзине
  - set selected - управляет состоянием кнопки оформления заказа (активна/неактивна)
  - set total - устанавливает общую стоимость всех товаров в корзине

interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: string[];
}

7. Класс Form
Класс имеет такие методы:
  - onInputChange - обрабатывает изменение значения в поле формы (например, при вводе текста)
  - set valid - управляет состоянием кнопки отправки формы (активна/заблокирована)
  - set errors - отображает ошибки валидации формы
  - render - обновляет форму: заполняет поля значениями и управляет её состоянием (ошибки, валидность)

interface IFormState {
    valid: boolean;
    errors: string[];
}

8. Класс AppState
Класс имеет такие методы:
  - addItemToBasket - добавление товара в корзину
  - deleteItemToBasket - удаление товара из корзины
  - checkItemInBasket - проверка наличия товара в корзине
  - clearBasket - Очищает корзину полностью
  - getOrder - Возвращает ордер со всеми данными
  - getTotal - Возвращает общую сумму заказа
  - setCatalog - Устанавливает каталог товаров, используется Emit для отслеживания изменения в каталоге
  - setPreview - Устанавливает товар для предпросмотра, используется Emit для отслеживания открытия preview
  - setOrderField - Устанавливает значение поля платежа и адреса
  - validatePayment - Проверяет валидность заказа способа оплаты
  - setContactField - Устанавливает значение поля почты и телефона
  - validateContact - Проверяет валидность заказа контактных данных

export interface IAppState {
	basketItems: string[];
	basketTotal: number;
	catalog: CardItem[];
	order: IForm | null;
	preview: string | null;
}

9. Класс Success
Класс имеет такие методы:
  - set total - после успешного подтверждения заказа обновляет отображаемую сумму заказа

interface ISuccess {
    total: number;
}