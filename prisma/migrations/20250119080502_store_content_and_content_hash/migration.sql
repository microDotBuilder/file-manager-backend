/*
  Warnings:

  - Added the required column `contentHash` to the `Tree` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tree" ADD COLUMN     "contentHash" TEXT NOT NULL;
