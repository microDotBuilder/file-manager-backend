import prisma from "./init.js";

async function findOrCreateParentFolder(pathSegments) {
  let currentParentId = null;

  // First ensure root folder exists
  const rootFolder = await prisma.folder.findFirst({
    where: {
      name: "test-folder",
      parentId: null,
    },
  });

  if (!rootFolder) {
    const newRoot = await prisma.folder.create({
      data: {
        name: "test-folder",
        parentId: null,
      },
    });
    currentParentId = newRoot.id;
  } else {
    currentParentId = rootFolder.id;
  }

  // Process remaining segments
  const remainingSegments = pathSegments.filter(
    (segment) => segment && segment !== "root"
  );

  for (const segment of remainingSegments) {
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

export async function updateFolderStructure(diff) {
  const { changes } = diff;
  // console.log(`Processing ${changes.length} changes...`);

  for (const change of changes) {
    const { changeType, path: changePath, oldNode, newNode } = change;

    // Split path into segments and remove empty strings and 'root'
    const pathSegments = changePath
      .split("/")
      .filter((segment) => segment && segment !== "root");
    const name = pathSegments.pop(); // Last segment is the item name

    try {
      switch (changeType) {
        case "added": {
          // console.log(`Adding: ${changePath}`);
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
                await processChildNode({
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
          // console.log(`Removing: ${changePath}`);
          if (oldNode.type === "folder") {
            const folder = await prisma.folder.findFirst({
              where: {
                name: oldNode.name,
                parent: {
                  name: pathSegments[pathSegments.length - 1] || null,
                },
              },
            });

            if (folder) {
              // Delete all files in the folder first
              await prisma.file.deleteMany({
                where: {
                  folderId: folder.id,
                },
              });

              // Then delete the folder
              await prisma.folder.delete({
                where: { id: folder.id },
              });
            }
          } else {
            const file = await prisma.file.findFirst({
              where: {
                name: oldNode.name,
                folder: {
                  name: pathSegments[pathSegments.length - 1] || null,
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
          // console.log(`Modifying: ${changePath}`);
          if (newNode.type === "file") {
            const parentId = await findOrCreateParentFolder(pathSegments);

            const file = await prisma.file.findFirst({
              where: {
                name: newNode.name,
                folderId: parentId,
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

        case "unchanged":
          // No action needed for unchanged items
          break;
      }
    } catch (error) {
      console.error(`Error processing change for path ${changePath}:`, error);
      throw error;
    }
  }

  // console.log("Database update completed successfully");
}

async function processChildNode(change) {
  await updateFolderStructure({ changes: [change] });
}

export async function getFolderStructure(folderId = null) {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      files: true,
      children: {
        include: {
          files: true,
          children: true,
        },
      },
    },
  });

  return folder;
}
