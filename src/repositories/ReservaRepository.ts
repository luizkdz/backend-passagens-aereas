import type { ResultSetHeader } from "mysql2";
import db from "../database/connection.ts";

interface IDados {
    formData,
    nomeCompleto?: string;
    email?: string;
    celulares?: string[];
    cpf?: string;

    voo_ida_id: number;
    voo_volta_id?: number | null;

    usuario_id?: number | null;    // se logado
    comprador_id?: number | null;  // guest
    preco_total: number;
}

class ReservaRepository {

    async inserirReserva(dados: IDados) {

        let compradorId = null;

        // Se NÃO for usuário logado → cria um comprador guest
        if (!dados.usuario_id) {

            const queryGuest = `
                INSERT INTO compradores_guest (nome, email, telefone, cpf, criado_em) 
                VALUES (?, ?, ?, ?, NOW())
            `;
            console.log(dados);
            console.log(dados.formData.celulares?.[0]);
            const paramsGuest = [
                dados.formData.nomeCompleto ?? null,
                dados.formData.email ?? null,
                dados.formData.celulares?.[0].numero ?? null,
                dados.formData.cpf ?? null,
            ];

            const [resultGuest] = await db.query<ResultSetHeader>(queryGuest, paramsGuest);

            compradorId = resultGuest.insertId;
        }

        const queryReserva = `
            INSERT INTO reservas (voo_ida_id, voo_volta_id, usuario_id, preco_total, status_compra, criado_em, comprador_id)
            VALUES (?, ?, ?, ?, 'aguardando_pagamento', NOW(), ?)
        `;

        const paramsReserva = [
            dados.voo_ida_id,
            dados.voo_volta_id ?? null,
            dados.usuario_id ?? null,
            dados.preco_total,
            compradorId
        ];

        const [resultReserva] = await db.query<ResultSetHeader>(queryReserva, paramsReserva);

        return resultReserva.insertId;
    }
}

export default ReservaRepository;