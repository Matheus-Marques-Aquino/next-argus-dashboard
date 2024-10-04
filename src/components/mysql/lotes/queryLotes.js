function getLotes({id}) {
    return `
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
}


module.exports = { getLotes };