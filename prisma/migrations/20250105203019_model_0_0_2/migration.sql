/*
  Warnings:

  - The primary key for the `File` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `File` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Folder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Folder` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `parentId` column on the `Folder` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name,folderId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,parentId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `folderId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_folderId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_parentId_fkey";

-- AlterTable
ALTER TABLE "File" DROP CONSTRAINT "File_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "folderId",
ADD COLUMN     "folderId" INTEGER NOT NULL,
ALTER COLUMN "contentHash" DROP NOT NULL,
ALTER COLUMN "size" DROP NOT NULL,
ALTER COLUMN "lastModified" DROP NOT NULL,
ADD CONSTRAINT "File_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_pkey",
ADD COLUMN     "contentHash" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "parentId",
ADD COLUMN     "parentId" INTEGER,
ADD CONSTRAINT "Folder_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "File_name_folderId_key" ON "File"("name", "folderId");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_name_parentId_key" ON "Folder"("name", "parentId");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
