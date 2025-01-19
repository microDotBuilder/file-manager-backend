import prisma from "../db/init.js";

/**
 * Recursively create or update a node from a JSON structure.
 *
 * - If node.type === "folder", we call handleFolder.
 * - Otherwise, we call handleFile.
 *
 * @param {object} node      - The JSON node (folder or file) with fields like name, contentHash, children, size, etc.
 * @param {number|null} parentId - The ID of the folder that should contain this node. null if this is a root folder.
 * @returns {Promise<object>}    - The Prisma folder or file record that got created/updated.
 */
export async function createOrUpdateStructure(node, parentId = null) {
  try {
    if (node.type === "folder") {
      return await handleFolder(node, parentId);
    } else {
      return await handleFile(node, parentId);
    }
  } catch (error) {
    console.error(`Error processing node ${node.name}:`, error);
    throw error;
  }
}

/**
 * Handle a folder node: upsert the folder, then process its children.
 */
export async function handleFolder(node, parentId) {
  // "Upsert" is possible if your schema has a unique constraint on [name, parentId].
  // If you prefer the find-or-create approach, see below for an alternative snippet.
  const folder = await prisma.folder.upsert({
    where: {
      // For upsert, we need a composite unique field:
      // If you used @@unique([name, parentId]), you can do:
      name_parentId: {
        name: node.name,
        parentId: parentId,
      },
    },
    create: {
      name: node.name,
      parentId: parentId,
    },
    update: {
      // If you want to store something else upon update, e.g. contentHash for a folder
      contentHash: node.contentHash || undefined,
    },
  });

  // If the folder node has children, process them
  if (node.children?.length > 0) {
    await Promise.all(
      node.children.map((child) => createOrUpdateStructure(child, folder.id))
    );
  }

  return folder;
}

/**
 * Handle a file node: upsert the file (create if none, or update if it already exists).
 */
export async function handleFile(node, parentId) {
  const fileData = {
    name: node.name,
    contentHash: node.contentHash || null,
    size: node.size || 0,
    lastModified: node.lastModified ? new Date(node.lastModified) : new Date(),
    folderId: parentId,
  };

  // Optional: only update if something actually changed.
  const existing = await prisma.file.findFirst({
    where: { name: node.name, folderId: parentId },
  });
  if (existing) {
    const isChanged =
      existing.contentHash !== fileData.contentHash ||
      existing.size !== fileData.size;
    if (!isChanged) {
      return existing; // skip updating
    }
  }

  // Use upsert to simplify create vs. update
  return await prisma.file.upsert({
    where: {
      // must match the unique constraint in the schema
      name_folderId: {
        name: node.name,
        folderId: parentId,
      },
    },
    create: fileData,
    update: {
      // if we want to update all fields
      contentHash: fileData.contentHash,
      size: fileData.size,
      lastModified: fileData.lastModified,
    },
  });
}

/**
 * Recursively builds a JSON structure from a folder and its contents
 * @param {object} folder - The Prisma folder record with included files and children
 * @returns {object} - A JSON object representing the folder structure
 */
export async function buildJsonFromFolder(folder) {
  const structure = {
    type: "folder",
    name: folder.name,
    contentHash: folder.contentHash || undefined,
    children: [],
  };

  // Add files
  if (folder.files?.length > 0) {
    for (const file of folder.files) {
      structure.children.push({
        type: "file",
        name: file.name,
        contentHash: file.contentHash || null,
        size: file.size || 0,
        lastModified:
          file.lastModified?.toISOString() || new Date().toISOString(),
      });
    }
  }

  // Recursively add subfolders
  if (folder.children?.length > 0) {
    for (const childFolder of folder.children) {
      structure.children.push(await buildJsonFromFolder(childFolder));
    }
  }

  return structure;
}

/**
 * Gets the complete folder structure from the database and returns it as JSON
 * @returns {Promise<object>} The complete folder structure as JSON
 */
export async function getFolderStructureAsJson() {
  try {
    // Get root folders (those with no parent)
    const rootFolders = await prisma.folder.findMany({
      where: { parentId: null },
      include: {
        files: true,
        children: {
          include: {
            files: true,
            children: {
              include: {
                files: true,
                children: true,
              },
            },
          },
        },
      },
    });

    // If there's only one root folder, return its structure
    if (rootFolders.length === 1) {
      return await buildJsonFromFolder(rootFolders[0]);
    }

    // If there are multiple root folders, create a virtual root
    return {
      type: "folder",
      name: "root",
      children: await Promise.all(
        rootFolders.map((folder) => buildJsonFromFolder(folder))
      ),
    };
  } catch (error) {
    console.error("Error getting folder structure:", error);
    throw error;
  }
}
