import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFileToGoogleDrive } from "../utils/test-google-drive-upload.js";
import { googleDrive } from "../config/init.js";
// steps to upload file
// get the file
// store it in temp folder for retry
// after upload complete delete the file from temp folder

const uploadFile = asyncHandler(async (req, res) => {
  const file = req.body.file;
  console.log(googleDrive);
  //   uploadFileToGoogleDrive(file);
  const response = await uploadToDrive(googleDrive, file);
  return res.status(200).json(new ApiResponse(200, "OK", response));
});

async function uploadToDrive(drive, media) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: "test.jpg",
        mimeType: "image/jpeg",
      },
      media: {
        mimeType: "image/jpeg",
        body: media,
      },
      fields: "id",
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

const getFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const file = ` this is a file ${fileId}`;
  return res.status(200).json(new ApiResponse(200, "OK", file));
});

export { uploadFile, getFile };
