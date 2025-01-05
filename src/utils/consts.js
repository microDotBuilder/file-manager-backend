import "../config/dot.js";

export const FOLDER_NAME =
  process.env.NODE_ENV === "development"
    ? process.env.TEST_FOLDER_NAME
    : process.env.FOLDER_NAME;
