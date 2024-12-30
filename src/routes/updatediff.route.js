import { Router } from "express";
import { updatediff } from "../controllers/updatediff.controller.js";

const router = Router();

router.route("/").post(updatediff);

export default router;
