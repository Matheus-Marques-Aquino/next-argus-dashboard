import mysql from 'mysql2/promise';
import QueryHandler from '@/components/mysql/QueryHandler';

export default async function getLotes(req, res) {
    const body = req.body || {};
    const { CampanhasData = [] } = body;
    console.log(body)
    if (!Array.isArray(CampanhasData) || !CampanhasData.length) return res.status(400).json({ error: true, message: 'Campanhas inválidas!' });    

    const queryHandler = new QueryHandler();

    const conn = await queryHandler.getConnection();


    var results = [];

    try {
        await conn.connect();

        for (let camp of CampanhasData) {
            const { id, sanitaze } = camp;
            const query = `
                SELECT 
                    lt.id_Lote, 
                    lt.lot_Desc AS Lote, 
                    s.skl_Desc AS Skill,
                    lt.lot_Inicio AS DataInicio, 
                    lt.lot_Fim AS DataFim, 
                    a.at_Desc AS Ativo
                FROM camp${id}.lote lt
                LEFT JOIN camp${id}.skill AS s ON s.id_Skill = lt.id_Skill 
                LEFT JOIN universal.ativo AS a ON lt.id_Ativo = a.id_Ativo 
                WHERE a.at_Desc = 'ATIVO' AND lt.lot_Producao = 'S';
            `;

            try {
                var [result] = await conn.query(query);                
                for(const lote in result) result[lote].camp = sanitaze;
                results = results.concat(result);                
            } catch (e) {
                console.log(`Tabela não encontrada ou erro na campanha ${camp}:`, e.message);
            }
        }

        console.log(results.length, 'Lotes encontradas.');
    }catch(e){
        console.log('Erro ao buscar as lotes:', e);
    }finally{
        await conn.end();
    }

    return res.status(200).json(results);
}
  