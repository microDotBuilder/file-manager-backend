import { Router } from "express";
import { getStructure } from "../controllers/structure.controller.js";

const router = Router();

router.route("/").get(getStructure);

export default router;
