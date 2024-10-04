import mysql from 'mysql2/promise';

export default class QueryHandler {
    constructor() {

    }

    async getConnection(type = 'argus') {
        if (type == 'argus') 
            return await mysql.createConnection({
                host: process.env.DB_ARGUS_HOST,
                user: process.env.DB_ARGUS_USER,
                password: process.env.DB_ARGUS_PASS,
                port: process.env.DB_ARGUS_PORT,
            });
        if (type == 'ocean')
            return await mysql.createConnection({
                host: process.env.DB_OCEAN_HOST,
                user: process.env.DB_OCEAN_USER,
                password: process.env.DB_OCEAN_PASS,
                port: process.env.DB_OCEAN_PORT,
            });
    }

    DateToSQL(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda
        const day = String(date.getDate()).padStart(2, '0'); // Adiciona zero à esquerda
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
      
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    sanitazeName(name, removeDash = true) {
        if (typeof name !== 'string') return '';
        if (removeDash) name = name.replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
        return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '_').toUpperCase();
    }

    buildFilter(data) {
        var { 
            Campanhas, 
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
    
        if (!Array.isArray(Campanhas) && Campanhas.length == 0) return "";
    
        var filter = "";
    
        if (Array.isArray(DataImportacao) && DataImportacao.length == 2) {
            if (!DataImportacao[0]) DataImportacao[0] = new Date();     
            if (!DataImportacao[1]) DataImportacao[1] = new Date();
            

            DataImportacao[0].setHours(0, 0, 0, 0);
            DataImportacao[1].setHours(23, 59, 59, 999);
    
            DataImportacao[0] = this.DateToSQL(new Date(DataImportacao[0]));
            DataImportacao[1] = this.DateToSQL(new Date(DataImportacao[1]));
    
            filter += `p.plan_DataImportacao BETWEEN '${DataImportacao[0]}' AND '${DataImportacao[1]}'`;
        }
    
        if ((Array.isArray(DataTabulacao) && DataTabulacao.length == 2) || (Array.isArray(DataEvento) && DataEvento.length == 2)) {
            if (!DataTabulacao[0]) DataTabulacao[0] = new Date();    
            if (!DataTabulacao[1]) DataTabulacao[1] = new Date();            

            DataTabulacao[1].setHours(23, 59, 59, 999);
            DataTabulacao[0].setHours(0, 0, 0, 0);
    
            DataTabulacao[0] = this.DateToSQL(new Date(DataTabulacao[0]));
            DataTabulacao[1] = this.DateToSQL(new Date(DataTabulacao[1]));
    
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
    
        if (filter.length > 0) filter = `WHERE ${filter}`;

        return filter;        
    }
};