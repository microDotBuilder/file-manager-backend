/**
 * @typedef {Object} TreeNode
 * @property {"file" | "folder"} type
 * @property {string} name
 * @property {string} contentHash
 * @property {TreeNode[]} [children]  // if folder
 * @property {number} [size]          // if file
 * @property {string} [lastModified]  // if file
 */

/**
 * A single record in the changes array.
 * @typedef {Object} ChangeRecord
 * @property {"added" | "removed" | "modified" | "unchanged"} changeType
 * @property {string} path
 * @property {TreeNode} [oldNode]
 * @property {TreeNode} [newNode]
 */

/**
 * The full diff object shape:
 * {
 *   timestamp: string,
 *   summary: {
 *     total: number,
 *     added: number,
 *     removed: number,
 *     modified: number,
 *     unchanged: number
 *   },
 *   changes: ChangeRecord[]
 * }
 */

/**
 * Applies a diff (array of changes) to the oldTree in place.
 * Returns the updated tree.
 *
 * @param {TreeNode} oldTree - The existing tree (the "baseline")
 * @param {ChangeRecord[]} diffArray - Array of changes from your new diff.changes
 */
function applyDiff(oldTree, diffArray) {
  for (const change of diffArray) {
    applyChange(oldTree, change);
  }
  return oldTree; // updated in place
}

/**
 * Applies a single change record to the existing tree.
 *
 * @param {TreeNode} rootTree
 * @param {ChangeRecord} change
 */
function applyChange(rootTree, change) {
  const { changeType, path, newNode, oldNode } = change;

  // Split path on '/' -> e.g. "root/nextjs-template/src/app" => ["root","nextjs-template","src","app"]
  const segments = path.split("/").filter(Boolean);

  switch (changeType) {
    case "unchanged":
      // No action needed.
      break;

    case "added":
      insertNode(rootTree, segments, newNode);
      break;

    case "removed":
      removeNode(rootTree, segments);
      break;

    case "modified":
      updateNode(rootTree, segments, newNode);
      break;
  }
}

/**
 * Insert `newNode` into the tree at the location described by `segments`.
 *
 * e.g. segments = ["root","nextjs-template","src","app","comp"]
 */
function insertNode(current, segments, newNode) {
  if (!segments.length) return;

  const [first, ...rest] = segments;

  if (!current.children) {
    current.children = [];
  }

  // If we are at the last segment, we insert `newNode` at this level.
  if (rest.length === 0) {
    // Already have a child with the same name?
    const existingIndex = current.children.findIndex((c) => c.name === first);
    if (existingIndex >= 0) {
      // Possibly replace or ignore. We'll skip for now.
      // current.children[existingIndex] = newNode; // (If you want to replace.)
    } else {
      current.children.push(newNode);
    }
    return;
  }

  // Not at the last segment; we need to descend further.
  let child = current.children.find((c) => c.name === first);

  // If no such child folder, create one (assuming a folder).
  if (!child) {
    child = {
      type: "folder",
      name: first,
      contentHash: "",
      children: [],
    };
    current.children.push(child);
  }

  // Recurse down
  insertNode(child, rest, newNode);
}

/**
 * Remove the node whose path = segments.
 * e.g. segments = ["root","nextjs-template","src","app","page.tsx"]
 */
function removeNode(current, segments) {
  if (!segments.length || !current.children) return;

  const [first, ...rest] = segments;
  const idx = current.children.findIndex((c) => c.name === first);
  if (idx === -1) return; // not found => nothing to remove

  if (rest.length === 0) {
    // Remove this child
    current.children.splice(idx, 1);
  } else {
    // Recurse deeper if it's a folder
    const child = current.children[idx];
    if (child.type === "folder") {
      removeNode(child, rest);
    }
  }
}

/**
 * Update the node at `segments` with new metadata from `newNode`.
 *
 * e.g. segments = ["root","nextjs-template","package.json"]
 */
function updateNode(current, segments, newNode) {
  if (!segments.length || !current.children) return;

  const [first, ...rest] = segments;
  const idx = current.children.findIndex((c) => c.name === first);
  if (idx === -1) return; // not found => can't update

  const child = current.children[idx];

  if (rest.length === 0) {
    // Overwrite child's fields with newNode's fields
    child.type = newNode.type;
    child.contentHash = newNode.contentHash;
    if (newNode.size !== undefined) child.size = newNode.size;
    if (newNode.lastModified !== undefined) {
      child.lastModified = newNode.lastModified;
    }
    if (newNode.children && child.type === "folder") {
      child.children = newNode.children;
    }
    return;
  }

  // Otherwise, descend further if it's a folder
  if (child.type === "folder") {
    updateNode(child, rest, newNode);
  }
}

/**
 * Example usage:
 * - Suppose we have a `diffObj` that matches the new structure you posted
 * - We have an oldTree object. We'll apply diffObj.changes to oldTree
 */
function exampleUsage() {
  // 1) Sample oldTree (a minimal example)
  const oldTree = {
    type: "folder",
    name: "root",
    contentHash: "OLD_ROOT_HASH",
    children: [
      {
        type: "folder",
        name: "nextjs-template",
        contentHash: "OLD_HASH_TEMPLATE",
        children: [
          {
            type: "file",
            name: "package.json",
            contentHash: "someOldHash",
            size: 100,
            lastModified: "2024-01-01T00:00:00.000Z",
          },
          // ... etc.
        ],
      },
    ],
  };

  // 2) The diffObj with your new structure (timestamp, summary, changes array)
  //    For brevity, we'll show a short partial example. In reality, you'd have the full object.
  const diffObj = {
    timestamp: "2024-12-29T22:36:38.590Z",
    summary: {
      total: 26,
      added: 1,
      removed: 0,
      modified: 0,
      unchanged: 25,
    },
    changes: [
      {
        changeType: "unchanged",
        path: "root/nextjs-template/package.json",
        oldNode: {
          type: "file",
          name: "package.json",
          contentHash: "5a2116be54a18afad9829f19c1d21475",
          size: 1111,
          lastModified: "2024-12-29T20:47:58.077Z",
        },
        newNode: {
          type: "file",
          name: "package.json",
          contentHash: "5a2116be54a18afad9829f19c1d21475",
          size: 1111,
          lastModified: "2024-12-29T20:47:58.077Z",
        },
      },
      {
        changeType: "added",
        path: "root/nextjs-template/src/app/comp",
        newNode: {
          type: "folder",
          name: "comp",
          contentHash: "87c78fe235350cd4962a3dc8b295bee7",
          children: [],
        },
      },
    ],
  };

  // 3) Apply the changes array to our oldTree
  const updatedTree = applyDiff(oldTree, diffObj.changes);

  console.log("Updated Tree:", JSON.stringify(updatedTree, null, 2));
}

// Uncomment to run the example:
// exampleUsage();

// Export the main functions if you want to import them elsewhere
export { applyDiff };
