import prisma from "../../db/init.js";

export async function createOrUpdateStructure(node, parentId = null) {
  try {
    return node.type === "folder"
      ? await handleFolder(node, parentId)
      : await handleFile(node, parentId);
  } catch (error) {
    console.error(`Error processing node ${node.name}:`, error);
    throw error;
  }
}

export async function handleFolder(node, parentId) {
  const folder = await findOrCreateFolder(node, parentId);

  if (node.children?.length > 0) {
    await Promise.all(
      node.children.map((child) => createOrUpdateStructure(child, folder.id))
    );
  }

  return folder;
}

export async function findOrCreateFolder(node, parentId) {
  const existingFolder = await prisma.folder.findFirst({
    where: {
      name: node.name,
      parentId: parentId,
    },
  });

  if (existingFolder) return existingFolder;

  return await prisma.folder.create({
    data: {
      name: node.name,
      parentId: parentId,
    },
  });
}

export async function handleFile(node, parentId) {
  const fileData = {
    name: node.name,
    contentHash: node.contentHash,
    size: node.size || 0,
    lastModified: node.lastModified ? new Date(node.lastModified) : new Date(),
  };

  const existingFile = await prisma.file.findFirst({
    where: {
      name: node.name,
      folderId: parentId,
    },
  });

  if (existingFile) {
    return await prisma.file.update({
      where: { id: existingFile.id },
      data: fileData,
    });
  }

  return await prisma.file.create({
    data: {
      ...fileData,
      folderId: parentId,
    },
  });
}
