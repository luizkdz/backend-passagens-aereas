import db from "../database/connection.ts";


export interface Voo {
  id: number;
  codigo_voo: string;
  origem_id: number;
  destino_id: number;
  data_partida: Date;
  data_chegada: Date;
  preco: number;
  companhia_id: number;
  assentos_disponiveis: number;
}




export class VoosRepository{
    async listarTodos(): Promise<Voo[]> {
    const [rows] = await db.query(`
    SELECT
      v.id AS voo_id,
      v.codigo_voo,
      v.data_partida,
      v.data_chegada,
      v.data_volta,
      v.preco,
      v.assentos_disponiveis,
      c.nome AS companhia_nome,
      c.codigo AS companhia_codigo,
      c.logo_url as companhia_logo,
      ao.codigo_iata AS origem_iata,
      ao.nome AS origem_nome,
      ad.codigo_iata AS destino_iata,
      ad.nome AS destino_nome
    FROM voos v
    LEFT JOIN companhias c ON v.companhia_id = c.id
    LEFT JOIN aeroportos ao ON v.origem_id = ao.id
    LEFT JOIN aeroportos ad ON v.destino_id = ad.id
  `);
    return rows as Voo[];
  }

    async buscarPorId(id: number): Promise<Voo | null> {
    const [rows] = await db.query('SELECT * FROM voos WHERE id = ?', [id]);
    const resultados = rows as Voo[];
    return resultados[0] || null;
  }


}