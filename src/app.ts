import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { voosRouter } from './routes/voosRoutes.ts';
import EmailsRepository from './repositories/EmailsRepository.ts';
import EmailsController from './controllers/EmailsController.ts';
import verificarToken from './middlewares/verificarToken.ts';
import AuthController from './controllers/AuthController.ts';
import cookieParser from 'cookie-parser';
import { VoosController } from './controllers/voosController.ts';
import ReservaController from './controllers/ReservaController.ts';
import ReservaRepository from './repositories/ReservaRepository.ts';
import { verificarTokenCheckout } from './middlewares/verificarTokenCheckout.ts';
dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // seu frontend
  credentials: true, // ✅ permite cookies
}));
app.use(express.json());

app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
    res.send('Backend TypeScript rodando!');
});

app.use('/passagens-aereas', voosRouter);




const emailsRepository = new EmailsRepository();
const emailsController = new EmailsController(emailsRepository);
const authController = new AuthController();
const voosController = new VoosController();
const reservaRepository = new ReservaRepository();
const reservaController = new ReservaController(reservaRepository);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

app.post('/cadastrar-email', emailsController.cadastrarEmail);

app.post('/cadastrar-email-senha', emailsController.criarConta);

app.post('/entrar-email', emailsController.entrarEmail);

app.post('/entrar-email-e-senha', emailsController.entrarEmailESenha);

app.get('/verify', verificarToken, authController.verificaUsuarioLogado);

app.post('/logout', verificarToken, authController.logout);

app.get('/buscar-voos', voosController.listarBuscados);

app.get('/buscar-voo/:id', voosController.buscarPorId);

app.post('/reservas',verificarTokenCheckout,reservaController.inserirReserva);