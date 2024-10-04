import QueryHandler from '@/components/mysql/QueryHandler';
const queryHandler = new QueryHandler();

function buildFilter(data) {
    var { 
        CampanhasData, 
        DataImportacao = [], 
        DataTabulacao = [],
        DataEvento = [], 
        RemoverBlackList = false,
        RemoverErroDeCadastro = false,
        RemoverFinalizadoImportacao = false,
        kpiTrabalhado = false,
        Lotes = [],
        Fornecedor = false
    } = data || {};

    if (!Array.isArray(CampanhasData) && CampanhasData.length == 0) return "";

    var filter = "";

    if (Array.isArray(DataImportacao) && DataImportacao.length == 2) {
        if (!DataImportacao[0]) {
            DataImportacao[0] = new Date();
            DataImportacao[0].setHours(0, 0, 0, 0);
        }

        if (!DataImportacao[1]){
            DataImportacao[1] = new Date();
            DataImportacao[1].setHours(23, 59, 59, 999);
        }

        DataImportacao[0] = queryHandler.DateToSQL(new Date(DataImportacao[0]));
        DataImportacao[1] = queryHandler.DateToSQL(new Date(DataImportacao[1]));

        filter += `p.plan_DataImportacao BETWEEN '${DataImportacao[0]}' AND '${DataImportacao[1]}'`;
    }

    if ((Array.isArray(DataTabulacao) && DataTabulacao.length == 2) || (Array.isArray(DataEvento) && DataEvento.length == 2)) {
        if (!DataTabulacao[0]) {
            DataTabulacao[0] = new Date();
            DataTabulacao[0].setHours(0, 0, 0, 0);
        }

        if (!DataTabulacao[1]){
            DataTabulacao[1] = new Date();
            DataTabulacao[1].setHours(23, 59, 59, 999);
        }

        DataTabulacao[0] = queryHandler.DateToSQL(new Date(DataTabulacao[0]));
        DataTabulacao[1] = queryHandler.DateToSQL(new Date(DataTabulacao[1]));

        if (filter) filter += " AND ";
        filter += `h.his_DataEvento BETWEEN '${DataTabulacao[0]}' AND '${DataTabulacao[1]}'`;
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

    if (filter.length > 0) filter = `AND ${filter}`;

    return filter;        
}


export default async function getVendas(req, res) {
    const body = req.body || {};
    var { CampanhasData = [] } = body;

    if (!Array.isArray(CampanhasData) || !CampanhasData.length) return res.status(400).json({ error: true, message: 'Campanhas inválidas!' });    

    CampanhasData = CampanhasData[0];    
    const { id } = CampanhasData;
    const filtro = buildFilter(body);//"AND h.his_DataEvento BETWEEN '2024-09-01 00:00:00' AND '2024-09-10 23:59:59'";

    const query = `
        WITH HistoricoFiltrado AS (
            SELECT 
                h.id_HistoricoTab, 
                h.id_Planilha, 
                h.id_StatusSucesso, 
                h.his_DataEvento,
                h.id_Usuario,    
                h.id_Auditoria,
                h.id_Tabulacao,
                ROW_NUMBER() OVER (PARTITION BY h.id_Planilha ORDER BY h.id_HistoricoTab DESC) AS rn
            FROM camp${id}.historicotab h
            WHERE h.id_StatusSucesso IS NOT NULL
        ),
        VendasRecente AS (
            SELECT 
                v.id_Venda, 
                v.id_Planilha, 
                v.ven_Total, 
                ROW_NUMBER() OVER (PARTITION BY v.id_Planilha ORDER BY v.id_Venda DESC) AS rn
            FROM camp${id}.venda v
        )
        SELECT 
            h.id_HistoricoTab, 
            h.id_Planilha AS NrLead, 
            v.id_Venda, 
            v.ven_Total AS Receita, 
            stts.sts_Desc AS StatusSucesso,
            h.his_DataEvento AS DataEvento,
            h.id_Usuario,      
            h.id_Auditoria,
            a.aud_DataLancamento AS DataAuditoria,
            a.id_Ligacao,
            p.plan_DataImportacao AS DataImportacaoLead
        FROM HistoricoFiltrado h
        JOIN VendasRecente v ON h.id_Planilha = v.id_Planilha
        LEFT JOIN camp${id}.planilha AS p ON h.id_Planilha = p.id_Planilha
        LEFT JOIN camp${id}.crmplanilha AS cp ON cp.id_Planilha = h.id_Planilha
        LEFT JOIN camp${id}.tabulacao AS t ON h.id_Tabulacao = t.id_Tabulacao
        LEFT JOIN camp${id}.categoria AS ct ON t.id_Categoria = ct.id_Categoria
        LEFT JOIN camp${id}.auditoria AS a ON h.id_Auditoria = a.id_Auditoria
        LEFT JOIN universal.statussucesso AS stts ON stts.id_StatusSucesso = h.id_StatusSucesso
        WHERE h.rn = 1 AND v.rn = 1
        ${filtro}
    `;
    
    const conn = await queryHandler.getConnection();
    var results = [];

    try {
        await conn.connect();
        var [rows, fields] = await conn.query(query);

        console.log(rows.length, 'Vendas encontradas.');
        results = [...rows];
    }catch(e){
        console.log('Erro ao buscar as vendas', e);
    }finally{
        await conn.end();
    }

    console.log("Leads encontradas:", results.length);

    return res.status(200).json(results);
}
  