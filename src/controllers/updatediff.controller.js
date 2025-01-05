import { storeOutput } from "../utils/store-output.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { updateFolderStructure } from "../db/utils.js";

const updatediff = async (req, res) => {
  try {
    const diff = req.body.diff;

    if (!diff) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Error", "No diff data provided"));
    }

    // Update the database with the diff
    await updateFolderStructure(diff);

    // Store the diff data for logging/debugging
    await storeOutput(diff, "updated-tree.json", "Updated diff stored");

    return res
      .status(200)
      .json(new ApiResponse(200, "Success", "Diff updated successfully"));
  } catch (error) {
    console.error("Error in updatediff:", error);
    return res.status(500).json(new ApiResponse(500, "Error", error.message));
  }
};

export { updatediff };
