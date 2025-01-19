import prisma from "../db/init.js";

export const updateTree = async (tree) => {
  const treeJson = JSON.stringify(tree);
  await prisma.tree.upsert({
    where: { name: "setup-tree" },
    create: { name: "setup-tree", content: treeJson },
    update: { content: treeJson },
  });
};

export const updateDiff = async (tree) => {
  const treeJson = JSON.stringify(tree);
  await prisma.diff.upsert({
    where: { name: "diff-tree" },
    create: { name: "diff-tree", content: treeJson },
    update: { content: treeJson },
  });
};
