import { storeOutput } from "../utils/store-output.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createOrUpdateStructure } from "../utils/setup/misc.js";

export const setup = async (req, res) => {
  try {
    const file = req.body.file;

    if (!file) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Error", "No file structure provided"));
    }

    // // Store the initial structure for reference
    // await storeOutput(file, "setup.json", {
    //   consoleMessage: "Initial structure stored",
    // });

    // Create or update the structure in database
    // i do not want to await this i want to run it in the background

    await createOrUpdateStructure(file);
    console.log("createOrUpdateStructure done");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Success",
          "Folder structure created/updated successfully"
        )
      );
  } catch (error) {
    console.error("Error in setup:", error);
    return res.status(500).json(new ApiResponse(500, "Error", error.message));
  }
};
