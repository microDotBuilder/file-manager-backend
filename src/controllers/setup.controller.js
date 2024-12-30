import { storeOutput } from "../utils/store-output.js";

export const setup = async (req, res) => {
  // get the file in form data
  const file = req.body.file;
  await storeOutput(file, "setup.json", {
    consoleMessage: "Setup successful",
  });
  res.status(200).json({ message: `Setup successful for ${file}` });
};
