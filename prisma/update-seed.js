import prisma from "../src/db/init.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findOrCreateParentFolder(pathSegments) {
  let currentParentId = null;

  for (const segment of pathSegments) {
    const folder = await prisma.folder.findFirst({
      where: {
        name: segment,
        parentId: currentParentId,
      },
    });

    if (folder) {
      currentParentId = folder.id;
    } else {
      const newFolder = await prisma.folder.create({
        data: {
          name: segment,
          parentId: currentParentId,
        },
      });
      currentParentId = newFolder.id;
    }
  }

  return currentParentId;
}

async function processChange(change) {
  const { changeType, path: changePath, oldNode, newNode } = change;

  // Split path into segments and remove 'root'
  const pathSegments = changePath
    .split("/")
    .filter((segment) => segment && segment !== "root");
  const name = pathSegments.pop(); // Last segment is the item name

  try {
    switch (changeType) {
      case "added": {
        const parentId = await findOrCreateParentFolder(pathSegments);

        if (newNode.type === "folder") {
          await prisma.folder.create({
            data: {
              name: newNode.name,
              parentId: parentId,
            },
          });

          // Recursively create children if they exist
          if (newNode.children) {
            for (const child of newNode.children) {
              await processChange({
                changeType: "added",
                path: `${changePath}/${child.name}`,
                newNode: child,
              });
            }
          }
        } else {
          await prisma.file.create({
            data: {
              name: newNode.name,
              folderId: parentId,
              contentHash: newNode.contentHash,
              size: newNode.size || 0,
              lastModified: new Date(newNode.lastModified),
            },
          });
        }
        break;
      }

      case "removed": {
        if (oldNode.type === "folder") {
          const folder = await prisma.folder.findFirst({
            where: {
              name: oldNode.name,
              parent: {
                name: pathSegments[pathSegments.length - 1],
              },
            },
          });

          if (folder) {
            await prisma.folder.delete({
              where: { id: folder.id },
            });
          }
        } else {
          const file = await prisma.file.findFirst({
            where: {
              name: oldNode.name,
              folder: {
                name: pathSegments[pathSegments.length - 1],
              },
            },
          });

          if (file) {
            await prisma.file.delete({
              where: { id: file.id },
            });
          }
        }
        break;
      }

      case "modified": {
        if (newNode.type === "file") {
          const file = await prisma.file.findFirst({
            where: {
              name: newNode.name,
              folder: {
                name: pathSegments[pathSegments.length - 1],
              },
            },
          });

          if (file) {
            await prisma.file.update({
              where: { id: file.id },
              data: {
                contentHash: newNode.contentHash,
                size: newNode.size,
                lastModified: new Date(newNode.lastModified),
              },
            });
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error(`Error processing change for path ${changePath}:`, error);
    throw error;
  }
}

async function main() {
  try {
    // Read the updated-tree.json file
    const diffPath = path.join(__dirname, "../updated-tree.json");
    const diffData = JSON.parse(fs.readFileSync(diffPath, "utf8"));

    console.log("Starting to update database...");
    console.log(`Found ${diffData.changes.length} changes to apply`);
    console.log("Summary:", diffData.summary);

    // Process each change
    for (const change of diffData.changes) {
      await processChange(change);
    }

    console.log("Database update completed successfully");
  } catch (error) {
    console.error("Error updating database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
