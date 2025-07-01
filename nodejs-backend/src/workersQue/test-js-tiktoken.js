// test-js-tiktoken.js
import { getEncoding } from "js-tiktoken";

try {
  const encoding = getEncoding("cl100k_base");
  console.log("Encoding initialized successfully");
  const tokens = encoding.encode("Hello, world!");
  console.log("Tokens:", tokens.length);
} catch (err) {
  console.error("Error:", err);
}
