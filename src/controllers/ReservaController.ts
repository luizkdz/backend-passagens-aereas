import ReservaRepository from "../repositories/ReservaRepository.ts";
import type { Request,Response } from "express";


class ReservaController{
    reservaRepository: ReservaRepository;
    
    constructor(reservaRepository: ReservaRepository){
        this.reservaRepository = reservaRepository;
    }

    inserirReserva = async (req : Request, res : Response) => {
        try{
            const dados = req.body;
            const usuario = (req as any).usuario;
            dados.usuario_id = usuario?.id ?? null;
            const idReserva = await this.reservaRepository.inserirReserva(dados);
            return res.status(201).json({message:"Reserva inserida com sucesso",
                reserva_id: idReserva
            });
        }
        catch(err){
            console.log(err);
            return res.status(500).json({message:"Erro interno do servidor"});
        }
    }
}

export default ReservaController;