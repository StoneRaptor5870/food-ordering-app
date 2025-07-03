export class CreateOrderDto {
  restaurantId: number;
  items: Array<{
    menuItemId: number;
    quantity: number;
  }>;
  deliveryAddress: string;
}