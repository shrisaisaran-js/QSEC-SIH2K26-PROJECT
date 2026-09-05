import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { app } = require("../backend/src/server.js");
const { connectDatabase } = require("../backend/src/config/database.js");

export default async function handler(req, res) {
  await connectDatabase();
  return app(req, res);
}