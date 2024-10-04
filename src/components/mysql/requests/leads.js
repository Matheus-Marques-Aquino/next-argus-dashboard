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
        Fornecedor = false,
        Origem = [],
        Campaign=[]
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
        if (!DataTabulacao[1]) DataTabulacao[1] = DataTabulacao[0];

        DataTabulacao[0] = new Date(DataTabulacao[0]);
        DataTabulacao[1] = new Date(DataTabulacao[1]);

        DataTabulacao[0].setHours(0, 0, 0, 0);
        DataTabulacao[1].setHours(23, 59, 59, 999);

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

    if (Origem && Array.isArray(Origem) && Origem.length > 0) {        
        var origens = [];
        
        Origem.forEach(origem => {
            origens.push(`'Source: ${origem}'`);
            origens.push(`'Origem: ${origem}'`);
            origens.push(`'${origem}'`);
        });

        if (origens.length > 0) {
            if (filter) filter += " AND ";
            filter += `p.cp.crm_Origem IN (${origens.join(",")})`;
        }

    }

    if (Campaign && Array.isArray(Campaign) && Campaign.length > 0) {
        var campaigns = [];
        
        Campaign.forEach(campaign => {
            campaigns.push(`'Campaign: ${campaign}'`);
            campaigns.push(`'Campanha: ${campaign}'`);
            campaigns.push(`'${campaign}'`);
        });

        if (campaigns.length > 0) {
            if (filter) filter += " AND ";
            filter += `p.cp.crm_Origem IN (${campaigns.join(",")})`;
        }
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

    //if (RemoverBlackList) tabuladoComo = [...tabuladoComo, ...["TELEFONE BLOQUEADO - PROCON", "TELEFONE BLOQUEADO - BLOCK LIST", "BLOCK LIST - MANUAL VENDA", "BLOCK LIST"]];
    //if (RemoverErroDeCadastro) categoria = [...categoria, "ERRO DE CADASTRO"];
    //if (RemoverFinalizadoImportacao) categoria = [...categoria, "FINALIZADO IMPORTAÇÃO"];

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

function customStringExtractor(value, input) {
    input = input += ": ";

    const sourceIndex = value.indexOf(input);
    if (sourceIndex === -1) return value;

    let start = sourceIndex + input.length;
    while (value[start] === ' ') start++;
    if (start >= value.length) return "";


    let end = value.indexOf(' ', start);
    let nextColon = value.indexOf(':', start);

    if (nextColon !== -1 && nextColon < end) return "";
    if (end === -1) end = value.length;

    return value.substring(start, end);
}  

export default async function getLeads(body) {   
    var { CampanhasData = [], RemoverBlackList = false, RemoverErroDeCadastro = false, RemoverFinalizadoImportacao = false } = body || {};

    if (!Array.isArray(CampanhasData) || !CampanhasData.length) return { error: true, message: 'Campanhas inválidas!' };    

    CampanhasData = CampanhasData[0];    
    const { id, sanitaze } = CampanhasData;
    const filtro = buildFilter(body);

    console.log(filtro)

    const query = `
        SELECT
            p.id_Campanha, 
            c.camp_desc AS Campanha,
            p.id_Planilha AS NrLead, 
            h.id_Tabulacao, 
            p.id_Lote,  
            op.ori_Desc AS OrigemPlanilha,
            p.plan_DataImportacao AS DataImportacaoPlanilha, 
            stp.sit_Desc AS SituacaoLead,
            p.plan_TrabalhadoOper, 
            p.plan_TrabalhadoDisc, 
            h.id_HistoricoTab, 
            ort.otb_Desc AS OrigemTabulacao,
            h.his_DataEvento AS DataTabulacao, 
            ct.cat_Desc AS Categoria,
            ct.cat_Contatado AS Contatado,
            ct.cat_Contatado_Efetivo AS ContatoEfetivo,
            t.tab_Sigla AS TabuladoSigla,
            t.tab_Desc AS TabuladoComo,
            h.id_Usuario,  
            h.id_Usuario_Supervisor, 
            h.id_Usuario_Lancamento, 
            h.his_Historico AS Historico,
            h.his_DataLancamento AS DataLancamento, 
            h.id_StatusSucesso, 
            stts.sts_Desc AS StatusSucesso,
            h.his_TabInicial, 
            h.id_HistoricoTab_Anterior, 
            h.id_HistoricoTab_AnteriorAberta, 
            h.id_HistoricoTab_Reabrir, 
            h.id_Auditoria, 
            h.id_GrupoUsuario,
            cp.crm_Codigo AS CrmCodigo, 
            cp.crm_Integracao AS CrmIntegracao, 
            cp.crm_Nome AS Nome, 
            cp.crm_Email AS Email, 
            cp.crm_Obs AS Observacao, 
            cp.crm_Detalhes AS Detalhes,
            cp.crm_CodLeadFornecedor CodLeadFornecedor, 
            cp.crm_CodLeadOrigem AS CodOrigemLead, 
            cp.crm_Origem AS Origem,  
            cp.crm_Fornecedor AS Fornecedor, 
            cp.crm_Info0 AS Info0, 
            cp.crm_Info1 AS Info1, 
            cp.crm_Info2 AS Info2, 
            cp.crm_Info3 AS Info3, 
            cp.crm_Info4 AS Info4
            FROM camp${id}.historicotab h
            LEFT JOIN camp${id}.planilha AS p ON p.id_Planilha = h.id_Planilha
            LEFT JOIN dominiox.campanha AS c ON p.id_Campanha = c.id_Campanha
            LEFT JOIN camp${id}.tabulacao AS t ON h.id_Tabulacao = t.id_Tabulacao
            LEFT JOIN camp${id}.categoria AS ct ON t.id_Categoria = ct.id_Categoria
            LEFT JOIN camp${id}.crmplanilha AS cp ON cp.id_Planilha = h.id_Planilha 
            LEFT JOIN universal.origemplanilha AS op ON p.id_OrigemPlanilha = op.id_OrigemPlanilha 
            LEFT JOIN universal.situacaoplanilha AS stp ON p.id_SituacaoPlanilha = stp.id_SituacaoPlanilha 
            LEFT JOIN universal.origemtabulacao AS ort ON ort.id_OrigemTabulacao = h.id_OrigemTabulacao 
            LEFT JOIN universal.statussucesso AS stts ON stts.id_StatusSucesso = h.id_StatusSucesso
            LEFT JOIN universal.ativo AS a ON a.id_Ativo = c.id_Ativo 
            ${filtro}
    `;

    
    const conn = await queryHandler.getConnection();

    var results = {};

    try {
        await conn.connect();

        var [rows, fields] = await conn.query(query);
        var doubles = {};

        console.log(rows.length, 'Leads encontradas.');

        if (Array.isArray(rows)) rows = rows.sort((a, b)=>{
            a = new Date(a.DataLancamento);
            b = new Date(b.DataLancamento);
            return b - a;
        });

        var removeLeads = [];

        for (const result of rows) {
            let categoria = result['Categoria'] || "";
            let tabuladoComo = result['TabuladoComo'] || "";   

            if (tabuladoComo == 'TELEFONE BLOQUEADO - BLOCK LIST' || tabuladoComo == 'TELEFONE BLOQUEADO - PROCON' || tabuladoComo == 'BLOCK LIST - MANUAL') tabuladoComo = 'BLOCK LIST';

            if (tabuladoComo == 'BLOCK LIST' && RemoverBlackList) {
                removeLeads.push(result['NrLead']);
                continue;
            }

            if (categoria == 'ERRO DE CADASTRO' && RemoverErroDeCadastro) {
                removeLeads.push(result['NrLead']);
                continue;
            }

            if (categoria == 'FINALIZADO IMPORTAÇÃO' && RemoverFinalizadoImportacao) {
                removeLeads.push(result['NrLead']);
                continue;
            }
        }

        for (const result of rows) {
            if (removeLeads.includes(result['NrLead'])) continue;

            if (!results['Categoria']) results['Categoria'] = {};
            if (!doubles['Categoria']) doubles['Categoria'] = [];

            if (!results['Contatado']) results['Contatado'] = 0;
            if (!doubles['Contatado']) doubles['Contatado'] = [];

            if (!results['ContatoEfetivo']) results['ContatoEfetivo'] = 0;
            if (!doubles['ContatoEfetivo']) doubles['ContatoEfetivo'] = [];

            if (!results['TabuladoComo']) results['TabuladoComo'] = {};
            if (!doubles['TabuladoComo']) doubles['TabuladoComo'] = [];

            if (!results['ForaDeTarget']) results['ForaDeTarget'] = {};
            if (!doubles['ForaDeTarget']) doubles['ForaDeTarget'] = [];

            if (!results['Origem']) results['Origem'] = { 'Source': { ['Total']: 0 }, 'Campaign': { ['Total']: 0 } };
            if (!doubles['Origem']) doubles['Origem'] = [];            

            let categoria = result['Categoria'] || "";
            let tabuladoComo = result['TabuladoComo'] || "";   
            let contatado = result['Contatado'] || "";   
            let contatoEfetivo = result['ContatoEfetivo'] || "";
            let origem = result['Origem'] || "";
            
            if (categoria == 'OFFTARGET' || categoria == 'FORA DO TARGET') categoria = 'FORA DE TARGET';
            if (tabuladoComo == 'AGI AINDA NÃO PASSEI PLANEJAMENTO' || tabuladoComo == 'AGI PASSEI PLANEJAMENTO') tabuladoComo = 'AGENDAMENTO INDIVIDUAL';
            if (tabuladoComo == 'TELEFONE BLOQUEADO - BLOCK LIST' || tabuladoComo == 'TELEFONE BLOQUEADO - PROCON' || tabuladoComo == 'BLOCK LIST - MANUAL') tabuladoComo = 'BLOCK LIST';

            if (!results['Categoria'][categoria]) results['Categoria'][categoria] = 0;
            
            if (!doubles['Categoria'].includes(result['NrLead'])) {
                if (!results['Categoria']['Total']) results['Categoria']['Total'] = 0;
                doubles['Categoria'].push(result['NrLead']);
                results['Categoria'][categoria]++;
                results['Categoria']['Total']++;

                if (!doubles['Contatado'].includes(result['NrLead']) && contatado == 'S') {
                    doubles['Contatado'].push(result['NrLead']);
                    results['Contatado']++;
                }

                if (!doubles['ContatoEfetivo'].includes(result['NrLead']) && contatoEfetivo == 'S') {
                    doubles['ContatoEfetivo'].push(result['NrLead']);
                    results['ContatoEfetivo']++;
                }
            
                if (!doubles['TabuladoComo'].includes(result['NrLead'])) {
                    if (!results['TabuladoComo']['Total']) results['TabuladoComo']['Total'] = 0;
                    if (!results['TabuladoComo'][tabuladoComo]) results['TabuladoComo'][tabuladoComo] = 0;
                    doubles['TabuladoComo'].push(result['NrLead']);
                    results['TabuladoComo'][tabuladoComo]++;
                    results['TabuladoComo']['Total']++;

                    if (!doubles['ForaDeTarget'].includes(result['NrLead']) && categoria == 'FORA DE TARGET') {
                        if (!results['ForaDeTarget']['Total']) results['ForaDeTarget']['Total'] = 0;
                        if (!results['ForaDeTarget'][tabuladoComo]) results['ForaDeTarget'][tabuladoComo] = 0;
                        doubles['ForaDeTarget'].push(result['NrLead']);
                        results['ForaDeTarget'][tabuladoComo]++;
                        results['ForaDeTarget']['Total']++;
                    }
                }

                if (origem && !doubles['Origem'].includes(result['NrLead'])) {
                    origem = customStringExtractor(origem, 'Origem');
                    if (!origem) origem = customStringExtractor(origem, 'Source');
                    if (!origem) origem = result['Origem'];
                    let campaign = customStringExtractor(origem, 'Camapanha');
                    if (!campaign) campaign = customStringExtractor(origem, 'Campaign');
                    
                    if (!results['Origem']['Source'][origem]) results['Origem']['Source'][origem] = 0;
                    if (!results['Origem']['Campaign'][origem]) results['Origem']['Campaign'][origem] = 0;
                    doubles['Origem'].push(result[origem]);                    
                    results['Origem']['Source'][origem]++;
                    results['Origem']['Campaign'][origem]++;
                    results['Origem']['Source'][origem]++;
                    results['Origem']['Campaign'][origem]++;
                }
            }
        }
    }catch(e){
        console.log('Erro ao buscar as leads', e);
    }finally{
        await conn.end();
    }

    console.log("Leads encontradas:", results);

    return results;
}
  