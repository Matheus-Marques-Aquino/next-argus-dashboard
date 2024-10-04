function getTabulacoes({id}, filters="") {
    return `
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
        ${filters}
    `;
}


module.exports = { getTabulacoes };