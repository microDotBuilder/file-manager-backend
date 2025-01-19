// /**
//  * @typedef {Object} TreeNode
//  * @property {"file"|"folder"} type         - File or folder
//  * @property {string} name                  - Name of file or folder
//  * @property {string} contentHash           - Hash of the contents (or combined hash for folder)
//  * @property {TreeNode[]} [children]        - Present if type === "folder"
//  * // ... add more metadata if needed (e.g. size, lastModified, etc.)
//  */

// /**
//  * @typedef {Object} ChangeRecord
//  * @property {"added"|"removed"|"modified"|"unchanged"} changeType
//  *           Type of change
//  * @property {string} path
//  *           Path in the tree, e.g. "/src/components/Button.tsx"
//  * @property {TreeNode} [oldNode]
//  *           Old node if relevant (removed or modified)
//  * @property {TreeNode} [newNode]
//  *           New node if relevant (added or modified)
//  */

// /**
//  * Compare two Merkle tree nodes (oldNode vs newNode) and generate a list of changes.
//  * This is a depth-first recursive algorithm:
//  *   1) If one node is missing => "added" or "removed"
//  *   2) If both present but contentHash differs => dive deeper or mark "modified"
//  *   3) If contentHash is same => "unchanged" (no further checks)
//  *
//  * @param {TreeNode|null} oldNode
//  * @param {TreeNode|null} newNode
//  * @param {string} path
//  *          The path in the virtual file system (e.g. "/src")
//  * @returns {ChangeRecord[]}
//  */
function diffTrees(oldNode, newNode, path = "") {
  const changes = [];

  // CASE 1: oldNode missing, newNode present => ADDED
  if (!oldNode && newNode) {
    changes.push({
      changeType: "added",
      path,
      newNode,
    });
    return changes;
  }

  // CASE 2: oldNode present, newNode missing => REMOVED
  if (oldNode && !newNode) {
    changes.push({
      changeType: "removed",
      path,
      oldNode,
    });
    return changes;
  }

  // Now both oldNode and newNode exist
  // Compare their contentHash
  if (oldNode.contentHash === newNode.contentHash) {
    // contentHash is the same => entire subtree is unchanged
    changes.push({
      changeType: "unchanged",
      path,
      oldNode,
      newNode,
    });
    return changes;
  } else {
    // contentHash differs
    // If both are files => MODIFIED
    if (oldNode.type === "file" && newNode.type === "file") {
      changes.push({
        changeType: "modified",
        path,
        oldNode,
        newNode,
      });
      return changes;
    }

    // If both are folders => compare children
    if (oldNode.type === "folder" && newNode.type === "folder") {
      // We'll do a more fine-grained diff at the child level
      const oldChildren = oldNode.children || [];
      const newChildren = newNode.children || [];

      // Build a dictionary of children by name for quick lookup
      const oldDict = {};
      for (const child of oldChildren) {
        oldDict[child.name] = child;
      }

      const newDict = {};
      for (const child of newChildren) {
        newDict[child.name] = child;
      }

      // Compare children that exist in oldDict
      for (const childName of Object.keys(oldDict)) {
        const oldChild = oldDict[childName];
        const newChild = newDict[childName] || null;
        const childPath = path ? path + "/" + childName : childName;

        changes.push(...diffTrees(oldChild, newChild, childPath));
      }

      // Any new children not in oldDict
      for (const childName of Object.keys(newDict)) {
        if (!oldDict[childName]) {
          const childPath = path ? path + "/" + childName : childName;
          changes.push(...diffTrees(null, newDict[childName], childPath));
        }
      }

      return changes;
    }

    // If one is a file and the other is a folder => big structural difference
    // We'll call oldNode "removed" and newNode "added"
    changes.push({
      changeType: "removed",
      path,
      oldNode,
    });
    changes.push({
      changeType: "added",
      path,
      newNode,
    });
    return changes;
  }
}

export { diffTrees };
