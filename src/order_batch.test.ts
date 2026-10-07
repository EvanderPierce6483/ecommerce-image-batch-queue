import assert from "node:assert/strict";
import { buildBatch } from "./order_batch.js";

const result = buildBatch([{ orderId: "order-7", image: "upload-7", customerEmail: "buyer@example.com" }]);
assert.deepEqual(result, [{ orderId: "order-7", image: "upload-7" }]);
console.log("order batch keeps the business identity while dropping delivery-only fields");
