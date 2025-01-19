/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Tree` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tree_name_key" ON "Tree"("name");
