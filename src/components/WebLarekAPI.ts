import { ApiListResponse, Api } from "./base/api";
import { IOrder, IOrderTotal, IOrderResult, ICard } from "../types";

export interface IWebLarekAPI {
  getCardItems: () => Promise<ICard[]>;
  orderLots: (order: IOrderTotal) => Promise<IOrderResult>;
}

export class WebLarekAPI extends Api implements IWebLarekAPI {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    getCardItems(): Promise<ICard[]> {
        return this.get('/product').then((data: ApiListResponse<ICard>) =>
            data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image
            }))
        );
    }

    orderLots(order: IOrder): Promise<IOrderResult> {
        return this.post('/order', order).then(
            (data: IOrderResult) => data
        );
    }
}