import { React, useRef, useEffect, useState } from "react";

import DatePicker, { registerLocale } from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";

registerLocale("pt-BR", ptBR);

import axios from "axios";

import "react-datepicker/dist/react-datepicker.css";

import Select from 'react-select';

import DistinctCard from "@/components/dash-argus/DistinctCard";
import UsersCard from "@/components/dash-argus/UsersCard";
//import UserModal from "@/components/dash-argus/UserModal";
import NewUserModal from "@/components/dash-argus/NewUserModal";

import CalendarHandler from "@/components/utilities/CalendarHandler";
//import { set } from "date-fns";

import MetasModal from "@/components/dash-argus/MetasModal";
//import { Edit } from "lucide-react";

function sanitazeName(name, removeDash = false) {
  if (typeof name !== 'string') return '';
  if (removeDash) name = name.replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '_').toUpperCase();
}

function removeNullProperties(doc) {
  return Object.fromEntries(
    Object.entries(doc).filter(([_, value]) => (value !== null && value !== "null" && value !== "" && value !== undefined))
  );
}

function refactoryDate(date) {
  date = new Date(date);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

const LotesConteiner = ({lotes = [], campanhas, remove}) => {
  if (!lotes || !Array.isArray(lotes) || lotes.length < 0) return (<></>);

  const Cell = ({value, label, remove}) => {
    return (      
      <div className="text-white bg-blueDefault opacity-80 w-fit h-fit flex border border-[1px] border-white rounded-[5px]">
        <div className="text-[12px] h-fit my-auto px-[8px] py-1 border-r border-r-white border-r-[1px]">{label}</div>
        <div 
          className="w-fit h-fit my-auto px-[8px] cursor-pointer hover:opacity-100 text-[12px]" 
          onClick={()=>{console.log("Remove Lote"); remove(value)}}
        >X</div>
      </div>
    )
  }

  //console.log(campanhas, lotes)
  
  return (
    <div className="flex flex-wrap mt-2 gap-x-[6px]">
      {lotes.map((lote, index) => {
        const { value, label } = lote;
        return (<Cell key={"lote_" + index} value={value} label={label} remove={remove} />)
      })}
    </div>
  );
};

const formatDigits = (value) => {
  if (!value) return 0;

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const headers = {
  'Content-Type': 'application/json'
}

export default function Home() {
  const [metas, setMetas] = useState({
    AZOS: 90000,
    AZOS_NOVO: 90000,
    BRADESCO_ODONTO: 90000,
    BRADESCO_VIDA: 25000,
    CAMPANHA_TESTE: 90000,
    CICLIC_CELULAR: 90000,
    CICLIC_PET: 90000,
    CICLIC_RESIDENCIAL: 90000,
    CICLIC_SAUDE_PROTEGIDA: 90000,
    CICLIC_VIAGEM: 90000,
    CONSORCIO_ANA: 7000000,
    CONSORCIO_INGRID_: 7000000,
    CONSORCIO_WILLIAM: 8000000,
    COQUETEL: 90000,
    CREDITO_CONSIGNADO: 90000,
    FATURA_BARATA: 90000,
    KAKAU_SEGUROS: 20000,
    MAX_VIDA: 200000,
    MULTI__PRODUTOS: 20000,
    MY_TRAVEL: 90000,
    PANINI: 600000,
    PETLOVE: 20000,
    PRIME_AUTO: 90000,
    PRIME_SAUDE: 15000,
    PRIME_SAUDE_GARANTIDA: 90000,
    PRIME_TRAVEL: 9000,
    QUALICORP: 90000,
    SANTANDER_VIDA: 9000,
    SULAMERICA_GERAL: 90000,
    SULAMERICA_ODONTO: 9000,
    SULAMERICA_VIAGEM: 90000,
    SULAMERICA_VIDA: 25000,
    SULAMERICA_VIDA_HELO: 25000,
    TRIP_CHIP: 90000
  });

  const [calendario, setCalendar] = useState(new CalendarHandler());
  const [loading, setLoading] = useState(false);
  const [lote, setLotes] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [categorias, setCategorias] = useState({}); 
  const [receitas, setReceitas] = useState({});
  const [usuarios, setUsuarios] = useState({});
  const [tabulacao, setTabulacao] = useState({});
  const [tabulacoes, setTabulacoes] = useState({});
  const [vendas, setVendas] = useState({});
  const [ligacoes, setLigacoes] = useState({});
  //const [faturamento, setFaturamento] = useState({});
  const [dashData, setDashData] = useState({
    qtdLeads: 0,
    completamento: 0,
    contatoEfetivo: 0,
    vendas: 0,
    faturamento: 0,
    taxaConversao: 0,
    ticketMedio: 0
  });

  const getFirstDayOfMonth = (mes, ano) => {
    const month = parseInt(mes) - 1;
    const year = parseInt(ano);
    const firstDay = new Date(year, month, 1);

    return firstDay;
  }

  const getLastDayOfMonth = (mes, ano) => {
    const month = parseInt(mes) - 1;
    const year = parseInt(ano);
    const lastDay = new Date(year, month + 1, 0);
    lastDay.setHours(23, 59, 59, 999);

    return lastDay;
  }

  //const [metricas, setMetricas] = useState({});
  const metricas = useRef({});
  const [data, setData] = useState({});

  const [filtro, setFiltro] = useState(["KPI", "DataImportacao", "DataTabulacao", "Campanha", "Canal", /*"Origem", "Campaign",*/ "Lote", "RemoverErroDeCadastro", "RemoverBlackList", "RemoverFinalizadoImportacao"]);	

  const [filtroKPI, setFiltroKPI] = useState(0);
  const [filtroCampanhas, setFiltroCampanhas] = useState([]);
  const [filtroDataImportacao, setFiltroDataImportacao] = useState([getFirstDayOfMonth(new Date().getMonth() + 1, new Date().getFullYear()), getLastDayOfMonth(new Date().getMonth() + 1, new Date().getFullYear())]);
  const [filtroDataTabulacao, setFiltroDataTabulacao] = useState([getFirstDayOfMonth(new Date().getMonth() + 1, new Date().getFullYear()), getLastDayOfMonth(new Date().getMonth() + 1, new Date().getFullYear())]);

  const [filtroCanal, setFiltroCanal] = useState([]);
  const [filtroLote, setFiltroLote] = useState([]);
  const [filtroOrigem, setFiltroOrigem] = useState([]);
  const [filtroCampaign, setFiltroCampaign] = useState([]);

  const [selectedLotes, setSelectedLotes] = useState([]);
  const [selectedOrigens, setSelectedOrigens] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [offTarget, setOffTarget] = useState({});

  const [metaMensal, setMetaMensal] = useState({
    metaVendas: 100,
    metaFaturamento: 100,
    vendaDia: 0,
    faturamentoDia: 0,
    starting: true
  });

  const [ready, setReady] = useState(false);
  const [editarMetas, setEditarMetas] = useState(false);  

  const updateMetas = async (data) => {
    var _metas = {...metas, ...data};
    console.log("Metas Atualizadas:", _metas);
    setMetas(_metas);    
  }

  const initMetas = async () => {
    const primeiroDia = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0, 0);
    const ultimoDia = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
    
    const payload = {
      DataTabulacao: [primeiroDia, ultimoDia],	
      Campanhas: filtroCampanhas,
      CampanhasData: getCampanhasData(filtroCampanhas)
    };    

    var camp = "";

    var results = {};

    //console.log(payload)

    await axios.post("https://22dzrq2jme.execute-api.sa-east-1.amazonaws.com/default/dashboard-argus-rds", { ...payload, endpoint: 'leads' }, { timeout: 0, headers })
      .then((response) => {
        var { data } = response || {};      
        var { Categoria = {} } = data;

        camp = payload.CampanhasData[0].sanitaze;

        if (!results[camp]) results[camp] = {};
        results = { [camp]: { qtdLeads: Categoria['Total'] } };

        console.log('Meta Result 1:', results);
      })
      .catch((error) => {
        if (error && error.response) error = error.data ?? error;
        console.log("Ocorreu um erro ao recuperar os Leads:", error);
      });

    await axios.post("https://22dzrq2jme.execute-api.sa-east-1.amazonaws.com/default/dashboard-argus-rds", { ...payload, endpoint: 'vendas' }, { timeout: 0, headers })
      .then((response) => {
        const { data = [] } = response || [];        
        var faturamento = 0;

        camp = payload.CampanhasData[0].sanitaze;

        data.forEach((venda)=>{ if (venda && venda.Receita) faturamento += parseFloat(venda.Receita); })

        if (!results[camp]) results[camp] = {};
        results = { [camp]: { ...results[camp], vendas: data.length, faturamento } };

        console.log('Meta Result 2:', results);
      })
      .catch((error) => {
        if (error && error.response) error = error.data ?? error;
        console.log("Ocorreu um erro ao recuperar os Vendas:", error);
      });

    if (!camp) return;

    //  payload.DataEnvio = payload.DataTabulacao;
    //  delete payload.DataTabulacao;

    //await axios.post("https://22dzrq2jme.execute-api.sa-east-1.amazonaws.com/default/dashboard-argus-rds", { ...payload, endpoint: 'ligacoes' }, { timeout: 0, headers })
    //  .then((response) => {
    //    const { data = [] } = response || [];
    //
    //    const camp = payload.CampanhasData[0].sanitaze;
    //    results = { [camp]: { ...results[camp], ligacoes: data } };
    //  
    //    console.log('Meta Result 3:', results);
    //  })
    //  .catch((error) => {
    //    if (error && error.response) error = error.data ?? error;
    //    console.log("Ocorreu um erro ao recuperar os Ligacoes:", error);
    //  });

    results[camp].diasNoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    results[camp].diasTrabalhados = (new Date().getDate()) ?? 1;
    results[camp].diasRestantes = (results[camp].diasNoMes - results[camp].diasTrabalhados) ?? 1;

    results[camp].metaFaturamento = 9000;
    results[camp].faturamentoRestante = results[camp].metaFaturamento - results[camp].faturamento;
    results[camp].ticketMedio = (results[camp].vendas) ? results[camp].faturamento / results[camp].vendas : 0;
    results[camp].vendaDia = results[camp].faturamentoRestante / results[camp].ticketMedio / results[camp].diasRestantes;
    results[camp].faturamentoDia = (results[camp].ticketMedio) ? results[camp].vendaDia * results[camp].ticketMedio : 0;    
    
    results = { ...results };
    console.log('Meta Mensal Result:', results);
    return;    
  };  

  const buildFilters = () => {
    var payload = {};

    if (!Array.isArray(filtro) || !filtro.length) return payload;

    if (filtroKPI == 1) payload.kpiTrabalhado = "S";
    else delete payload.kpiTrabalhado;

    if (filtro.includes("DataImportacao")) payload.DataImportacao = filtroDataImportacao ?? [null, null];
    
    if (filtro.includes("DataTabulacao")) payload.DataTabulacao = filtroDataTabulacao ?? [null, null];
    
    if (filtro.includes("Campanha")) {
      payload.Campanhas = filtroCampanhas || null;
      payload.CampanhasData = getCampanhasData(filtroCampanhas);
    }
    
    if (filtro.includes("Lote") && selectedLotes.length > 0) payload.Lotes = selectedLotes.map(l => l.id);

    if (filtro.includes("Canal") && filtroCanal && filtroCanal.value) payload.Fornecedor = filtroCanal.value;

    //if (filtro.includes("Origem") && filtroOrigem && filtroOrigem.value) payload.Origem = filtroOrigem;
    
    //if (filtro.includes("Campaign") && filtroCampaign && filtroOrigem.value) payload.Campaign = filtroCampaign;    


    if (filtro.includes("RemoverErroDeCadastro")) payload.RemoverErroDeCadastro = true;

    if (filtro.includes("RemoverBlackList")) payload.RemoverBlackList = true;

    if (filtro.includes("RemoverFinalizadoImportacao")) payload.RemoverFinalizadoImportacao = true;       

    payload = removeNullProperties(payload);

    console.log("Payload:", payload);

    return payload;
  };
  
  const loadingHandler = (camps, value) => {
    const _campanhas = campanhas.map((camp) => {
      const name = sanitazeName(camp.Campanha, true);
      if (camps.includes(name)) return { ...camp, ready: value };
      else return camp;
    });

    setCampanhas(_campanhas);
  };

  const processarLotes = (data) => {
    if (!Array.isArray(data) || !data.length) return {};
    var result = {};

    for(var entry of data) {
      if (!entry || !entry.camp) continue;

      const { camp } = entry;
      delete entry.camp;

      if (!result.options) result.options = [];

      result.options.push({
        value: camp + "-" + entry.id_Lote, 
        label: refactoryDate(entry.DataInicio) + " - " + entry.Lote
      });      

      result[camp] = entry;
    }

    return result;
  }

  useEffect(()=>{
    if (ready && primeiraCampanha.current) {
      setFiltroCampanhas([primeiraCampanha.current.value]);      
      primeiraCampanha.current = null;
    }
  }, [ready]);

  useEffect(()=>{
    console.log('camps:', getCampanhasData(filtroCampanhas));
    if (metaMensal.starting) initMetas();
    if (filtroCampanhas.length > 0){ 
      setMetaMensal({...metaMensal, starting: false});
      updateData();
    }
    //if (!ready) setReady(true);
  }, [filtroCampanhas]);

  const getCampanhas = async () => {
    await axios.post("https://22dzrq2jme.execute-api.sa-east-1.amazonaws.com/default/dashboard-argus-rds", { endpoint: 'campanhas' }, { headers }).then(async (response) => {
      console.log("Campanhas encontradas.", response.data);
      const { data } = response;
      var camps = data.map((campanha)=> { return {...campanha, sanitaze: sanitazeName(campanha.Campanha, true), ready: true}; });
      camps.sort((a, b) => a.Campanha.localeCompare(b.Campanha));
      //const campanhas = data.map((campanha)=> { return sanitazeName(campanha.Campanha, true); });
      
      setCampanhas(camps); 
    })
    .catch((error) => {
      if (error && error.response) error = error.data ?? error;      
      console.log("Ocorreu um erro ao recuperar as Campanhas:", error);
    });
  };

  const getMetas = async () => {
    await axios.post("/api/argus/metas", { endpoint: 'metas' }, { headers }).then((response) => {
      console.log("Metas encontradas.", response.data);
      const { data } = response;
      setMetas({...metas, ...data});
    })
    .catch((error) => {
      if (error && error.response) error = error.data ?? error;      
      console.log("Ocorreu um erro ao recuperar as Metas:", error);
    });
  }

  const getLotes = async () => {
    const payload = buildFilters();

    await axios.post("https://22dzrq2jme.execute-api.sa-east-1.amazonaws.com/default/dashboard-argus-rds", { ...payload, endpoint: 'lotes' }, { timeout: 0, headers })
      .then((response) => {
        const { data } = response || {};

        const lotes = processarLotes(data);
        setLotes(lotes);

        //console.log('Lotes:', response.data);
      })
      .catch((error) => {
        if (error && error.response) error = error.data ?? error;
        console.log("Ocorreu um erro ao recuperar os Vendas:", error);
      });
  };

  const getCampanhasData = (camps) => {
    if (!Array.isArray(camps) || camps.length === 0) return [];
    var _camps = [];

    for (let camp of camps) {
      const _camp = campanhas.find((c) => c.sanitaze === camp);
      if (!_camp) continue;
      _camps.push({name: _camp.Campanha, sanitaze: _camp.sanitaze, id: _camp.id_Campanha});
    }

    return _camps;
  };

  const getLeadsData = async () => {
    const payload = buildFilters();

    await axios.post("https://22dzrq2jme.execute-api.sa-east-1.amazonaws.com/default/dashboard-argus-rds", { ...payload, endpoint: 'leads' }, { timeout: 0, headers })
      .then((response) => {
        var { data } = response || {};        
        var { Categoria = {}, Contato = {}, contatoEfetivo = {}, ForaDeTarget = {}, TabuladoComo = {} } = data;

        const camp = payload.CampanhasData[0].sanitaze;

        //console.log({...categorias, [camp]: Categoria })
        setCategorias({...categorias, [camp]: Categoria });
        setOffTarget({...offTarget, [camp]: ForaDeTarget });
        setTabulacoes({...tabulacoes, [camp]: TabuladoComo });        
        
        console.log('Leads Data:', response.data);
      })
      .catch((error) => {
        if (error && error.response) error = error.data ?? error;
        console.log("Ocorreu um erro ao recuperar os Leads:", error);
      });
  };

  const getVendasData = async () => {
    const payload = buildFilters();

    await axios.post("https://22dzrq2jme.execute-api.sa-east-1.amazonaws.com/default/dashboard-argus-rds", { ...payload, endpoint: 'vendas' }, { timeout: 0, headers })
      .then((response) => {
        const { data } = response || {};

        const camp = payload.CampanhasData[0].sanitaze;
        setVendas({...data, [camp]: {...data} });

        console.log('Vendas:', response.data);
      })
      .catch((error) => {
        if (error && error.response) error = error.data ?? error;
        console.log("Ocorreu um erro ao recuperar os Vendas:", error);
      });
  };

  const getUsuariosData = async () => {
    const payload = buildFilters();

    await axios.post("https://22dzrq2jme.execute-api.sa-east-1.amazonaws.com/default/dashboard-argus-rds", { ...payload, endpoint: 'usuarios' }, { timeout: 0, headers })
      .then((response) => {
        const { data } = response || {};
        const camp = payload.CampanhasData[0].sanitaze;

        setUsuarios({...usuarios, [camp]: { ...data } });
        console.log('Usuarios:', response.data);
      })
      .catch((error) => {
        if (error && error.response) error = error.data ?? error;
        console.log("Ocorreu um erro ao recuperar os Ususarios:", error);
      });
  };

  const getLigacoesData = async () => {
    const payload = buildFilters();

    await axios.post("https://22dzrq2jme.execute-api.sa-east-1.amazonaws.com/default/dashboard-argus-rds", { ...payload, endpoint: 'ligacoes' }, { timeout: 0, headers })
      .then((response) => {
        console.log('Ligacoes:', response.data);
        setLigacoes(response.data);
      })
      .catch((error) => {
        if (error && error.response) error = error.data ?? error;
        console.log("Ocorreu um erro ao recuperar os Ligacoes:", error);
      });
  };

  const processarMetricas = () => {
    var _metricas = {};

    try {
      for(let camp of filtroCampanhas) {
        if (!camp) continue;

        var _cat = categorias[camp];
        var _tab = tabulacoes[camp];
        var _vend = vendas[camp];

        console.log("b", camp, _cat, _tab, _vend);

        if (!_metricas[camp]) _metricas[camp] = {};

        if (_cat) {        
          if (metricas && metricas.current && metricas.current[camp]) {
            delete metricas.current[camp].qtdLeads;
            delete metricas.current[camp].foraDeTarget;
            delete metricas.current[camp].recusa;
            delete metricas.current[camp]._venda;
            delete metricas.current[camp].agi;
            delete metricas.current[camp].erroDeCadastro;
            delete metricas.current[camp].excessoDeTentativa;
            delete metricas.current[camp].blacklist;
          }

          for (var cat of Object.keys(_cat)) {
            if (cat === "Total") _metricas[camp].qtdLeads = _cat[cat];
            if (cat === "FORA DE TARGET") _metricas[camp].foraDeTarget = _cat[cat];
            if (cat === "RECUSA") _metricas[camp].recusa = _cat[cat];
            if (cat === "VENDA") _metricas[camp]._venda = _cat[cat];
            if (cat === "AGENDAMENTO INDIVIDUAL") _metricas[camp].agi = _cat[cat];
            if (cat === "ERRO DE CADASTRO") _metricas[camp].erroDeCadastro = _cat[cat];
          }  
        }
        
        if (_tab) {
          if (metricas && metricas.current && metricas.current[camp]) {
            delete metricas.current[camp].excessoDeTentativa;
            delete metricas.current[camp].blacklist;
          }

          for (var tab of Object.keys(_tab)) {
            if (tab === "EXCESSO DE TENTATIVA") _metricas[camp].excessoDeTentativa = _tab[tab];
            if (tab === "TELEFONE BLOQUEADO - BLOCK LIST" || tab === "TELEFONE BLOQUEADO - PROCON" || tab === "BLOCK LIST - MANUAL") _metricas[camp].blacklist = _tab[tab];
          }
        }

        if (_vend) {
          if (metricas && metricas.current && metricas.current[camp]) {
            delete metricas.current[camp].vendas;
            delete metricas.current[camp].faturamento;
          }

          for (let venda in _vend) {
            if (!venda) continue;
            //_metricas[camp].qtdLeads = _metricas[camp].qtdLeads ? _metricas[camp].qtdLeads + 1 : 1;
            _metricas[camp].vendas = Object.keys(_vend).length;
            _metricas[camp].faturamento = _metricas[camp].faturamento ? _metricas[camp].faturamento + parseFloat(_vend[venda]["Receita"]) : parseFloat(_vend[venda]["Receita"]);
          }
        }
        
        metricas.current[camp] = _metricas[camp];
      }
    }catch(e){
      console.log('Erro ao processar as metricas:', e);
    }

    console.log('1', _metricas)

    return _metricas
  }

  useEffect(() => {
    const _metricas = processarMetricas();
    calculateMetricas(_metricas);
  }, [categorias, tabulacoes, vendas]);

  const init = async () => {
    await getCampanhas();    
    //console.log(calendario.getWorkedDays());
    const interval = setInterval(() => { if (filtroCampanhas && filtroCampanhas[0]) updateData(); }, 1000 * 60 * 3);
  };

  useEffect(() => {
    if (!ready) init();

  }, []);


  const updateData = async () => {    
    var start = new Date();
    console.log("Atualizando Dados:", start);
    getMetas();
    getLeadsData();
    getVendasData();
    getUsuariosData();
    getLigacoesData();
    getLotes();
    //buildFilters();
  };

  const checkboxHandler = (e) => {
    let { name, checked } = e.target;
    if (checked) setFiltro([...filtro, name]);
    else setFiltro(filtro.filter((item) => item !== name));
  };

  const selectHandler = (e) => {
    let { value, label } = e;
    console.log("Select value:", value, 'label:', label);

    if (!value.includes('-')) return;

    let [ camp, id ] = value.split("-");
    var selected = selectedLotes.find((item) => item.label == label);
    
    if (!selected) setSelectedLotes([...selectedLotes, { value, label, id, camp}]);   
    setFiltroLote(e);    
  };

  const removeFromLote = (value) => {
    let _selecteds = selectedLotes.filter((item) => item.value !== value);
    setSelectedLotes(_selecteds);
    
    if (filtroLote.value === value) setFiltroLote(null);
  }

  var loteOptions = [];    
  if (lote && lote.options) loteOptions = lote.options;

  const calculateMetricas = (_metricas) => {
    //metricas = { ..._metricas, ...metricas };
    var _data = {
      qtdLeads: 0,
      foraDeTarget: 0,
      recusa: 0,
      vendas: 0,
      faturamento: 0,
      agi: 0,
      erroDeCadastro: 0,
      finalizadoImportacao: 0,
      completamento: 0,
      contatoEfetivo: 0,
      conversao: 0,
      conversaoContatoEfetivo: 0,
      ticketMedio: 0,
      excessoDeTentativa: 0,
      blackList: 0,
      projecaoVendas: 0,
      projecaoFaturamento: 0,
      metaVendas: 0,
      metaFaturamento: 0
    };    

    var {total: todosTrabalhados, trabalhado, trabalhar} = calendario.getWorkedDays();

    var diasTotal = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    var diasTrabalhados = new Date().getDate() ? new Date().getDate() : 1;
    var diasRestantes = diasTotal - diasTrabalhados;
    if (diasRestantes <= 0) diasRestantes = 1;
    

    for (let camp in _metricas) {
      if (!filtroCampanhas.includes(camp)) continue;
      if (!metricas || !_metricas || !_metricas[camp]) continue;

      var _meta = metas[camp] ?? 9000;
      
      var { 
        qtdLeads = 0, 
        foraDeTarget = 0, 
        recusa = 0, 
        _venda = 0, 
        vendas = 0, 
        faturamento = 0,
        agi = 0, 
        erroDeCadastro = 0,
        finalizadoImportacao = 0,
        excessoDeTentativa = 0,
        blackList = 0
      } = _metricas[camp];

      console.log(_metricas[camp])

      _data.qtdLeads += qtdLeads ? qtdLeads : 0;
      _data.foraDeTarget += foraDeTarget ? foraDeTarget : 0;
      _data.recusa += recusa ? recusa : 0;
      _data.vendas += vendas ? vendas : 0;
      _data.faturamento += faturamento ? faturamento : 0;
      _data.agi += agi ? agi : 0;
      _data.erroDeCadastro += erroDeCadastro ? erroDeCadastro : 0;
      _data.finalizadoImportacao += finalizadoImportacao ? finalizadoImportacao : 0;
      _data.excessoDeTentativa += excessoDeTentativa ? excessoDeTentativa : 0;
      _data.blackList += blackList ? blackList : 0;
    }

    if (_data.faturamento) _data.faturamento = Math.round(_data.faturamento * 100) / 100;
    if (_data.ticketMedio) _data.ticketMedio = Math.round(_data.ticketMedio * 100) / 100;

    if (_data.qtdLeads > 0) {      
      _data.completamento = (_data.agi + _data.foraDeTarget + _data.recusa + _data.vendas) / _data.qtdLeads * 100;
      _data.completamento = Math.round(_data.completamento); // * 1000) / 1000;
      _data.contatoEfetivo = (_data.agi + _data.recusa + _data.vendas) / _data.qtdLeads * 100;
      _data.contatoEfetivo = Math.round(_data.contatoEfetivo); // * 1000) / 1000;
      _data.conversao = _data.vendas / _data.qtdLeads * 100;
      _data.conversao = Math.round(_data.conversao); // * 1000) / 1000;
    }

    if (_data.vendas) {
      _data.conversaoContatoEfetivo = _data.vendas / (_data.agi + _data.recusa + _data.vendas) * 100;
      _data.conversaoContatoEfetivo = Math.round(_data.conversaoContatoEfetivo); //* 1000) / 1000;
      _data.ticketMedio = _data.faturamento / _data.vendas;
      _data.ticketMedio = Math.round(_data.ticketMedio * 100) / 100;  
    }
    
    if (diasTrabalhados > 0) {
      _data.projecaoVendas = _data.vendas / diasTrabalhados * diasTotal;
      _data.projecaoVendas = Math.round(_data.projecaoVendas * 100) / 100;
      _data.projecaoFaturamento = _data.faturamento / diasTrabalhados * diasTotal;
      _data.projecaoFaturamento = Math.round(_data.projecaoFaturamento * 100) / 100;
    }
    
    if (!trabalhado) trabalhado = 1;
    if (!trabalhar) trabalhar = 1;

    console.log("AAAAAAAAAAA", _meta, _data)

    if (_data && _data.ticketMedio > 0 && _meta && _data.faturamento && _meta > _data.faturamento) {
      //let faturamentoDia = _data.faturamento / trabalhado * trabalhar;
      //let metaFaturamentoDia = (_meta - _data.faturamento) / trabalhar;

      let faturamentoRestante = _meta - _data.faturamento;
      let faturamentoResetanteDia = faturamentoRestante / diasRestantes;
      let vendasRestantes = faturamentoRestante / _data.ticketMedio;

      //let _faturamentoRestante = _meta - _data.faturamento;
      //let _faturamentoResetanteDia = faturamentoRestante / trabalhar;
      //let _vendasRestantes = faturamentoRestante / _data.ticketMedio;

      _data.metaVendas = vendasRestantes;
      _data.metaFaturamento = faturamentoResetanteDia;

      _data.metaVendas = Math.ceil(_data.metaVendas);
      
      //_data.metaVendas = (_meta - _data.faturamento) / _data.ticketMedio / trabalhar;      
      //_data.metaVendas = Math.round(_data.metaVendas * 100) / 100;
      //_data.metaFaturamento = (_meta - _data.faturamento) / trabalhar;      
      //_data.metaFaturamento = Math.round(_data.metaFaturamento * 100) / 100;

    } 

    setData(_data);
    console.log("Data:", _data);
  
    return _data;
  };

  const primeiraCampanha = useRef(null);

  var origemOptions = [];
  var campaignOptions = [];

  var primeiraCampanhaOptions = campanhas.map((camp) => { return { value: camp.sanitaze, label: camp.Campanha } });  

  const canalOptions = [{value: false, label: "Todos"}, {value: "MKT", label: "MKT Digital"}, {value: "OP", label: "Operação"}];

  var _campanha = []; //filtroCampanhas[0] ?? {};
  if (campanhas && campanhas.length > 0) _campanha = campanhas.find((camp) => camp.sanitaze === filtroCampanhas[0]) || {};
  //console.log("_Campanha:", _campanha, campanhas);

  var id_Campanha = _campanha.id_Campanha || 0;
  //console.log("ID Campanha:", id_Campanha, 'SelectedUser', selectedUser);

  var metaFaturamentoMes = metas[_campanha.sanitaze] ?? '00,00';

  //console.log("https://22dzrq2jme.execute-api.sa-east-1.amazonaws.com/default/dashboard-argus-rds");

  return (
  <div className="w-full h-full max-w-[1200px] mx-auto">
    {!ready && (
      <div className="fixed top-0 left-0 w-full h-full z-[100]" onClick={(e)=>{e.stopPropagation()}}>
        <div className="p-4 w-[420px] fixed top-0 left-0 bottom-0 right-0 w-fit h-fit transform rounded-lg bg-white text-left shadow-xl transition-all m-auto z-[120] text-gray-600 text-[15px]">
          <div className="w-full h-fit text-center font-semibold text-gray-600 text-[16px]">Selecione uma campanha:</div>
          <Select
            className="w-[280px] mt-[20px]"
            onChange={(e)=>{ primeiraCampanha.current = e; }}
            options={primeiraCampanhaOptions}
            defaultValue={null}
            style={{}}
            placeholder=""
          />
          <div className="flex">
            <div 
              className="px-4 py-2 mt-[20px] bg-blue-500 text-white text-center rounded-lg cursor-pointer hover:bg-blue-600 ml-auto"
              onClick={()=>{ 
                console.log(primeiraCampanha.current);
                if (!primeiraCampanha || !primeiraCampanha.current || !primeiraCampanha.current.value) return;
                setReady(true);                
              }}
            >Confirmar</div>
          </div>          
        </div>
        <div className="fixed top-0 left-0 w-full h-full z-[100] inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      </div>
    )}
    {editarMetas && (<MetasModal campanhas={campanhas} metas={metas} close={()=>{setEditarMetas(false)}} update={(data)=>{updateMetas(data)}}/>)} 
    <NewUserModal user_id={selectedUser} campanha_id={id_Campanha} close={()=>{setSelectedUser(null)}}/>
    <div className="w-full h-fit bg-[#13AE5B] rounded-[15px] py-4 px-2 relative">
      <div className="text-[#000000] text-xl w-fit mx-auto pb-4 font-bold"> META MÊS </div>
      <div className="w-full flex justify-evenly text-[13px]">
        <div className="w-[18%] p-1 bg-[#AFF4C6] text-center rounded-[10px]"> 
          <div className="mx-auto w-fit">Meta Vendas</div>
          <div className={`mx-auto w-fit my-1`}>{data.metaVendas}</div> 
        </div>
        <div className="w-[18%] p-1 bg-[#AFF4C6] text-center rounded-[10px]">
          <div className="mx-auto w-fit">Meta Faturamento</div>
          <div className={`mx-auto w-fit my-1`}>R$ {formatDigits(data.metaFaturamento) ?? '00,00'} / R$ {formatDigits(metaFaturamentoMes) ?? '00,00'}</div> 
        </div>
        <div className="w-[18%] p-1 bg-[#AFF4C6] text-center rounded-[10px]">
          <div className="mx-auto w-fit">Projeção Vendas</div>
          <div className={`mx-auto w-fit my-1`}>{data.projecaoVendas ?? '00'}</div> 
        </div>
        <div className="w-[18%] p-1 bg-[#AFF4C6] text-center rounded-[10px]">
          <div className="mx-auto w-fit">Projeção Faturamento</div>
          <div className={`mx-auto w-fit my-1`}>R$ {formatDigits(data.projecaoFaturamento)}</div> 
        </div>
        <div className="w-[18%] p-1 bg-[#AFF4C6] text-center rounded-[10px]">
          <div className="mx-auto w-fit">Ticket Médio</div>
          <div className={`mx-auto w-fit my-1`}>R$ {formatDigits(data.ticketMedio)}</div> 
        </div>
        <div 
          className="absolute right-5 top-3 cursor-pointer text-[13px] font-bold text-gray-800 bg-blueDefault rounded-[5px] px-2 py-1 hover:text-black border-[1px] border-white/30 opacity-90 hover:opacity-100"
          onClick={()=>{ setEditarMetas(true); }}
        >Editar Metas</div>
      </div>
    </div>
    <div className="w-full h-[120px] max-w-[1200px] mx-auto py-3 mt-0 font-semibold leading-[15px] flex">
      <div className="w-[13%] h-ful rounded-[10px] bg-blueDefault shadow-boxLarge border border-gray-400/10 mr-auto">
        <div class="h-[46px] mx-auto text-[12px] p-2 text-[#FFF] text-center">Quantidade de Leads Importados</div> 
        <div class="h-fit w-fit flex mx-auto text-[16px] text-center text-[#FFF]">{data.qtdLeads ?? '00'}</div>
      </div>
      <div className="w-[13%] h-full rounded-[10px] bg-blueDefault shadow-boxLarge border border-gray-400/10 mx-auto">
        <div class="h-[46px] mx-auto text-[12px] p-2 text-[#FFF] text-center">Completamento</div> 
        <div class="h-fit w-fit flex mx-auto text-[16px] text-center text-[#FFF]">{data.completamento ?? '00'}%</div>
      </div>
      <div className="w-[13%] h-full rounded-[10px] bg-blueDefault shadow-boxLarge border border-gray-400/10 mx-auto">
        <div class="h-[46px] mx-auto text-[12px] p-2 text-[#FFF] text-center">Contato Efetivo</div> 
        <div class="h-fit w-fit flex mx-auto text-[16px] text-center text-[#FFF]">{data.contatoEfetivo ?? '00'}%</div>
      </div>
      <div className="w-[13%] h-full rounded-[10px] bg-blueDefault shadow-boxLarge border border-gray-400/10 mx-auto">
        <div class="h-[46px] mx-auto text-[12px] p-2 text-[#FFF] text-center">Vendas</div> 
        <div class="h-fit w-fit flex mx-auto text-[16px] text-center text-[#FFF]">{data.vendas ?? '00'}</div>
      </div>
      <div className="w-[13%] h-full rounded-[10px] bg-blueDefault shadow-boxLarge border border-gray-400/10 mx-auto">
        <div class="h-[46px] mx-auto text-[12px] p-2 text-[#FFF] text-center">Faturamento</div> 
        <div class="h-fit w-fit flex mx-auto text-[16px] text-center text-[#FFF]">R$ {formatDigits(data.faturamento) ?? '00'}</div>
      </div>
      <div className="w-[13%] h-full rounded-[10px] bg-blueDefault shadow-boxLarge border border-gray-400/10 mx-auto">
        <div class="h-[46px] mx-auto text-[12px] p-2 text-[#FFF] text-center">Taxa de Conversão</div> 
        <div class="h-fit w-fit flex mx-auto text-[16px] text-center text-[#FFF]">{data.conversao ?? '00'}%</div>
      </div>
      <div className="w-[13%] h-full rounded-[10px] bg-blueDefault shadow-boxLarge border border-gray-400/10 ml-auto">
        <div class="h-[46px] mx-auto text-[12px] p-2 text-[#FFF] text-center">Conversão / Contato Efetivo</div>
        <div class="h-fit w-fit flex mx-auto text-[16px] text-center text-[#FFF]">{data.conversaoContatoEfetivo ?? '00'}%</div>
      </div>
    </div>
    <div className="w-full max-w-[1200px] mx-auto py-3 mt-2 flex">
      <div className="w-full">
        <div className="text-[#333] text-[15px] font-semibold">KPI's sobre:</div>
        <div className="w-full flex mt-1">
          <div 
            className={`w-fit my-auto h-[30px] rounded-[10px] flex shadow-boxLarge border cursor-pointer ${filtroKPI == 1 ? "bg-gray-300 border-gray-400/10 text-gray-500" : "bg-blueDefault border-blueDefault/10 text-[#FFF]"}`}
            onClick={() => { if (loading) return; setFiltroKPI(0) }}
          >
            <div class="m-auto font-semibold leading-[13px] text-[13px] px-4">Leads Importados</div> 
          </div>
          <div 
            className={`w-fit my-auto h-[30px] rounded-[10px] flex shadow-boxLarge border ml-3 cursor-pointer ${filtroKPI == 0 ? "bg-gray-300 border-gray-400/10 text-gray-500" : "bg-blueDefault border-blueDefault/10 text-[#FFF]"}`}
            onClick={() => { if (loading) return; setFiltroKPI(1); }}
          >
            <div class="m-auto font-semibold leading-[13px] text-[13px] px-4">Leads Trabalhados</div> 
          </div>  
              <div className="text-[#333] text-[15px] font-semibold flex my-auto ml-8">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  name="RemoverFinalizadoImportacao"
                  checked={filtro.includes("RemoverFinalizadoImportacao")}
                  onChange={checkboxHandler}
                />
                <div className="">Remover Finalizado Importação</div>
              </div>
              <div className="text-[#333] text-[15px] font-semibold flex my-auto ml-5">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  name="RemoverErroDeCadastro"
                  checked={filtro.includes("RemoverErroDeCadastro")}
                  onChange={checkboxHandler}
                />
                <div className="">Remover Erro de Cadastro</div>
              </div>         
          <div className="text-[#333] text-[15px] font-semibold flex my-auto ml-5">
                <input 
                  type="checkbox" 
                  className="mr-2" 
                  name="RemoverBlackList"
                  checked={filtro.includes("RemoverBlackList")}
                  onChange={checkboxHandler}
                />
                <div className="">Remover BlackList</div>
              </div>         
          <div 
            className={`h-[38px] outline-none relative bg-blueDefault border border-blue-300 rounded-[6px] border-solid box-border text-center px-2 py-1 text-white px-10 font-semibold mt-auto ml-auto cursor-pointer`}
            onClick={updateData}
          >Atualizar</div>      
        </div>
      </div>        
    </div> 
    <div className="w-full max-w-[1200px] mx-auto pt-3 pb-1 mt-2 flex">
      <div className={`${filtro.includes("DataImportacao") ? "" : "opacity-60 cursor-default"}`}>
        <div className="text-[#333] text-[15px] font-semibold flex">
          <input 
            type="checkbox" 
            className="mr-2" 
            name="DataImportacao"
            checked={filtro.includes("DataImportacao")}
            onChange={checkboxHandler}
          />
          <div className="">Data da Importação</div>
        </div>
        <div className="flex mt-2">
          <div className={`flex shadow-boxLarge cursor-pointer`}>
            <div class="m-auto font-semibold leading-[13px] text-[13px] ">            
                <DatePicker
                  className={`w-[220px] min-h-[38px] outline-none relative bg-white border border-gray-300 rounded-[4px] border-solid box-border text-center px-2 py-1 text-gray-600 ${filtro.includes("DataImportacao") ? "cursor-pointer" : "cursor-default"}`}
                  dateFormat={"dd/MM/yyyy"}
                  locale="pt-BR"
                  selectsRange={true}
                  startDate={filtroDataImportacao[0] ?? null}
                  endDate={filtroDataImportacao[1] ?? null}
                  onChange={(update) => { setFiltroDataImportacao(update); }}
                  disabled={!filtro.includes("DataImportacao")}                  
                />
            </div> 
          </div>        
        </div>
      </div>        
      <div className={`ml-6 ${filtro.includes("DataTabulacao") ? "" : "opacity-60 cursor-default"}`}>
        <div className="text-[#333] text-[15px] font-semibold flex">
          <input 
            type="checkbox" 
            className="mr-2" 
            name="DataTabulacao"
            checked={filtro.includes("DataTabulacao")}
            onChange={checkboxHandler}
          />
          <div className="">Data da Tabulação</div>
        </div>
        <div className="flex mt-2">
          <div className={`flex shadow-boxLarge cursor-pointer`}>
            <div class="m-auto font-semibold leading-[13px] text-[13px] ">
              <DatePicker
                className={`w-[220px] min-h-[38px] outline-none relative bg-white border border-gray-300 rounded-[4px] border-solid box-border text-center px-2 py-1 text-gray-600 ${filtro.includes("DataTabulacao") ? "cursor-pointer" : "cursor-default"}`}
                dateFormat={"dd/MM/yyyy"}
                locale="pt-BR"
                selectsRange={true}
                startDate={filtroDataTabulacao[0] ?? null}
                endDate={filtroDataTabulacao[1] ?? null}
                onChange={(update) => { setFiltroDataTabulacao(update); }}
                disabled={!filtro.includes("DataTabulacao")}
              />
            </div>
          </div>        
        </div>
      </div>  
      <div className={`ml-6 ${filtro.includes("Lote") ? "" : "opacity-60 cursor-default"}`}>
        <div className="text-[#333] text-[15px] font-semibold flex">
          <input 
            type="checkbox" 
            className="mr-2" 
            name="Lote"
            checked={filtro.includes("Lote")}
            onChange={checkboxHandler}
          />
          <div className="">Lote</div>
        </div>
        <div className="flex mt-2">
          <div className={`flex shadow-boxLarge cursor-pointer`}>
            <div class="m-auto font-normal leading-[13px] text-[12px] ">
              <Select
                className="w-[420px]"
                defaultValue={null}
                onChange={(e)=>{ selectHandler(e); }}
                options={loteOptions}
                style={{}}
                placeholder="Selecione um Lote"
              />
            </div>
          </div>        
        </div>
      </div>
    </div>
    <LotesConteiner lotes={selectedLotes} campanhas={filtroCampanhas} remove={removeFromLote} />
    <div className="w-full max-w-[1200px] mx-auto pt-1 pb-3 mt-4 flex">
        <div className={`${filtro.includes("Canal") ? "" : "opacity-60 cursor-default"}`}>
          <div className="text-[#333] text-[15px] font-semibold flex">
            <input
              type="checkbox"
              className="mr-2"
              name="Canal"
              checked={filtro.includes("Canal")}
              onChange={checkboxHandler}
            />
            <div className="">Canal</div>
          </div>
          <div className="flex mt-2">
            <div className={`flex shadow-boxLarge cursor-pointer`}>
              <div class="m-auto font-normal leading-[13px] text-[13px] font-semibold">
                <Select
                  className="w-[220px]"
                  onChange={setFiltroCanal}
                  options={canalOptions}
                  defaultValue={canalOptions[0]}
                  style={{}}
                  placeholder="Selecione um Canal"
                />
              </div>
            </div>
          </div>
        </div>   
        <div className={`ml-6 ${filtro.includes("Origem") ? "" : "opacity-60 cursor-default"}`}>
          <div className="text-[#333] text-[15px] font-semibold flex">
            <input
              type="checkbox"
              className="mr-2"
              name="Origem"
              checked={false/*filtro.includes("Origem")*/}
              onChange={()=>{return; checkboxHandler}}
              disabled={true}
            />
            <div className="">Origem</div>
          </div>
          <div className="flex mt-2">
            <div className={`flex shadow-boxLarge cursor-pointer`}>
              <div class="m-auto font-normal leading-[13px] text-[13px] font-semibold">
                <Select
                  className="w-[220px]"
                  onChange={setFiltroOrigem}
                  options={origemOptions}
                  defaultValue={null}
                  style={{}}
                  placeholder="Selecione uma Origem"
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>    
        <div className={`ml-6 ${filtro.includes("Campaign") ? "" : "opacity-60 cursor-default"}`}>
          <div className="text-[#333] text-[15px] font-semibold flex">
            <input
              type="checkbox"
              className="mr-2"
              name="Campaign"
              checked={false/*filtro.includes("Campaign")*/}
              onChange={()=>{return; checkboxHandler}}
              disabled={true}
            />
            <div className="">Campanha</div>
          </div>
          <div className="flex mt-2">
            <div className={`flex shadow-boxLarge cursor-pointer`}>
              <div class="m-auto font-normal leading-[13px] text-[13px] font-semibold">
                <Select
                  className="w-[300px]"
                  onChange={setFiltroCampaign}
                  options={campaignOptions}
                  defaultValue={null}
                  style={{}}
                  placeholder="Selecione uma Campanha"
                />
              </div>
            </div>
          </div>
        </div>  
    </div>
    <div className="w-full h-fit max-w-[1200px] mx-auto py-3 flex">
      <div className="w-fit font-semibold text-[11px]"> 
        <div className="text-[#333] text-[15px] font-semibold">Campanhas:</div> 
          <div className="w-[160px] mr-2 mt-4">
            <div 
              className={`w-full h-[30px] rounded-[10px] flex shadow-boxLarge border mt-2 hidden cursor-pointer ${filtroCampanhas.length == campanhas.length ? "border-gray-400/10 text-[#FFF] bg-blueDefault" : "border-gray-100/10 text-gray-600 bg-gray-300"}`}
              onClick={()=>{ if (loading) return; let camps = []; for (let camp of campanhas) camps.push(sanitazeName(camp.Campanha, true)); setFiltroCampanhas(camps); }}
            >
              <div class="m-auto p-1 text-center">TUDO</div> 
            </div>
            {
              campanhas.map((campanha, index) => {
                let camp = "";
                if (campanha && campanha.Campanha) camp = campanha.Campanha;
                const sanitazed = sanitazeName(camp, true);
                return (
                  <div 
                    className={`w-full h-[30px] rounded-[10px] flex shadow-boxLarge border mt-2 cursor-pointer ${filtroCampanhas.includes(sanitazed) ? "border-gray-400/10 text-[#FFF] bg-blueDefault" : "border-gray-100/10 text-gray-600 bg-gray-300"}`} key={"camp_" + index}
                    onClick={()=>{ if (loading || (filtroCampanhas.length == 1 && filtroCampanhas.includes(sanitazed))) return; setFiltroCampanhas([sanitazed]); }}
                  >
                    <div class="m-auto p-1 text-center">{camp}</div> 
                  </div>)
              }) 
            }
          </div>
        </div>
          <div className="rounded-sm flex mt-6 ml-6 w-fit">
            <div className="rounded-sm flex flex-wrap h-fit">
                <DistinctCard title="Categorias" campanhas={filtroCampanhas} distincts={categorias} />
                <DistinctCard title="Tabulações" campanhas={filtroCampanhas} distincts={tabulacoes} />
                <DistinctCard title="Fora de Target" campanhas={filtroCampanhas} distincts={offTarget} />
                <UsersCard title="Usuários" campanhas={filtroCampanhas} distincts={usuarios} vendas={vendas} select={(id)=>{ console.log(id); setSelectedUser(id); }}/>
            </div>
          </div>

    </div>

  </div>
  );
}

//Home.auth = true;
