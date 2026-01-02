import db from "../database/connection.ts";


export interface Voo {
  imagem: string,
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

  async listarBuscados(origem: string | undefined, destino: string | undefined, ida: string | undefined, volta: string | undefined): Promise<Voo[]> {
  try{
const params: any[] = [];

  let query = `
    SELECT
      v.id AS voo_id,
      v.codigo_voo,
      v.data_partida,
      v.data_chegada,
      v.data_volta,
      v.preco,
      v.data_chegada_volta,
      v.assentos_disponiveis,
      c.nome AS companhia_nome,
      c.codigo AS companhia_codigo,
      c.logo_url AS companhia_logo,
      ao.codigo_iata AS origem_iata,
      ao.nome AS origem_nome,
      ao.cidade AS cidade_origem,
      ad.codigo_iata AS destino_iata,
      ad.nome AS destino_nome,
      ad.cidade AS cidade_destino
      
    FROM voos v
    LEFT JOIN companhias c ON v.companhia_id = c.id
    LEFT JOIN aeroportos ao ON v.origem_id = ao.id
    LEFT JOIN aeroportos ad ON v.destino_id = ad.id
    WHERE 1=1
  `;

  if (origem) {
    query += ` AND ao.cidade LIKE ?`;
    params.push(`%${origem}%`);
  }

  if (destino) {
    query += ` AND ad.cidade LIKE ?`;
    params.push(`%${destino}%`);
  }

  if (ida) {
  // transforma a string ISO em Date
  const dataPartida = new Date(ida);

  // formata YYYY-MM-DD
  const ano  = dataPartida.getFullYear();
  const mes  = String(dataPartida.getMonth() + 1).padStart(2, '0');
  const dia  = String(dataPartida.getDate()).padStart(2, '0');

  const dataFormatada = `${ano}-${mes}-${dia}`; // ex: 2027-01-10

  // cria intervalo de início e fim do dia
  const inicioDoDia = `${dataFormatada} 00:00:00`;
  const fimDoDia    = `${dataFormatada} 23:59:59`;

  query += ` AND v.data_partida BETWEEN ? AND ?`;
  params.push(inicioDoDia, fimDoDia);
}

  if (volta) {
  // transforma a string ISO em Date
  const dataVolta = new Date(volta);

  // formata YYYY-MM-DD
  const ano  = dataVolta.getFullYear();
  const mes  = String(dataVolta.getMonth() + 1).padStart(2, '0');
  const dia  = String(dataVolta.getDate()).padStart(2, '0');

  const dataFormatada = `${ano}-${mes}-${dia}`; // ex: 2027-01-10

  // cria intervalo de início e fim do dia
  const inicioDoDia = `${dataFormatada} 00:00:00`;
  const fimDoDia    = `${dataFormatada} 23:59:59`;

  query += ` AND v.data_volta BETWEEN ? AND ?`;
  params.push(inicioDoDia, fimDoDia);
}

  const [rows] = await db.query(query, params);
  return rows as Voo[];
  }
  catch(err){
    console.log(err);
    console.log("oi")
    return [];
  }
}

    async buscarPorId(id: number): Promise<Voo | null> {
    try{
      const [rows] = await db.query(`SELECT
      v.id AS voo_id,
      v.codigo_voo,
      v.data_partida,
      v.data_chegada,
      v.data_volta,
      v.preco,
      v.data_chegada_volta,
      v.assentos_disponiveis,
      c.nome AS companhia_nome,
      c.codigo AS companhia_codigo,
      c.logo_url AS companhia_logo,
      ao.codigo_iata AS origem_iata,
      ao.nome AS origem_nome,
      ao.cidade AS cidade_origem,
      ad.codigo_iata AS destino_iata,
      ad.nome AS destino_nome,
      ad.cidade AS cidade_destino
      
    FROM voos v
    LEFT JOIN companhias c ON v.companhia_id = c.id
    LEFT JOIN aeroportos ao ON v.origem_id = ao.id
    LEFT JOIN aeroportos ad ON v.destino_id = ad.id
    WHERE v.id = ?` , [id]);
    const resultados = rows as Voo[];
    return resultados[0] || null;
    }
    catch(err){
      console.log(err);
      return null;
    }
  }


}