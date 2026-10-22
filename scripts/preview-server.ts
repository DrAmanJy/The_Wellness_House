// Separate local production preview without disturbing an existing dev server.
Object.assign(process.env, {
  NODE_ENV: "production",
  PORT: "3100",
  APP_ORIGIN: "http://localhost:3100",
});
await import("../server/http");
export {};
