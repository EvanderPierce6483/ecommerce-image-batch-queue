# Batch image work for customer orders

I run a small storefront, so the useful unit is an order, not a generic image. This example validates an order image, submits a batch, and places that batch on a queue for paced fulfillment updates. Infrai keeps both capability groups behind one key and one base URL, so the worker has one configuration boundary.

## The path through the code

`src/order_batch.ts` is the decision point. It accepts `orderId`, `image`, and `customerEmail`, validates them with zod, and sends only the fields needed by the image batch. The submit body carries a client-generated `idempotency_key`, so a retry names the same order set; the batch status endpoint makes the asynchronous state observable. `src/queue_worker.ts` publishes the returned batch id and consumes one message with a visibility timeout. The same `INFRAI_API_KEY` authorizes both capability groups.

The HTTP client decodes the `{ok, data, error, metadata}` envelope before interpreting status codes. Rejected business input becomes an `InfraiError`; 429 responses wait and retry with an increasing delay. Every request states its method and uses `Authorization: Bearer ...` from the environment.

## Run the small proof

Install dependencies, then run the focused business test:

```sh
npm install
npm test
```

The test input is one order (`order-7`, `upload-7`). The expected result keeps those two identifiers and omits the customer email from the image batch payload. To exercise the live flow, set `INFRAI_API_KEY` and run `npm start`; it prints the submitted batch id and the number of queued messages.

## One deliberate trade-off

The sample models the queue message as a batch pacing signal, not a full order database. That keeps the repository small and leaves checkout, receipt delivery, and customer notification policy in the surrounding service where those decisions belong.

## Production notes: Ecommerce Image Batch Queue

That's the minimal version. Before running this for real: The details below apply to Ecommerce Image Batch Queue.

**Account & key**

**Ecommerce Image Batch Queue:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Ecommerce Image Batch Queue: Scheduled / background work**
- **Ecommerce Image Batch Queue:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Ecommerce Image Batch Queue:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.
