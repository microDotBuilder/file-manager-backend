import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const readingBlob = asyncHandler(async (req, res) => {
  try {
    const blob = req.body.blob;
    console.log("blob:", blob);
    return res
      .status(200)
      .json(new ApiResponse(200, "OK", "blob read successfully"));
  } catch (error) {
    console.error("error in reading blob");
    return res
      .status(500)
      .json(new ApiResponse(500, "Error", "error in reading blob"));
  }
});

export { readingBlob };
