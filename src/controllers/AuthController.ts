import type { Request, Response } from "express";


export default class AuthController {
  verificaUsuarioLogado = (req: Request, res: Response) => {
    const usuario = (req as any).usuario;
    if (!usuario) {
      return res.status(401).json({ loggedIn: false });
    }

    console.log(usuario);
    return res.status(200).json({ loggedIn: true, user: usuario });
  
    
};
  

  logout = (req:Request, res:Response) => {
        res.clearCookie("auth_token",{
            httpOnly:true,
            sameSite:'lax',
            secure:false,
            path: "/"
        });

        return res.status(200).json({message: "Logout realizado com sucesso"});
  }
}