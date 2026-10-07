import { z } from "zod";
import { InfraiClient } from "./infrai_client.js";

export const orderSchema = z.object({
  orderId: z.string().min(1),
  image: z.string().min(1),
  customerEmail: z.string().email()
});
export type OrderImage = z.infer<typeof orderSchema>;

export function buildBatch(orders: OrderImage[]) {
  return orders.map((order) => ({ orderId: order.orderId, image: order.image }));
}

export async function submitOrderImages(client: InfraiClient, orders: OrderImage[]) {
  const parsed = orders.map((order) => orderSchema.parse(order));
  return client.request<{ id: string }>("/image/batch/submit", "POST", {
    items: buildBatch(parsed),
    idempotency_key: `orders-${parsed.map((item) => item.orderId).join("-")}`
  });
}

export async function readBatchStatus(client: InfraiClient, batchId: string) {
  return client.request<{ status: string }>(`/image/batch/status/${batchId}`, "GET");
}
