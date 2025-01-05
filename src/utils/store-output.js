import fs from "fs";
import path from "path";

/**
 * Stores output data to a file with configurable options
 * @param {*} output - The data to be written to the file
 * @param {string} fileName - The name of the file
 * @param {Object} options - Configuration options
 * @param {string} [options.consoleMessage=""] - Custom console message after operation
 * @param {boolean} [options.append=true] - Whether to append or overwrite the file
 * @param {string} [options.destPath=""] - Custom destination path for the file
 */
export function storeOutput(output, fileName, options = {}) {
  const { consoleMessage = "", append = false, destPath = "" } = options;

  // Construct the full file path
  const fullPath = destPath ? path.join(destPath, fileName) : fileName;

  // Create destination directory if it doesn't exist
  if (destPath) {
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Prepare the data to write
  const data = JSON.stringify(output, null, 2);

  // Choose between append and write based on options
  const writeOperation = append ? fs.appendFile : fs.writeFile;

  writeOperation(fullPath, data, (err) => {
    if (err) throw err;

    if (consoleMessage) {
      console.log(`${consoleMessage}`);
    } else {
      const operation = append ? "appended to" : "written to";
      console.log(`Data ${operation} file ${fullPath} asynchronously!`);
    }
  });
}
