import mysql from 'mysql2/promise';
import QueryHandler from '@/components/mysql/QueryHandler';
const queryHandler = new QueryHandler();

function removeNullProperties(doc) {
    return Object.fromEntries(
        Object.entries(doc).filter(([_, value]) => (value !== null && value !== "null" && value !== "" && value !== undefined))
    );
}

function buildFilter(data) {
    var { 
        CampanhasData, 
        DataEnvio = [],
        DataImportacao = [], 
        DataTabulacao = [],
        DataEvento = [], 
        RemoverBlackList = false,
        RemoverErroDeCadastro = false,
        RemoverFinalizadoImportacao = false,
        kpiTrabalhado = false,
        Lotes = [],
        Fornecedor = false,
        UserIds=[]
    } = data || {};

    if (!Array.isArray(CampanhasData) && CampanhasData.length == 0) return "";

    var filter = "";

    if (Array.isArray(DataImportacao) && DataImportacao.length == 2) {
        if (!DataImportacao[0]) DataImportacao[0] = new Date();
        if (!DataImportacao[1]) DataImportacao[1] = new Date();

        DataImportacao[0] = new Date(DataImportacao[0]);
        DataImportacao[1] = new Date(DataImportacao[1]);
        
        DataImportacao[0].setHours(0, 0, 0, 0);
        DataImportacao[1].setHours(23, 59, 59, 999);

        DataImportacao[0] = queryHandler.DateToSQL(new Date(DataImportacao[0]));
        DataImportacao[1] = queryHandler.DateToSQL(new Date(DataImportacao[1]));

        filter += `p.plan_DataImportacao BETWEEN '${DataImportacao[0]}' AND '${DataImportacao[1]}'`;
    }

    if ((Array.isArray(DataTabulacao) && DataTabulacao.length == 2) || (Array.isArray(DataEvento) && DataEvento.length == 2)) {
        if (!DataTabulacao[0]) DataTabulacao[0] = new Date();
        if (!DataTabulacao[1]) DataTabulacao[1] = DataTabulacao[0]

        DataTabulacao[0] = new Date(DataTabulacao[0]);
        DataTabulacao[1] = new Date(DataTabulacao[1]);        

        DataTabulacao[0].setHours(0, 0, 0, 0);
        DataTabulacao[1].setHours(23, 59, 59, 999);

        DataTabulacao[0] = queryHandler.DateToSQL(new Date(DataTabulacao[0]));
        DataTabulacao[1] = queryHandler.DateToSQL(new Date(DataTabulacao[1]));

        if (filter) filter += " AND ";
        filter += `h.his_DataEvento BETWEEN '${DataTabulacao[0]}' AND '${DataTabulacao[1]}'`;
    }

    if ((Array.isArray(DataEnvio) && DataEnvio.length == 2)) {
        if (!DataEnvio[0]) DataEnvio[0] = new Date();
        if (!DataEnvio[1]) DataEnvio[1] = DataEnvio[0];

        DataEnvio[0] = new Date(DataEnvio[0]);
        DataEnvio[1] = new Date(DataEnvio[1]);
        
        DataEnvio[0].setHours(0, 0, 0, 0);
        DataEnvio[1].setHours(23, 59, 59, 999);

        DataEnvio[0] = queryHandler.DateToSQL(new Date(DataEnvio[0]));
        DataEnvio[1] = queryHandler.DateToSQL(new Date(DataEnvio[1]));

        if (filter) filter += " AND ";
        filter += `l.lig_DataEnvio BETWEEN '${DataEnvio[0]}' AND '${DataEnvio[1]}'`;
    }

    if (Fornecedor && (Fornecedor == "OP" || Fornecedor == "MKT")) {
        if (filter) filter += " AND ";
        if (Fornecedor == "OP") filter += "cp.crm_Fornecedor NOt LIKE '%mkt%prime%'";
        if (Fornecedor == "MKT") filter += "cp.crm_Fornecedor LIKE '%mkt%prime%'";
    }

    if (Array.isArray(Lotes) && Lotes.length > 0) {
        if (filter) filter += " AND ";
        filter += `p.id_Lote IN (${Lotes.join(",")})`;
    }

    if (kpiTrabalhado) {
        if (filter) filter += " AND ";
        filter += "p.plan_TrabalhadoDisc = 'S'";
    }

    if (UserIds && UserIds.length) {
        if (filter) filter += " AND "
        filter += `l.id_Usuario IN (${UserIds.join(",")})`;
    }

    var tabuladoComo = [];
    var categoria = [];

    if (RemoverBlackList) tabuladoComo = [...tabuladoComo, ...["TELEFONE BLOQUEADO - PROCON", "TELEFONE BLOQUEADO - BLOCK LIST", "BLOCK LIST - MANUAL VENDA"]];
    if (RemoverErroDeCadastro) categoria = [...categoria, "ERRO DE CADASTRO"];
    if (RemoverFinalizadoImportacao) categoria = [...categoria, "FINALIZADO IMPORTAÇÃO"];

    if (tabuladoComo.length > 0) {
        if (filter) filter += " AND ";
        filter += `t.tab_Desc NOT IN ('${tabuladoComo.join("','")}')`;
    }

    if (categoria.length > 0) {
        if (filter) filter += " AND ";
        filter += `ct.cat_Desc NOT IN ('${categoria.join("','")}')`;
    }

    if (filter.length > 0) filter = `WHERE ${filter}`;

    return filter;        
}

export default async function getLigacoes(req, res) {
    const body = req.body || {};
    var { CampanhasData = [] } = body;

    CampanhasData = CampanhasData[0];
    const { id } = CampanhasData;

    if (!id) return res.status(400).json({ error: true, message: 'Campanha inválida!' });

    var filtros = buildFilter(body);

    const query = `
        SELECT 
            l.id_Ligacao,
            l.id_Planilha,
            l.id_HistoricoTab,
	        l.id_HistoricoTab_Resultado,
            l.lig_DataEnvio AS DataEnvio,
            h.his_DataEvento AS DataTabulacao,
            l.lig_DataRingBack AS DataRingBack,
            l.lig_DataSinalizacao AS DataSinalizacao,
            l.lig_DataFimLigacao AS DataFimLigacao,
            l.id_StatusLigacao,
            stl.sta_Desc AS StatusLigacao,
            l.id_Telefone,
            l.id_TelefonePlanilha,
            l.id_TipoDiscagem,
            tpd.tp_DescResumo AS TipoDiscagem,
            l.id_TipoAgenda,
            l.id_Usuario,
            l.id_GrupoUsuario,
            l.lig_Telefone AS Telefone,
            l.id_Ligacao_Principal,
            l.lig_Calc_SegTempoDiscando AS SegundosDiscando,
            l.lig_Calc_SegTempoChamando AS SegundosChamando,
            l.lig_Calc_SegTempoSinalizacao AS SegundosSinalizacao,
            l.lig_Calc_SegTempoConectado AS SegundosConectado,
            t.tab_Desc AS TabuladoComo,
            ct.cat_Desc AS Categoria,	
            t1.tab_Desc AS TabuladoComo_Resultado,
            ct1.cat_Desc AS Categoria_Resultado	
        FROM camp${id}.ligacao AS l
        INNER JOIN universal.statusligacao AS stl ON stl.id_StatusLigacao = l.id_StatusLigacao
        INNER JOIN universal.tipodiscagem AS tpd ON tpd.id_TipoDiscagem = l.id_TipoDiscagem
        LEFT JOIN camp${id}.planilha AS p ON p.id_Planilha = l.id_Planilha
        LEFT JOIN camp${id}.crmplanilha AS cp ON cp.id_Planilha = l.id_Planilha
        LEFT JOIN camp${id}.historicotab AS h ON h.id_HistoricoTab = l.id_HistoricoTab 
        LEFT JOIN camp${id}.historicotab AS h1 ON h1.id_HistoricoTab = l.id_HistoricoTab_Resultado
        LEFT JOIN camp${id}.tabulacao AS t ON t.id_Tabulacao = h.id_Tabulacao
        LEFT JOIN camp${id}.categoria AS ct ON ct.id_Categoria = t.id_Categoria  
        LEFT JOIN camp29.tabulacao AS t1 ON t1.id_Tabulacao = h1.id_Tabulacao
        LEFT JOIN camp29.categoria AS ct1 ON ct1.id_Categoria = t1.id_Categoria 
        ${filtros}
    `;

    const queryHandler = new QueryHandler();
    const conn = await queryHandler.getConnection();

    var results = [];

    try {
        await conn.connect();
        var [rows, fields] = await conn.query(query);

        rows.map(row=>{
            if (row.TabuladoComo == "VENDA") console.log("VENDA__")
        })
        

        console.log(rows.length, 'Ligacoes encontradas.');
        results = rows.map(removeNullProperties);
    } catch (e) {
        console.log('Erro ao buscar as ligacoes', e);
    } finally {
        await conn.end();
    }

    console.log("Ligacoes encontrados:", results.length);

    return res.status(200).json(results);
}
