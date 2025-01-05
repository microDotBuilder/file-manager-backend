import { google } from "googleapis";
import "./dot.js";

let googleDrive = "";
const DriveInit = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  googleDrive = google.drive({ version: "v3", auth: oauth2Client });
};

export { googleDrive, DriveInit };
