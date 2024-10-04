function getCategorias({id}, filters="") {
    return `
        SELECT ct.cat_Desc AS Categoria, COUNT(ct.cat_Desc) AS Total
        FROM camp${id}.historicotab h
        LEFT JOIN camp${id}.planilha AS p ON p.id_Planilha = h.id_Planilha
        LEFT JOIN dominiox.campanha AS c ON p.id_Campanha = c.id_Campanha
        LEFT JOIN camp${id}.tabulacao AS t ON h.id_Tabulacao = t.id_Tabulacao
        LEFT JOIN camp${id}.categoria AS ct ON t.id_Categoria = ct.id_Categoria
        ${filters}
        GROUP BY Categoria;
    `;
}


module.exports = { getCategorias };