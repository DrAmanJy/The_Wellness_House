import { pool } from "../server/db";
import { razorpay } from "../server/modules/commerce/provider";
import { processCapture } from "../server/modules/commerce/service";
// Read provider evidence first. Never delete audit records or infer capture from local status.
const summary = {
  checked: 0,
  capturedPayments: 0,
  pending: 0,
  errors: 0,
  withoutProviderOrder: 0,
};
try {
  const rows = (
    await pool.query(
      "SELECT o.id,p.provider_order_id FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.confirmed_at IS NULL ORDER BY o.created_at LIMIT 100",
    )
  ).rows;
  for (const row of rows) {
    if (!row.provider_order_id) {
      summary.withoutProviderOrder++;
      continue;
    }
    try {
      const result = await razorpay(
        "orders/" + encodeURIComponent(row.provider_order_id) + "/payments",
      );
      summary.checked++;
      const captures = (result.items || []).filter(
        (p: any) => p.status === "captured",
      );
      if (!captures.length) summary.pending++;
      for (const payment of captures) {
        await processCapture(payment.id);
        summary.capturedPayments++;
      }
    } catch {
      summary.errors++;
    }
  }
  console.log(JSON.stringify(summary));
  if (summary.errors) process.exitCode = 1;
} finally {
  await pool.end();
}
