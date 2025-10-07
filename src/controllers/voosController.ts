import { VoosRepository } from "../repositories/voosRepository.ts";
import type { Request, Response } from "express";

const voosRepository = new VoosRepository();

export class VoosController {

  async listar(req: Request, res: Response) {
    try {
      const voos = await voosRepository.listarTodos();
      res.status(200).json(voos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar voos.' });
    }
  }
   async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const voo = await voosRepository.buscarPorId(id);

      if (!voo) {
        return res.status(404).json({ message: 'Voo não encontrado.' });
      }

      res.json(voo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao buscar voo.' });
    }
  }

}