export type ParcelOrder = {
  id: string;
  recipientName: string;
  phone: string;
  shippingAddress: string;
  totalAmount: number;
};

export interface CourierService {
  // Creates (or simulates) the delivery parcel and persists the result
  // (courierConsignmentId/courierTrackingCode on success, courierNote on
  // failure) directly on the Order row — callers don't need to handle that.
  createParcel(order: ParcelOrder): Promise<void>;
}
