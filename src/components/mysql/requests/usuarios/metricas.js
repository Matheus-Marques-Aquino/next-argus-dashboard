import mysql from 'mysql2/promise';
import QueryHandler from '@/components/mysql/QueryHandler';

const queryHandler = new QueryHandler();

function getFirstDayOfMonth(mes, ano) {
    const month = parseInt(mes) - 1;
    const year = parseInt(ano);
    const firstDay = new Date(year, month, 1);
    
    return firstDay;
}

function getLastDayOfMonth(mes, ano) {
    const month = parseInt(mes) - 1;
    const year = parseInt(ano);
    const lastDay = new Date(year, month + 1, 0);    
    lastDay.setHours(23, 59, 59, 999);
    
    return lastDay;
}

export default async function getMetricasUsuarios(body) {
    var { id_Usuario, id_Campanha, mes, ano } = body || {};

    if (!id_Usuario || !id_Campanha || !/^[0-9]{1,2}$/.test(mes) || !/^[0-9]{4}$/.test(ano)) return { error: true, message: 'Campanha inválida!' };    

    mes = parseInt(mes);
    ano = parseInt(ano);

    var startAt = getFirstDayOfMonth(mes, ano);
    var endAt = getLastDayOfMonth(mes, ano);

    startAt = queryHandler.DateToSQL(startAt);
    endAt = queryHandler.DateToSQL(endAt);

    var query_user_campaings = `
        SELECT
            u.id_Usuario,
            ruc.id_Campanha, 
            c.camp_desc AS Campanha
        FROM dominiox.usuario AS u
        LEFT JOIN dominiox.r_usuariocampanha AS ruc ON ruc.id_Usuario = u.id_Usuario
        LEFT JOIN dominiox.campanha AS c ON ruc.id_Campanha = c.id_Campanha
        LEFT JOIN dominiox.usuario AS s ON s.id_Usuario = ruc.id_Usuario_Supervisor
        WHERE u.id_Usuario = ${id_Usuario};
    `;

    var query_user_data = `
        SELECT #COUNT(*),
            ruc.id_Campanha, 
            c.camp_desc AS Campanha,
            u.id_Usuario,
            u.usu_Nome AS Nome,
            u.usu_DataCadastro AS DataCadastro,
            p.per_Desc AS Perfil,
            ruc.id_Usuario_Supervisor AS id_Supervisor,
            s.usu_Nome AS Supervisor
        FROM dominiox.usuario AS u
        LEFT JOIN dominiox.r_usuariocampanha AS ruc ON ruc.id_Usuario = u.id_Usuario
        LEFT JOIN dominiox.campanha AS c ON ruc.id_Campanha = c.id_Campanha
        LEFT JOIN dominiox.perfil AS p ON p.id_Perfil = ruc.id_Perfil
        LEFT JOIN dominiox.usuario AS s ON s.id_Usuario = ruc.id_Usuario_Supervisor
        WHERE u.id_Usuario = ${id_Usuario} AND ruc.id_Campanha = ${id_Campanha};
    `;

    console.log(startAt, endAt);

    var query_ligacoes = `
        SELECT 
            l.id_Ligacao,
            l.id_Planilha,
            l.id_HistoricoTab,
            l.id_HistoricoTab_Resultado,
            l.lig_DataEnvio AS DataEnvio,
            l.lig_DataFimLigacao AS DataFimLigacao,
            stl.sta_Desc AS StatusLigacao,
            tpd.tp_DescResumo AS TipoDiscagem,
            l.id_TipoAgenda,
            l.id_Usuario,
            l.id_Ligacao_Principal,
            l.lig_Calc_SegTempoDiscando AS SegundosDiscando,
            l.lig_Calc_SegTempoChamando AS SegundosChamando,
            l.lig_Calc_SegTempoSinalizacao AS SegundosSinalizacao,
            l.lig_Calc_SegTempoConectado AS SegundosConectado,
            t.tab_Desc AS TabuladoComo,
            ct.cat_Desc AS Categoria,	
            t1.tab_Desc AS TabuladoComo_Resultado,
            ct1.cat_Desc AS Categoria_Resultado,
            p.id_Campanha,
            cp.camp_desc AS Campanha
        FROM camp${id_Campanha}.ligacao AS l
        INNER JOIN universal.statusligacao AS stl ON stl.id_StatusLigacao = l.id_StatusLigacao
        INNER JOIN universal.tipodiscagem AS tpd ON tpd.id_TipoDiscagem = l.id_TipoDiscagem
        LEFT JOIN camp${id_Campanha}.historicotab AS h ON h.id_HistoricoTab = l.id_HistoricoTab
        LEFT JOIN camp${id_Campanha}.historicotab AS h1 ON h1.id_HistoricoTab = l.id_HistoricoTab_Resultado
        LEFT JOIN camp${id_Campanha}.tabulacao AS t ON t.id_Tabulacao = h.id_Tabulacao
        LEFT JOIN camp${id_Campanha}.categoria AS ct ON ct.id_Categoria = t.id_Categoria 
        LEFT JOIN camp${id_Campanha}.tabulacao AS t1 ON t1.id_Tabulacao = h1.id_Tabulacao
        LEFT JOIN camp${id_Campanha}.categoria AS ct1 ON ct1.id_Categoria = t1.id_Categoria
        LEFT JOIN camp${id_Campanha}.planilha AS p ON p.id_Planilha = l.id_Planilha 
        LEFT JOIN dominiox.campanha AS cp ON p.id_Campanha = cp.id_Campanha
        WHERE l.lig_DataEnvio BETWEEN '${startAt}' AND '${endAt}' AND l.id_Usuario = ${id_Usuario}
        GROUP BY l.id_Ligacao;
    `;

    var query_vendas = `
        WITH HistoricoFiltrado AS (
            SELECT 
                h.id_HistoricoTab, 
                h.id_Planilha, 
                h.id_StatusSucesso, 
                h.his_DataEvento,
                h.id_Usuario,   
                h.id_Auditoria,
                a.id_Ligacao,
                ROW_NUMBER() OVER (PARTITION BY h.id_Planilha ORDER BY h.id_HistoricoTab DESC) AS rn
            FROM camp${id_Campanha}.historicotab h
            LEFT JOIN camp${id_Campanha}.auditoria AS a ON a.id_Auditoria = h.id_Auditoria
            WHERE h.id_StatusSucesso IS NOT NULL
        ),
        VendasRecente AS (
            SELECT 
                v.id_Venda, 
                v.id_Planilha, 
                v.ven_Total, 
                ROW_NUMBER() OVER (PARTITION BY v.id_Planilha ORDER BY v.id_Venda DESC) AS rn
            FROM camp${id_Campanha}.venda v
        )
        SELECT 
            p.id_Campanha, 
            c.camp_desc AS Campanha,
            h.id_Planilha AS NrLead,
            v.id_Venda, 
            v.ven_Total AS Receita, 
            h.id_HistoricoTab, 
            h.his_DataEvento AS DataEvento,
            p.plan_DataImportacao AS DataImportacaoLead,
            stts.sts_Desc AS StatusSucesso,
            h.id_Usuario,
            h.id_Auditoria,
            h.id_Ligacao
        FROM HistoricoFiltrado h
        JOIN VendasRecente v ON h.id_Planilha = v.id_Planilha
        LEFT JOIN camp${id_Campanha}.planilha AS p ON h.id_Planilha = p.id_Planilha
        LEFT JOIN universal.statussucesso AS stts ON stts.id_StatusSucesso = h.id_StatusSucesso
        LEFT JOIN dominiox.campanha AS c ON c.id_Campanha = p.id_Campanha 
        WHERE h.rn = 1 AND v.rn = 1 AND h.his_DataEvento BETWEEN '${startAt}' AND '${endAt}' AND h.id_Usuario = ${id_Usuario};
    `;

    console.log(body)

    const conn = await queryHandler.getConnection();
    var results = {
        campanhas: [],
        usuario: [],
        ligacoes: [],
        vendas: []
    };

    try {
        await conn.connect();
        console.log('Conectado ao banco de dados.');
        var [rows, fields] = await conn.query(query_user_campaings);
        results.campanhas = rows;
        console.log('CAMPANHAS:', rows);

        [rows, fields] = await conn.query(query_user_data);
        results.usuario = rows;
        console.log('USER:', rows);

        [rows, fields] = await conn.query(query_ligacoes);
        results.ligacoes = rows;
        console.log('LIGACOES:', rows);

        [rows, fields] = await conn.query(query_vendas);
        results.vendas = rows;
        console.log('VENDAS:', rows);

        //console.log(rows.length, 'Dados do Usuario encontrado.');
        //results = rows;
    }catch(e){
        console.log('Erro ao buscar as usuarios', e);
    }finally{
        await conn.end();
    }

    console.log("Usuarios encontrados:", results);

    return results;
}