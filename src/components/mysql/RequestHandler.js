import updateMetas from "./requests/metas/atualizar";
import getMetas from "./requests/metas";

import getUsuarios from "./requests/usuarios";
import getMetricasUsuarios from "./requests/usuarios/metricas";

import getCampaigns from "./requests/campaigns";
import getCampanhas from "./requests/campanhas";
import getLeads from "./requests/leads";
import getLigacoes from "./requests/ligacoes";
import getVendas from "./requests/vendas";
import getLotes from "./requests/lotes";

export default class RequestHandler {
    constructor() {
        this.requests = {
            metas: {
                update: updateMetas,
                get: getMetas
            },
            usuarios: {
                get: getUsuarios,
                metricas: getMetricasUsuarios
            },
            campaigns: getCampaigns,
            campanhas: getCampanhas,
            leads: getLeads,
            ligacoes: getLigacoes,
            vendas: getVendas,
            lotes: getLotes
        };
    }
};