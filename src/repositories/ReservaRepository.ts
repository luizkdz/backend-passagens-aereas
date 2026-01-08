import type { ResultSetHeader, RowDataPacket } from "mysql2";
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

    async buscarReserva(reservaId : int) {
        let query = `select r.id, r.voo_ida_id, r.voo_volta_id, r.usuario_id, r.preco_total, r.criado_em, r.comprador_id, v_ida.codigo_voo as codigo_voo_ida, v_ida.data_partida,v_ida.data_chegada, v_ida.preco,v_ida.companhia_id as codigo_companhia_ida,v_ida.assentos_disponiveis as assentos_disponiveis_ida ,v_volta.data_volta,v_volta.data_chegada_volta,v_volta.codigo_voo as codigo_voo_volta,v_volta.companhia_id as codigo_companhia_volta,v_volta.assentos_disponiveis as assentos_disponiveis_volta,a.nome as aeroporto_origem,a.codigo_iata as codigo_aeroporto_origem,a.cidade as cidade_origem,a.estado as estado_origem,a.pais as pais_origem,ae.nome as aeroporto_destino,ae.codigo_iata as codigo_aeroporto_destino,ae.cidade as cidade_destino,ae.estado as estado_destino,ae.pais as pais_destino, c.nome as companhia_ida_nome, c.codigo as companhia_ida_codigo, c.logo_url as companhia_ida_logo,co.nome as companhia_volta_nome, co.codigo as companhia_volta_codigo, co.logo_url as companhia_volta_logo, cg.nome as nome_comprador, cg.email as email_comprador, cg.cpf as cpf_comprador from reservas r
	left join voos v_ida on v_ida.id = r.voo_ida_id
	left join voos v_volta on v_volta.id = r.voo_volta_id
	left join aeroportos a on a.id = v_ida.origem_id
	left join aeroportos ae on ae.id = v_volta.destino_id
	left join companhias c on v_ida.companhia_id = c.id
    left join companhias co on v_volta.companhia_id = co.id
    left join compradores_guest cg on cg.id = r.comprador_id
    left join usuarios u on u.id = r.usuario_id
	where r.id = ?;
    `

    const [resultReserva] = await db.query<RowDataPacket[]>(query,[reservaId]);
    return resultReserva[0];
    }
}

export default ReservaRepository;