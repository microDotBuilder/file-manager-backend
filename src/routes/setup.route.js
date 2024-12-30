import { Router } from "express";
import { setup } from "../controllers/setup.controller.js";

const router = Router();

router.route("/").post(setup);

export default router;
