import { ApiResponse } from "../utils/ApiResponse.js";
import { updateTree } from "../utils/update.js";

export const setup = async (req, res) => {
  try {
    const file = req.body.file;

    if (!file) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Error", "No file structure provided"));
    }

    // Using upsert to either create new or update existing record
    await updateTree(file);
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
