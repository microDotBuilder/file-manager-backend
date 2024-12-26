import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, "../../temp");

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export const saveFileToTemp = async (file) => {
  try {
    const fileExtension = path.extname(file.name);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(TEMP_DIR, uniqueFileName);

    // Move file to temp directory
    await file.mv(filePath);

    return {
      originalName: file.name,
      tempPath: filePath,
      fileName: uniqueFileName,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (error) {
    throw new Error(`Error saving file to temp: ${error.message}`);
  }
};

export const removeFileFromTemp = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error(`Error removing temp file: ${error.message}`);
  }
};
