import {Component} from "./base/Component";
import {ensureElement} from "../utils/utils";
import { CardItem } from "./AppData";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class Card extends Component<CardItem> {
    protected _category: HTMLElement;
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _price: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._category = container.querySelector(`.${blockName}__category`);
        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._description = container.querySelector(`.${blockName}__text`);
        this._price = ensureElement<HTMLImageElement>(`.${blockName}__price`, container);
        this._button = container.querySelector(`.${blockName}__button`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set category(value: string) {
        this.setText(this._category, value);
        const categories: Record<string, string> = {
            'софт-скил': 'card__category_soft',
            'хард-скил': 'card__category_hard',
            'другое': 'card__category_other',
            'дополнительное': 'card__category_additional',
            'кнопка': 'card__category_button'
        };
        this._category.className = `${this.blockName}__category`;
        this._category.classList.add(`${categories[value]}`)
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set description(value: string | string[]) {
        if (Array.isArray(value)) {
            this._description.replaceWith(...value.map(str => {
                const descTemplate = this._description.cloneNode() as HTMLElement;
                this.setText(descTemplate, str);
                return descTemplate;
            }));
        } else {
            this.setText(this._description, value);
        }
    }

    set price(value: number) {
        if (value !== null) {
			this.setText(this._price, `${String(value)} синапсов`);
		} else {
			this.setText(this._price, 'Бесценно');
		}
        if (this._button) {
            this._button.disabled = !value;
        }
    }

    set button(value: string) {
        this.setText(this._button, value);
    }
}

export class CardBasket extends Component<CardItem> {
    protected _index: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement
    protected _deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._index = container.querySelector(`.basket__item-index`);
        this._title = ensureElement<HTMLElement>(`.card__title`, container);
        this._price = ensureElement<HTMLButtonElement>(`.card__price`, container);
        this._deleteButton = container.querySelector(`.basket__item-delete`);

        if (actions?.onClick) {
            this._deleteButton.addEventListener('click', actions.onClick);
        }
    }

    set index(value: number) {
        this._index.textContent = String(value);
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number) {
        this.setText(this._price, `${value} синапсов`);
    }

}