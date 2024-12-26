import { Router } from "express";
import { uploadFile, getFile } from "../controllers/upload.controller.js";

const router = Router();

router.route("/").post(uploadFile);
router.route("/:fileId").get(getFile);

export default router;
