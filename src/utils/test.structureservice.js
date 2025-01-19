import { createOrUpdateStructure } from "./structureService.js";

// Suppose you have a JSON representing a folder tree:
const jsonTree = {
  type: "folder",
  name: "root",
  children: [
    {
      type: "folder",
      name: "src",
      children: [
        {
          type: "file",
          name: "index.js",
          contentHash: "abc123",
          size: 1234,
          lastModified: "2024-01-01T00:00:00Z",
        },
        {
          type: "folder",
          name: "components",
          children: [
            {
              type: "file",
              name: "Button.jsx",
              contentHash: "def456",
              size: 5678,
              lastModified: "2024-01-02T12:00:00Z",
            },
          ],
        },
      ],
    },
  ],
};

// Then somewhere in your code (like a route handler or script):
async function importTree() {
  try {
    await createOrUpdateStructure(jsonTree, null);
    console.log("Tree imported successfully!");
  } catch (err) {
    console.error("Error importing tree:", err);
  }
}

importTree();
