// интерфейс карточки товара
export interface ICard {
  id: string;
  category: string;
  title: string;
  image: string;
  description: string;
  price: number | null;
}

// интерфейс корзины
export interface IOrder extends IForm {
  items: string[];
  total: string | number;
}

// Базовый интерфейс для всех полей формы
export interface IForm {
  payment?: string;
  address?: string;
  email?: string;
  phone?: string;
}

// Интерфейс для данных перед отправкой
export interface IOrderTotal {
  items: string[];
  total: number;
  payment: string;
  address: string;
  email: string;
  phone: string;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
  id: string;
  total: number;
}