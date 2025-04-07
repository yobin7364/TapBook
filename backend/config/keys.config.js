// keys.config.js

import { keysProd } from "./keys_prod.config.js";
import { keysDev } from "./keys_dev.config.js";

let keys;

if (process.env.NODE_ENV === "production") {
  keys = keysProd;
} else {
  keys = keysDev;
}

export default keys;
