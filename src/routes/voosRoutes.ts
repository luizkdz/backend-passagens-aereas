import { Router } from "express";
import { VoosController } from "../controllers/voosController.ts";

const voosController = new VoosController();
export const voosRouter = Router();


voosRouter.get('/', voosController.listar);
voosRouter.get('/:id', voosController.buscarPorId);