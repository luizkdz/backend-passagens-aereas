import { VoosRepository } from "../repositories/voosRepository.ts";
import type { Request, Response } from "express";

const voosRepository = new VoosRepository();

interface QueryParams {
  origem?: string,
  destino?: string,
  ida?: string,
  volta?: string;
}

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

  async listarBuscados(req: Request<{},{},{},QueryParams>, res: Response){
    try{
      const origem = req.query.origem ?? "";
    const destino = req.query.destino ?? "";
    const ida = req.query.ida ?? "";
    const volta = req.query.volta ?? "";
    
    console.log(origem,destino,ida,volta);
      const voos = await voosRepository.listarBuscados(origem,destino,ida,volta);
      res.status(200).json(voos);
    }
    catch(error){
      console.error(error);
      res.status(500).json({message:"Erro ao listar buscados"});
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