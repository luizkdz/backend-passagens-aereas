import db from "../database/connection.ts"
import type { RowDataPacket } from "mysql2";
import bcrypt from 'bcrypt';

export default class EmailsRepository {

    async cadastrarEmail(email: string) : Promise<{ success: boolean; message: string }> {
        try {
            const [rows] = await db.query<RowDataPacket[]>('SELECT email FROM usuarios WHERE email = ?', [email]);
            
            if (rows.length > 0) {
             return { success: false, message: "O email já está em uso" };
            }

            return {success:true, message:"O email pode ser usado"}

        } catch (error) {
            console.error('Erro ao cadastrar email:', error);
            return { success: false, message:"Erro ao cadastrar email"}
        }
    }

    async criarConta(email: string, senha : string) : Promise<{ success : boolean; message: string}> {
        try{
            const [rows] = await db.query<RowDataPacket[]>("INSERT INTO usuarios (email, senha) values (? , ?)",[email,senha]);
            
            const result = rows as any;
            
            if(!result.insertId){
                return { success : false, message: "Não foi possível cadastrar o usuario"}
            }

            return {success:true, message:"A conta foi criada"}
        }
        catch ( error){
            console.error("Erro ao criar conta", error);
            return {success : false, message:"Erro ao criar conta"}
        }
    }

    async entrarEmail(email:string) : Promise<{success : boolean, message: string}> {
        try{
            const [rows] = await db.query<RowDataPacket[]>("SELECT email from usuarios where email = ?",[email]);
            if(rows.length === 0){
                return {success: false, message:"Esse email não está cadastrado"}
            }
            return {success:true, message:`Bem vindo ${email}`}
        }

        catch(error){
            console.error("Erro ao fazer login", error);
            return {success: false, message: "Erro do servidor"}
        }
    }

    async entrarEmailESenha(email: string, senhaDigitada: string): Promise<{success: boolean; message: string}> {
    try {
        const [rows] = await db.query<RowDataPacket[]>(
            "SELECT senha FROM usuarios WHERE email = ?", [email]
        );

        if (rows.length === 0) {
            return { success: false, message: "Usuário não cadastrado" };
        }

        const hashDoBanco = rows[0]?.senha as string;
        const senhaValida = await bcrypt.compare(senhaDigitada, hashDoBanco);

        if (!senhaValida) {
            return { success: false, message: "Senha incorreta" };
        }

        return { success: true, message: "Usuário autenticado com sucesso" };
    } catch (error) {
        console.error("Erro ao entrar na conta", error);
        return { success: false, message: "Erro do servidor" };
    }
}

    async buscarEmail(email : string) : Promise<{success: boolean; usuario?: {id : number; nome: string; email: string}; message?: string}>{
        try{
            const [rows] = await db.query<RowDataPacket[]>("SELECT id,nome,email from usuarios where email = ? ", [email]
            );
            if(rows.length === 0){
                return {success:false, message:"Email não cadastrado"}
            }
            const usuario = {
            id: rows[0]?.id,
            nome: rows[0]?.nome,
            email: rows[0]?.email
        };
            return {success:true, usuario};
        }
        catch(err){
            return {success: false, message:"Erro do servidor"}
        }
    }
}