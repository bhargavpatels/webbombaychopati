export interface OrderMeta {
  pid: string;
  pMetaId: string;
  quantity: number;
  amount: number;
}

export interface OrderRequest {
  userId: string;
  addressId: string;
  totalAmount: number;
  orderMeta: OrderMeta[];
}

export interface OrderResponse {
  orderId: string;
  // Add other response fields as needed
}