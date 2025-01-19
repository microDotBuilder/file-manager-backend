import prisma from "../src/db/init.js";

export const cleanup = async () => {
  try {
    console.log("Cleaning up database...");
    await prisma.tree.deleteMany();
    console.log("Database cleaned up successfully");
  } catch (error) {
    console.error("Error cleaning up database:", error);
  } finally {
    await prisma.$disconnect();
  }
};

cleanup().catch((e) => {
  console.error(e);
  process.exit(1);
});
