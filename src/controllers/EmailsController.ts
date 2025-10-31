import { hash } from "crypto";
import EmailsRepository from "../repositories/EmailsRepository.ts";
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();
interface CadastrarEmailBody {
  email: string;
}

interface CriarConta {
    email:string,
    senha:string
}

interface EntrarEmailESenha{
    email:string,
    senha:string
}

export default class EmailsController {

    private emailRepository : EmailsRepository;

    constructor(emailRepository : EmailsRepository) {
        this.emailRepository = new EmailsRepository(); 
    }

    cadastrarEmail = async (req: Request<{},{},CadastrarEmailBody>, res: Response) => {
        const { email } = req.body;
        console.log("body recebido", req.body);
        if (!email) {
            return res.status(400).json({ success: false, message: "O email é obrigatório" });
        }
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            return res.status(400).json({success:false, message:"O formato de email é inválido"});
        }

        const result = await this.emailRepository.cadastrarEmail(email);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    }

    criarConta = async(req:Request<{},{},CriarConta>, res:Response) => {
        const {email, senha} = req.body;
        console.log("body recebido", req.body);
        if(!senha || !email){
            return res.status(400).json({ success: false, message: "O email e senha são obrigatórios" });
        }

        const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$^&+=.!?\-_*]).{8,}$/;
        if(!regexSenha.test(senha)){
             return res
        .status(400)
        .json({ success: false, message: "A senha deve ter no mínimo 8 caracteres, com uma maiúscula, uma minúscula, um número e um símbolo especial." });
        }
        else{
            const senhaComHash = await bcrypt.hash(senha,10);

            const result = await this.emailRepository.criarConta(email,senhaComHash);
            if(result.success){
                return res.status(200).json({message:"Conta criada com sucesso"});
            }
            else{
                return res.status(400).json({message:"Ocorreu um erro ao criar a conta"});
            }
        }
    }

    entrarEmail = async (req:Request<{},{},CadastrarEmailBody>, res: Response) => {
        try{
            const {email} = req.body;
            if(!email){
                return res.status(400).json({success: false , message: "O email é obrigatório"});
            }
            if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            return res.status(400).json({success:false, message:"O formato de email é inválido"});
        }
        const result = await this.emailRepository.entrarEmail(email);

        if(result.success){
            return res.status(200).json(result);
        }
        }
        catch(err){
            console.log(err);
        }
    }

    entrarEmailESenha = async (req:Request<{},{},EntrarEmailESenha>, res:Response) => {
        try{
            const {email, senha} = req.body;
            if(!email || !senha){
                return res.status(400).json({message:"O email e a senha são obrigatórios"})
            }

        const usuario = await this.emailRepository.buscarEmail(email);
          


            const result = await this.emailRepository.entrarEmailESenha(email,senha);

            if(!result.success){
                return res.status(400).json({message:"A senha está incorreta"});
            }

            const token = jwt.sign(
    { id: usuario.usuario?.id, nome: usuario.usuario?.nome, email: usuario.usuario?.email },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
);

            res.cookie("auth_token", token, {
                httpOnly:true,
                secure: false,
                sameSite:"lax",
                maxAge: 1000 * 60 * 60 * 24 * 7
            })
            
            return res.status(200).json({message:"Usuario autenticado com sucesso",id:usuario.usuario?.id,nome:usuario.usuario?.nome,email:usuario.usuario?.email});
            
        }
        catch(err){
            console.log(err);
        }
    }
}