// import { storeOutput } from "../utils/store-output.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { diffTrees } from "../utils/diff-generator/diff-generator.js";
import { updateTree } from "../utils/update.js";
import { storeOutput } from "../utils/store-output.js";

const updatediff = async (req, res) => {
  try {
    const new_json = req.body.file;

    if (!new_json) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Error", "No diff data provided"));
    }

    try {
      const oldJson = await prisma.tree.findFirst({
        where: { name: "setup-tree" },
      });
    } catch (e) {
      return res
        .status(500)
        .json(
          new ApiResponse(500, "Error", "cannot find the file in the database")
        );
    }

    // generate the diff
    const diff = await diffTrees(oldJson, new_json);

    // only for testing genera
    await storeOutput(diff, {
      consoleMessage: "Diff generated",
      append: false,
      destPath: "./output/diff.txt",
    });

    await storeOutput(new_json, {
      consoleMessage: "New json sent",
      append: false,
      destPath: "./output/new_json.txt",
    });

    await storeOutput(oldJson, {
      consoleMessage: "Old json retrieved",
      append: false,
      destPath: "./output/old_json.txt",
    });

    await updateTree(new_json);

    return res.status(200).json(new ApiResponse(200, "Success", diff));
  } catch (error) {
    console.error("Error in updatediff:", error);
    return res.status(500).json(new ApiResponse(500, "Error", error.message));
  }
};

export { updatediff };
