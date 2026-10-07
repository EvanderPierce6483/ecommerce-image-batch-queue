import { InfraiClient } from "./infrai_client.js";

export async function paceBatch(client: InfraiClient, batchId: string) {
  await client.request("/queue/publish", "POST", { queue: "order-image-batches", payload: { batchId } });
  return client.request<{ messages: Array<{ message_id: string; payload: { batchId: string } }> }>("/queue/consume", "POST", {
    queue: "order-image-batches",
    max_messages: 1,
    visibility_timeout: 30
  });
}
