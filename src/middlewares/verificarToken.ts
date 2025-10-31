import jwt from 'jsonwebtoken';
import type {Request, Response, NextFunction} from 'express';

export default function verificarToken(req:Request, res:Response, next:NextFunction){
    const token = req.cookies?.auth_token;
    if(!token){
        return res.status(401).json({message: "Token ausente"})
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).usuario = decoded;
        next();
    }
    catch(err){
        return res.status(401).json({message: "Token inválido ou expirado"})
    }
}