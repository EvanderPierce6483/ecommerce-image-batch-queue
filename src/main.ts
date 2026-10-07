import { InfraiClient } from "./infrai_client.js";
import { orderSchema, readBatchStatus, submitOrderImages } from "./order_batch.js";
import { paceBatch } from "./queue_worker.js";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example");
const client = new InfraiClient(key);
const orders = [orderSchema.parse({ orderId: "order-1042", image: "upload-abc", customerEmail: "buyer@example.com" })];
const batch = await submitOrderImages(client, orders);
const paced = await paceBatch(client, batch.id);
const status = await readBatchStatus(client, batch.id);
console.log({ batchId: batch.id, status: status.status, queued: paced.messages.length, receipt: "order update scheduled" });
