Object.assign(process.env, { NODE_ENV: "production" });
await import("../server/http");
export {};
