import mysql from 'mysql2/promise';
import QueryHandler from '@/components/mysql/QueryHandler';

export default async function getLotes(req, res) {
    const body = req.body || {};
    var { UserIds = [], CampanhasData = [] } = body;

    CampanhasData = CampanhasData[0];
    const { id } = CampanhasData;

    if (!id) return res.status(400).json({ error: true, message: 'Campanha inválida!' });    
    
    var filtros = "";
    if (UserIds.length) filtros = `AND u.id_Usuario IN (${UserIds.join(',')})`;
    
    const query = `
        SELECT
            ruc.id_Campanha, 
            c.camp_desc AS Campanha,
            u.id_Usuario,
            u.usu_Nome AS Nome,
            u.usu_DataCadastro AS DataCadastro,
            a.at_Desc As Ativo,
            p.per_Desc AS Perfil,
            ruc.id_Usuario_Supervisor,
            s.usu_Nome AS Supervisor,
            u.usu_CodIntegracao AS CodIntegracao
        FROM dominiox.usuario AS u
        INNER JOIN universal.ativo AS a ON a.id_Ativo = u.id_Ativo
        LEFT JOIN dominiox.r_usuariocampanha AS ruc ON ruc.id_Usuario = u.id_Usuario
        LEFT JOIN dominiox.campanha AS c ON ruc.id_Campanha = c.id_Campanha
        LEFT JOIN dominiox.perfil AS p ON p.id_Perfil = ruc.id_Perfil
        LEFT JOIN dominiox.usuario AS s ON s.id_Usuario = ruc.id_Usuario_Supervisor
        WHERE p.per_Operador = 'S' AND a.at_Desc = 'ATIVO' AND u.usu_Teste = 'N' AND u.usu_Virtual = 'N' AND u.usu_Sistema = 'N' AND ruc.id_Campanha = ${id} ${filtros}        
        GROUP BY u.id_Usuario 
        ORDER BY id_Usuario DESC;
    `;

    const queryHandler = new QueryHandler();
    const conn = await queryHandler.getConnection();

    var results = [];

    try {
        await conn.connect();
        var [rows, fields] = await conn.query(query);

        console.log(rows.length, 'Usuarios encontradas.');
        results = rows;
    }catch(e){
        console.log('Erro ao buscar as usuarios', e);
    }finally{
        await conn.end();
    }

    console.log("Usuarios encontrados:", results.length);

    return res.status(200).json(results);
}
  