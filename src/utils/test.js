import { exampleUsage } from "./merkle-tree/tree-from-diff.js";

function printTree(tree, indent = 0) {
  // If `tree` is an array, handle each element
  if (Array.isArray(tree)) {
    tree.forEach((item) => {
      printTree(item, indent);
    });
    return;
  }

  // If `tree` is an object (folder/file node), iterate over its keys
  if (typeof tree === "object" && tree !== null) {
    // Indent to visualize hierarchy
    const space = " ".repeat(indent);

    Object.entries(tree).forEach(([key, value]) => {
      if (key === "children" && Array.isArray(value)) {
        // If it's "children", we recurse on that array
        console.log(`${space}${key}: [`);
        printTree(value, indent + 2);
        console.log(`${space}]`);
      } else {
        // Just print key/value
        console.log(`${space}${key}: ${value}`);
      }
    });
  } else {
    // In case `tree` is a primitive (string/number/etc.), just log it
    console.log(" ".repeat(indent) + tree);
  }
}

const tree = JSON.parse(exampleUsage());

printTree(tree);
