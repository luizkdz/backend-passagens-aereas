import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { voosRouter } from './routes/voosRoutes.ts';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Backend TypeScript rodando!');
});

app.use('/passagens-aereas', voosRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));