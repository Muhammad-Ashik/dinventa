export type CallableOrder = {
  id: string;
  phone: string;
};

export interface CallService {
  // Places (or simulates) the outbound confirmation call. The actual order
  // summary is read out by the /api/twilio/voice/[orderId] webhook, which
  // fetches the order fresh — this only needs enough to dial.
  initiateConfirmationCall(order: CallableOrder): Promise<void>;
}
