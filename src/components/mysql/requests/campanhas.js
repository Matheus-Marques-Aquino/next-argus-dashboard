import QueryHandler from '@/components/mysql/QueryHandler';

export default async function getCampanhas() {    
    const queryHandler = new QueryHandler();

    const conn = await queryHandler.getConnection();
    var results = [];

    const query = `
        SELECT 
            c.id_Campanha,
            c.camp_desc AS Campanha, 
            a.at_Desc AS Ativo, 
            c.camp_Inicio AS Inicio, 
            c.camp_Hr_SegSex_Inicio AS SegSex_Inicio, 
            c.camp_Hr_SegSex_Fim AS SegSex_Fim, 
            c.camp_Hr_Sabado_Inicio AS Sab_Inicio, 
            c.camp_Hr_Sabado_Fim AS Sab_Fim, 
            c.camp_Hr_Domingo_Inicio AS Dom_Inicio, 
            c.camp_Hr_Domingo_Fim AS Dom_Fim
        FROM dominiox.campanha c
        INNER JOIN universal.ativo a ON a.id_Ativo = c.id_Ativo
        WHERE a.at_Desc = 'ATIVO' AND c.camp_desc != 'CAMPANHA TESTE';
    `;

    try {
        await conn.connect();
        const [rows, fields] = await conn.query(query);
        results = rows;

        console.log(results.length, 'Campanhas encontradas.');
    }catch(e){
        console.log('Erro ao buscar as campanhas:', e);
    }finally{
        await conn.end();
    }

    return results;
}
  