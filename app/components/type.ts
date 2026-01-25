// types.ts
export interface OrderItemDetail {
  name: string;
  qty: number;
}

export interface Order {
  _id: string;
  customerName: string;
  itemsCount: number;
  status: "pending" | "process" | "finish";
  items?: OrderItemDetail[];
}
