
import React, { useState, useEffect, useRef } from 'react';
import CalendarHandler from '../utilities/CalendarHandler';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { differenceInYears, differenceInMonths, differenceInDays, parseISO, set } from 'date-fns';
import { Doughnut } from 'react-chartjs-2';

const calendario = new CalendarHandler();
const { trabalhado, trabalhar } = calendario.getWorkedDays();

function sanitazeName(name, removeDash = false) {
    if (typeof name !== 'string') return '';
    if (removeDash) name = name.replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '_').toUpperCase();
}

function getPercentage(value, total) {
    return ((value / total) * 100).toFixed(2) + "%";
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return { rgba: `rgba(${r}, ${g}, ${b}, 0.7)`, hex: rgbToHex(r, g, b, 0.7) };
};

function rgbToHex(r, g, b, a = 0.7) {
    const toHex = (component) => {
        const hex = component.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    const alpha = Math.round(a * 255);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
}

function toTwoDigits(value) {
    if (!/^\d+$/.test(value)) return value;
    try{ value = value.toString().padStart(2, '0'); }catch(e){ console.error(e); }
    return value;
}

function Column({ name = "Null", value = 0, percentage = "0%", color = {} }) {
    return (
        <div className="flex items-center justify-between pb-[6px] pt-[6px] text-[12px] leading-[12px] last:pb-0 mx-2 font-semibold">
            <div className="w-[22px] h-[16px] rounded-[3px] mr-3 my-auto" style={{ backgroundColor: color.hex }}></div>
            <div className="flex items-right mr-auto w-fit">
                <div className="block text-gray-700 antialiased mr-6">
                    {name}
                </div>
            </div>
            <div className="w-fit block text-blue-gray-900 antialiased ml-2">
                {value}
            </div>
            <div className="w-[55px] block text-gray-700 antialiased text-right ml-2">
                {percentage}
            </div>
        </div>
    );
};

function metricasLigacoes(ligacoes) {
    if (!ligacoes || !Array.isArray(ligacoes) || !ligacoes.length) return [];

    var metricas = {
        total: ligacoes.length,
        segundosConectado: 0,
        tabuladoComo: {},
        categorias: {},
        statusLigacao: {}
    };

    console.log('METRICAS:', metricas);

    ligacoes.map((ligacao, index) => {
        var { TabuladoComo, Categoria, SegundosConectado, StatusLigacao } = ligacao;

        SegundosConectado = parseInt(SegundosConectado) / 60;
        metricas.segundosConectado += SegundosConectado;

        if (!metricas.tabuladoComo[TabuladoComo]) metricas.tabuladoComo[TabuladoComo] = 0;
        if (!metricas.tabuladoComo.TOTAL) metricas.tabuladoComo.TOTAL = 0;
        metricas.tabuladoComo.TOTAL += 1;
        metricas.tabuladoComo[TabuladoComo] += 1;

        if (!metricas.categorias[Categoria]) metricas.categorias[Categoria] = 0;
        if (!metricas.categorias.TOTAL) metricas.categorias.TOTAL = 0;
        metricas.categorias.TOTAL += 1;
        metricas.categorias[Categoria] += 1;

        if (!metricas.statusLigacao[StatusLigacao]) metricas.statusLigacao[StatusLigacao] = 0;
        if (!metricas.statusLigacao.TOTAL) metricas.statusLigacao.TOTAL = 0;
        metricas.statusLigacao.TOTAL += 1;
        metricas.statusLigacao[StatusLigacao] += 1;
    });

    if (trabalhado > 0) metricas.ligacoesDia = (metricas.total / trabalhado).toFixed(2);
    if (trabalhado > 0) metricas.segundosDia = (metricas.segundosConectado / trabalhado).toFixed(2);

    if (trabalhar <= 0) metricas.ligacoesMes = metricas.total.toFixed(2);
    if (trabalhar <= 0) metricas.segundosMes = metricas.segundosConectado.toFixed(2);

    if (metricas.total > 0) metricas.segundosLigacao = (metricas.segundosConectado / metricas.total).toFixed(2);

    return metricas;
}

function metricasVendas(vendas) {
    if (!vendas || !Array.isArray(vendas) || !vendas.length) return [];

    var metricas = {
        total: vendas.length,
        faturamento: 0,
        statusSucesso: {}
    };

    vendas.map((venda, index) => {
        var { Receita, StatusSucesso } = venda;

        Receita = parseFloat(Receita);
        Receita = Math.round(Receita * 100) / 100;

        metricas.faturamento += Receita;

        if (!metricas.statusSucesso[StatusSucesso]) metricas.statusSucesso[StatusSucesso] = 0;
        metricas.statusSucesso[StatusSucesso] += 1;
    });

    if (trabalhado > 0) results.vendasDia = (metricas.total / trabalhado).toFixed(2);
    if (trabalhado > 0 && metricas.total > 0) results.ticketMedio = (metricas.faturamento / metricas.total).toFixed(2);

    return metricas;
}

async function getMetricas(id_Usuario, id_Campanha, mes, ano) {
    var results = {
        campanha: {},
        campanhas: [],
        usuario: {},
        ligacoes: [],
        metricaLigacoes: {},
        vendas: [],
        metricaVendas: {}
    };

    await axios.post("https://22dzrq2jme.execute-api.sa-east-1.amazonaws.com/default/dashboard-argus-rds", { id_Usuario, id_Campanha, mes, ano, endpoint: 'usuarios-metricas' }, { headers: { 'Content-Type': 'application/json' } })
        .then((response) => {
            var { campanhas = [], usuario = [], ligacoes = [], vendas = [] } = response.data;

            console.log("RESPONSE:", response.data);

            campanhas.map((campanha, index) => {
                results.campanhas.push({ ...campanha, camp: sanitazeName(campanha.Campanha) });
                if (campanha.id_Campanha === id_Campanha) results.campanha = { ...campanha, camp: sanitazeName(campanha.Campanha) };
            });

            results.usuario = { ...usuario[0] } || {};
            results.usuario.campanhas = [...results.campanhas];

            results.ligacoes = ligacoes || [];
            results.vendas = vendas || [];

            console.log('USUARIO:', results.usuario);
        })
        .catch((error) => {
            console.error(error);
        });

    if (results.ligacoes.length) results.metricaLigacoes = metricasLigacoes(results.ligacoes);
    if (results.vendas.length) results.metricaVendas = metricasVendas(results.vendas);

    console.log('RESULTS:', results)

    return results;
}

function setupGraph(data) {
    var graph = {
        labels: [],
        datasets: [{
            label: ``,
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
        }]
    };

    if (!data) return graph;

    for (const key in data) {
        graph.labels.push(key);
        graph.datasets[0].data.push(data[key]);

        var color = getRandomColor();
        graph.datasets[0].backgroundColor.push(color.rgba);
        graph.datasets[0].borderColor.push(color.hex);
    }

    return graph;
}

function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() retorna 0-11, então adicionamos 1
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

const graphOptions = {
    responsive: true,
    plugins: {
        legend: { display: false },
        tooltip: { enabled: true, },
    },
};

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

export default function NewUserModal({ user_id, campanha_id, close }) {
    const [campanha, setCampanha] = useState({});
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);

    const [userId, setUserId] = useState(0);
    const [campanhaId, setCampanhaId] = useState(0);

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const [usuario, setUsuario] = useState({});
    const [ligacoes, setLigacoes] = useState([]);
    const [vendas, setVendas] = useState([]);

    const [metricaLigacoes, setMetricaLigacoes] = useState({});
    const [metricaVendas, setMetricaVendas] = useState({});

    const currentDate = new Date();
    const firstDayOfMonth = getFirstDayOfMonth(month, year).getDate();
    const lastDayOfMonth = getLastDayOfMonth(month, year).getMonth() + 1;

    const startDate = (usuario?.DataCadastro) ? new Date(usuario['DataCadastro']) : new Date();

    const _years = differenceInYears(currentDate, startDate);
    const _months = differenceInMonths(currentDate, startDate) % 12;
    const _days = differenceInDays(currentDate, new Date(currentDate.getFullYear(), currentDate.getMonth() - _months, startDate.getDate()));

    useEffect(() => {
        try {
            if (user_id && campanha_id) {
                setLoading(true);

                const getData = async () => {
                    const metricas = await getMetricas(user_id, campanha_id, month, year);

                    console.log('AAAAAAAAAAAAAAAAAAA', metricas);

                    setUsuario(metricas.usuario);
                    setLigacoes(metricas.ligacoes);
                    setVendas(metricas.vendas);
                    setCampanha(metricas.campanha);

                    if (metricas.metricaLigacoes) setMetricaLigacoes(metricas.metricaLigacoes);
                    if (metricas.metricaVendas) setMetricaVendas(metricas.metricaVendas);
                };

                getData();
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user_id, campanha_id, month, year]);

    useEffect(()=>{
        //console.log('1 - USUARIO:', usuario);
    }, [usuario]);

    //console.log(usuario, vendas, ligacoes, metricaLigacoes, metricaVendas);

    if (!user_id || !campanha_id || !usuario || !usuario.Nome) return (<div></div>);

    const graphs = {
        tabuladoComo: setupGraph(metricaLigacoes.tabuladoComo),
        categorias: setupGraph(metricaLigacoes.categorias),
        statusLigacao: setupGraph(metricaLigacoes.statusLigacao),
    };

    const rows = {
        tabuladoComo: [],
        categorias: [],
        statusLigacao: [],
    };

    //var total = {
    //    tabuladoComo: 0,
    //    categorias: 0,
    //    statusLigacao: 0
    //}
    const moveTotalToEnd = (array) => {
        return array.sort((a, b) => (a.name === 'TOTAL' ? 1 : b.name === 'TOTAL' ? -1 : 0));
    }

    graphs.tabuladoComo.labels.map((label, index) => {        
        rows.tabuladoComo.push({ name: label, value: graphs.tabuladoComo.datasets[0].data[index], percentage: getPercentage(graphs.tabuladoComo.datasets[0].data[index], metricaLigacoes?.tabuladoComo?.TOTAL), color: { hex: graphs.tabuladoComo.datasets[0].borderColor[index] } });
    });
    rows.tabuladoComo = moveTotalToEnd(rows.tabuladoComo);

    graphs.categorias.labels.map((label, index) => {
        rows.categorias.push({ name: label, value: graphs.categorias.datasets[0].data[index], percentage: getPercentage(graphs.categorias.datasets[0].data[index], metricaLigacoes?.categorias?.TOTAL), color: { hex: graphs.categorias.datasets[0].borderColor[index] } });
    });
    rows.categorias = moveTotalToEnd(rows.categorias);

    graphs.statusLigacao.labels.map((label, index) => {
        rows.statusLigacao.push({ name: label, value: graphs.statusLigacao.datasets[0].data[index], percentage: getPercentage(graphs.statusLigacao.datasets[0].data[index], metricaLigacoes?.statusLigacao?.TOTAL), color: { hex: graphs.statusLigacao.datasets[0].borderColor[index] } });
    });
    rows.statusLigacao = moveTotalToEnd(rows.statusLigacao);

    //console.log(JSON.stringify(graphs))

    const listaCampanhas = usuario?.campanhas || [];

    return (
        <div className="fixed top-0 left-0 w-full h-full z-[100]">
            <div className="min-w-[650px] fixed top-0 left-0 bottom-0 right-0 w-fit h-fit transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all m-auto z-[120] text-gray-600 text-[15px]">
                <div className="w-full h-fit border-b border-b-[1px] border-gray-300 py-2 text-center font-semibold relative">
                    Dados do Usuário
                    <div
                        className="absolute top-0 bottom-0 right-2 w-[30px] h-[30px] flex items-center justify-center cursor-pointer hover:text-blueDefault transition-all duration-300 my-auto"
                        onClick={() => close()}
                    >X</div>
                </div>
                <div className="p-4 pb-3 border-b border-b-[1px] border-gray-300">
                    <div className="flex">
                        <div className="font-semibold">Nome:</div>
                        <div className="ml-2">{usuario['Nome']} - #{usuario['id_Usuario']}</div>
                        <div className="ml-auto text-[14px] relative">
                            <div className='w-fit h-fit font-semibold'>{usuario['Perfil']}</div>
                        </div>

                    </div>
                    <div className={`flex mt-2 ${!usuario['id_Surpevisor'] ? 'hidden' : ''}`}>
                        <div className="font-semibold">Supervisor:</div>
                        <div className="ml-2 hover:text-blueDefault hover:cursor-pointer transition-all duration-300">{usuario['Surpevisor']} - #{usuario['id_Surpevisor']}</div>
                    </div>
                    <div className="mt-2">
                        <div className="font-semibold">Campanhas:</div>
                        <div className="flex flex-wrap px-2 py-1 gap-y-2 gap-x-3 text-[14px]">
                            {listaCampanhas.map((_campanha, index) => {
                                if (campanha['id_Campanha'] === _campanha['id_Campanha']) return (<div key={index} className={`w-fit font-semibold text-blueDefault cursor-default`}>{_campanha.Campanha}</div>)
                                return (<div key={index} className={`w-fit text-gray-600 cursor-pointer`}>{_campanha.Campanha}</div>)
                            })}
                        </div>
                    </div>
                </div>
                <div className="w-full h-fit border-b border-b-[1px] border-gray-300 py-2 text-center font-semibold">{toTwoDigits(firstDayOfMonth)}/{toTwoDigits(currentDate.getMonth() + 1)}/{currentDate.getFullYear()} à  {toTwoDigits(lastDayOfMonth)}/{toTwoDigits(currentDate.getMonth() + 1)}/{currentDate.getFullYear()}</div>
                <div className="px-4 py-2 border-b border-b-[1px] border-gray-300 text-[15px] max-h-[300px] overflow-y-auto">
                    <div className="w-full h-fit border-gray-300 font-semibold text-[16px]">Performance: <span className="text-blueDefault">{campanha['Campanha']}</span></div>

                    <div className={`w-full h-fit border-gray-300 font-semibold text-[15px] mt-3 ${!vendas.length ? 'hidden' : ''}`}>• Vendas:</div>
                    <div className={`flex mt-2`}>
                        <div className="font-semibold my-auto text-[14px]">Total de Vendas/Mês:</div>
                        <div className="ml-1">{vendas.length} vendas/mês</div>
                    </div>
                    <div className={`flex mt-2 ${!metricaVendas?.vendasDia ? 'hidden' : ''}`}>
                        <div className="font-semibold my-auto text-[14px]">Média de Vendas/Dia:</div>
                        <div className="ml-1">{metricaLigacoes?.vendasDia} vendas/dia</div>
                    </div>
                    <div className={`flex mt-2 ${!metricaVendas?.ticketMedio ? 'hidden' : ''}`}>
                        <div className="font-semibold my-auto text-[14px]">Tempo Conectado:</div>
                        <div className="ml-1">R$ {metricaVendas?.ticketMedio}</div>
                    </div>

                    <div className={`w-full h-fit border-gray-300 font-semibold text-[15px] mt-3`}>• Ligações:</div>
                    <div className={`flex mt-2`}>
                        <div className="font-semibold my-auto text-[14px]">Total de Ligações/Mês:</div>
                        <div className="ml-1">{ligacoes.length} ligações/mês</div>
                    </div>
                    <div className={`flex mt-2 ${!metricaLigacoes?.ligacoesDia ? 'hidden' : ''}`}>
                        <div className="font-semibold my-auto text-[14px]">Média de Ligações/Dia:</div>
                        <div className="ml-1">{metricaLigacoes?.ligacoesDia} ligações/dia</div>
                    </div>
                    <div className={`flex mt-2 ${!metricaLigacoes?.segundosConectado ? 'hidden' : ''}`}>
                        <div className="font-semibold my-auto text-[14px]">Tempo Conectado:</div>
                        <div className="ml-1">{metricaLigacoes?.segundosConectado ? metricaLigacoes.segundosConectado.toFixed(2) : 0 } minutos/mês</div>
                    </div>
                    <div className={`flex mt-2 ${!metricaLigacoes?.segundosDia ? 'hidden' : ''}`}>
                        <div className="font-semibold my-auto text-[14px]">Tempo Conectado/Dia:</div>
                        <div className="ml-1">{metricaLigacoes?.segundosDia} minutos/dia</div>
                    </div>
                    <div className={`flex mt-2 ${!metricaLigacoes?.segundosLigacao ? 'hidden' : ''}`}>
                        <div className="font-semibold my-auto text-[14px]">Tempo Conectado/Ligação:</div>
                        <div className="ml-1">{metricaLigacoes?.segundosLigacao} minutos/ligação</div>
                    </div>
                    <div className={`w-full h-fit border-gray-300 font-semibold text-[15px] mt-5 ${!ligacoes.length ? 'hidden' : ''}`}>• Status das Ligações:</div>
                    <div className='flex mt-5'>
                        <div className="flex mx-auto">
                            <div className="w-fit flex mr-5">
                                <div className='w-[160px] h-[160px] m-auto'><Doughnut data={graphs.statusLigacao} options={graphOptions} /></div>
                            </div>
                            <div className="flex">
                                <div className="my-auto">
                                    {rows["statusLigacao"].map((row, index) => (
                                        <Column key={index} name={row.name} value={row.value} percentage={getPercentage(row.value, metricaLigacoes?.statusLigacao?.TOTAL)} color={row.color} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`w-full h-fit border-gray-300 font-semibold text-[15px] mt-3`}>• Tabulações:</div>
                    <div className='flex mt-5'>
                        <div className="flex mx-auto">
                            <div className="w-fit flex mr-5">
                                <div className='w-[160px] h-[160px] m-auto'><Doughnut data={graphs.tabuladoComo} options={graphOptions} /></div>
                            </div>
                            <div className="flex">
                                <div className="my-auto">
                                    {rows["tabuladoComo"].map((row, index) => (
                                        <Column key={index} name={row.name} value={row.value} percentage={getPercentage(row.value, metricaLigacoes?.tabuladoComo?.TOTAL)} color={row.color} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`w-full h-fit border-gray-300 font-semibold text-[15px] mt-3`}>• Categorias:</div>
                    <div className='flex mt-5'>
                        <div className="flex mx-auto">
                            <div className="w-fit flex mr-5">
                                <div className='w-[160px] h-[160px] m-auto'><Doughnut data={graphs.categorias} options={graphOptions} /></div>
                            </div>
                            <div className="flex">
                                <div className="my-auto">
                                    {rows["categorias"].map((row, index) => (
                                        <Column key={index} name={row.name} value={row.value} percentage={getPercentage(row.value, metricaLigacoes?.categorias?.TOTAL)} color={row.color} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-2">
                    <div className={`flex mt-2 text-[13px] text-gray-600 ${usuario['DataCadastro'] ? '' : 'hidden'}`}>
                        <div className="">Data de Cadastro:</div>
                        <div className="ml-1">{formatDate(new Date(usuario['DataCadastro']))}</div>
                    </div>
                </div>
            </div>
            <div className="fixed top-0 left-0 w-full h-full z-[100] inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        </div>
    )


    //useEffect(() => {
    //    if (!userId || !campanhaId) return;
    //    setLoading(true);
    //    axios.post('/api/argus/usuarios/metricas', { id_Usuario: userId, id_Campanha: campanhaId, mes: 1, ano: 2021 })
    //        .then((res) => {
    //            console.log(res.data);
    //            
    //            setCampanha(res.data.find((camp) => camp.id_Campanha === campanhaId));
    //            setUserData(res.data);
    //            setLoading(false);
    //        })
    //        .catch((err) => {
    //            console.error(err);
    //            setLoading(false);
    //        });
    //}, [userId, campanhaId]);
    //console.log(campanha, userData);
    //return(<></>);
}
