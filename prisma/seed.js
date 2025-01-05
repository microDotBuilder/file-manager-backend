import prisma from "../src/db/init.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createFolderStructure(node, parentId = null) {
  if (node.type === "folder") {
    // Create folder
    const folder = await prisma.folder.create({
      data: {
        name: node.name,
        parentId: parentId,
      },
    });

    // Recursively create children if they exist
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        await createFolderStructure(child, folder.id);
      }
    }
  } else if (node.type === "file") {
    // Create file
    await prisma.file.create({
      data: {
        name: node.name,
        folderId: parentId,
        contentHash: node.contentHash,
        size: node.size || 0,
        lastModified: node.lastModified
          ? new Date(node.lastModified)
          : new Date(),
      },
    });
  }
}

async function main() {
  try {
    // Clear existing data
    console.log("Cleaning existing database...");
    await prisma.file.deleteMany({});
    await prisma.folder.deleteMany({});

    // Read the setup.json file
    const setupPath = path.join(__dirname, "../setup.json");
    const setupData = JSON.parse(fs.readFileSync(setupPath, "utf8"));

    console.log("Starting to seed database...");
    await createFolderStructure(setupData);
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
