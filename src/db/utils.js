import prisma from "./init.js";

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

export async function updateFolderStructure(diff) {
  const { changes } = diff;

  for (const change of changes) {
    const { changeType, path, oldNode, newNode } = change;

    switch (changeType) {
      case "added":
        if (newNode.type === "folder") {
          await prisma.folder.create({
            data: {
              name: newNode.name,
              // Handle parent relationship
            },
          });
        } else {
          await prisma.file.create({
            data: {
              name: newNode.name,
              contentHash: newNode.contentHash,
              size: newNode.size || 0,
              lastModified: new Date(newNode.lastModified),
              // Handle folder relationship
            },
          });
        }
        break;

      case "removed":
        if (oldNode.type === "folder") {
          await prisma.folder.delete({
            where: {
              // Find the correct folder to delete
            },
          });
        } else {
          await prisma.file.delete({
            where: {
              // Find the correct file to delete
            },
          });
        }
        break;

      case "modified":
        if (newNode.type === "file") {
          await prisma.file.update({
            where: {
              // Find the correct file to update
            },
            data: {
              contentHash: newNode.contentHash,
              size: newNode.size,
              lastModified: new Date(newNode.lastModified),
            },
          });
        }
        break;
    }
  }
}
