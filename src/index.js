import { app } from "./app.js";

/**
 * Starting from Node. js v14 top-level await is available and it is only available in ES modules.
 * This means you can not use it with common js modules or NOde version < 14.
 */

app.listen(process.env.PORT || 8080, () =>
  console.log("Server is running on port: " + process.env.PORT)
);
