import { ApiResponse } from "../utils/ApiResponse.js";
import { getFolderStructureAsJson } from "../utils/structureService.js";
import { storeOutput } from "../utils/store-output.js";

export const getStructure = async (req, res) => {
  try {
    const structure = await prisma.tree.findMany();

    return res
      .status(200)
      .json(
        new ApiResponse(200, structure, "Structure retrieved successfully")
      );
  } catch (error) {
    console.error("Error in getStructure:", error);
    return res.status(500).json(new ApiResponse(500, null, error.message));
  }
};
