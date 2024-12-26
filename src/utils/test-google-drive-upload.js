import { GoogleAuth } from "google-auth-library";
import { google } from "googleapis";

export async function uploadFileToGoogleDrive(file) {
  const auth = new GoogleAuth({
    apiKey: process.env.GOOGLE_API_KEY,
    clientOptions: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  });
  const service = google.drive({ version: "v3", auth });
  const requestBody = {
    name: "photo.jpg",
    fields: "id",
  };
  const media = {
    mimeType: "text/plain",
    body: file,
  };
  try {
    const file = await service.files.create({
      requestBody,
      media: media,
    });
    console.log("File Id:", file.data.id);
    return file.data.id;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}
