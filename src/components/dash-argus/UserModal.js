//import { differenceInYears, differenceInMonths, differenceInDays, parseISO, set } from 'date-fns';
//import { Doughnut } from 'react-chartjs-2';
//import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
//import React, { useState, useEffect, useRef } from 'react';
//import axios from 'axios';
//
//ChartJS.register(ArcElement, Tooltip, Legend);
//
//function sanitazeName(name, removeDash = false) {
//    if (typeof name !== 'string') return '';
//    if (removeDash) name = name.replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
//    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '_').toUpperCase();
//}
//
//function getPercentage(value, total) {
//    return ((value / total) * 100).toFixed(2) + "%";
//}
//
//function getRandomColor() {
//    const r = Math.floor(Math.random() * 255);
//    const g = Math.floor(Math.random() * 255);
//    const b = Math.floor(Math.random() * 255);
//    return {rgba: `rgba(${r}, ${g}, ${b}, 0.7)`, hex: rgbToHex(r, g, b, 0.7)};
//};
//
//function rgbToHex(r, g, b, a = 0.7) {
//    const toHex = (component) => {
//        const hex = component.toString(16);
//        return hex.length === 1 ? '0' + hex : hex;
//    };
//
//    const alpha = Math.round(a * 255);
//    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
//}
//
//function toTwoDigits (value) {
//    if (!/^\d+$/.test(value)) return value;
//    return value.toString().padStart(2, '0');
//}
//
//function Column({ name = "Null", value = 0, percentage = "0%", color = {} }) {
//    return (
//        <div className="flex items-center justify-between pb-[6px] pt-[6px] text-[12px] leading-[12px] last:pb-0 mx-2 font-semibold">
//            <div className="w-[22px] h-[16px] rounded-[3px] mr-3 my-auto" style={{ backgroundColor: color.hex }}></div>
//            <div className="flex items-right mr-auto w-fit">
//                <div className="block text-gray-700 antialiased mr-6">    
//                    {name}                                 
//                </div>
//            </div>
//            <div className="w-fit block text-blue-gray-900 antialiased ml-2">
//                {value}
//            </div>
//            <div className="w-[55px] block text-gray-700 antialiased text-right ml-2">
//                {percentage}                                    
//            </div>
//        </div>
//    );
//};
//
//
export default async function UserModal({user_id, campanha_id, close}) {
    return (<></>);
}
//    const lastUserId = useRef(null);    
//    const [_user_id, _set_user_id] = useState(null);
//    const [_campanha_id, _set_campanha_id] = useState(null);
//    const [campanhas, setCampanhas] = useState([]);
//    const [usuario, setUsuario] = useState({
//        campanha: {},
//        campanhas: [],
//        usuario: [],
//        ligacoes: [],
//        vendas: [],
//    });
//
//    const getUserData = async (id_Usuario, id_Campanha, Mes, Ano) => {
//        console.log(user_id)
//        try{
//            axios.post('/api/argus/usuarios/metricas', { id_Usuario: user_id, id_Campanha: campanha_id, mes: 9, ano: 2024 })
//                .then((response) => {
//                    var { campanhas, usuario, ligacoes, vendas } = response.data;
//                    var user = {
//                        campanha: {},
//                        campanhas: [],
//                        usuario: {},
//                        ligacoes: [],
//                        vendas: [],
//                    };
//
//                    user.campanha = campanhas.find((camp) => camp.id_Campanha === campanha_id);
//                    user.campanhas = campanhas || [];
//                    user.usuario = usuario[0] || {};
//                    user.ligacoes = ligacoes || {};
//                    user.vendas = vendas || {};
//
//                    console.log('User:', user);
//
//                })
//                .catch((error) => {
//                    console.log(error);
//                });
//        }catch(e){
//            console.error(e);
//        }
//
//
//    }
//    
//    return (<></>);
//    
//}
//    
//    if ((user_id == _user_id || user_id == null) && (campanha_id == _campanha_id || user_id == null)) return;
//    getUserData(user_id, campanha_id);
//    return null;
//    useEffect(() => {
//        if (user_id != _user_id || _campanha_id != campanha_id) {
//            var _usuario = {
//                campanha: [],
//                campanhas: [],
//                usuario: [],
//                ligacoes: [],
//                vendas: [],
//            };
//
//
//
//            //axios.post('/api/argus/usuarios/metricas', { id_Usuario: id, id_Campanha: campanha_id, mes: 9, ano: 2024 })
//            //    .then((response) => {
//            //        var { campanhas, usuario, ligacoes, vendas } = response.data;
//            //        var user = {
//            //            campanha: {},
//            //            campanhas: [],
//            //            usuario: {},
//            //            ligacoes: [],
//            //            vendas: [],
//            //        };
//            //        user.campanha = campanhas.find((camp) => camp.id_Campanha === campanha_id);
//            //        user.campanhas = campanhas || [];
//            //        user.usuario = usuario[0] || {};
//            //        user.ligacoes = ligacoes || {};
//            //        user.vendas = vendas || {};
//            //        setCampanhas(campanhas);
//            //        setUsuario(user);                    
//            //        _set_user_id(user_id);
//            //        _set_campanha_id(campanha_id);
//            //    })
//            //    .catch((error) => {
//            //        console.log(error);
//            //    });
//
//        }
//
//    }, [user_id, campanha_id]);
//
//   return (<></>);
//
//   //if (!campanha_id) return null;
//   if (campanha_id && campanha_id['id Campanha'] && campanha_id['id_Campanha']['campanhas_ids']) campanha_id = campanha_id['id Campanha']['campanhas_ids'];
//   const _getUserData = async (id) => {
//       if (lastUserId.current === id || !id) return;
//       lastUserId.current = id;
//
//       console.log('AAA', { id_Usuario: id, id_Campanha: campanha_id, mes: 9, ano: 2024 })
//       await axios.post('/api/argus/usuarios/metricas', { id_Usuario: id, id_Campanha: campanha_id, mes: 9, ano: 2024 })
//           .then((response) => {
//               console.log('A_Data:', response.data);
//               var { campanhas, usuario, ligacoes, vendas } = response.data;
//               var user = {
//                   campanha: [],
//                   campanhas: [],
//                   usuario: [],
//                   ligacoes: [],
//                   vendas: [],
//               };
//
//               var _campanhas = [];
//               campanhas.map((camp) => { 
//                   camp.camp = sanitazeName(camp.Campanha, true);
//                   if (!_campanhas.some(c => c.camp === camp.camp)) _campanhas.push({ Campanha: camp.Campanha, id_Campanha: camp.id_Campanha, camp: camp.camp });
//               });
//
//               console.log('Campanhas', _campanhas);
//               //setCampanhas(_campanhas) || {};
//               //setLigacoes(ligacoes || {});
//               //setVendas(vendas || {});
//               //setUsuario(usuario[0] || {});
//           })
//           .catch((error) => {
//               console.log(error);
//           });
//   }
//   console.log({user_id, campanha_id: campanha_id, close})
//   getUserData(user_id);
//   return;
//   
    
    //if (user_id === null) 

    //useEffect(() => {
    //    if (user_id && user_id != usuario['id_Usuario']) getUserData(user_id);
    //}, [user_id]);
    
    //if (!campanha_id || !campanha_id['campanhas_id']) return null;
    //campanha_id = campanha_id['campanhas_id'];

//
//    
//
//    const startDate = parseISO('2023-05-16');
//    const currentDate = new Date();
//
//    const years = differenceInYears(currentDate, startDate);
//    const months = differenceInMonths(currentDate, startDate) % 12;
//    const days = differenceInDays(currentDate, new Date(currentDate.getFullYear(), currentDate.getMonth() - months, startDate.getDate()));
//
//    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDate();
//    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(); 
//    
//    const monthArray = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
//
//    var rows = [];
//    rows["StatusLigacao"] = [];
//    rows["TabuladoComo"] = [];
//    rows["Categoria"] = [];
//    var total = 0;
//
//    var data = [];
//    data["StatusLigacao"] = {
//        labels: [],
//        datasets: [{
//            label: ``,
//            data: [],
//            backgroundColor: [],
//            borderColor: [],
//            borderWidth: 1,
//        }]
//    }
//
//    const options = {
//        responsive: true,
//        plugins: {
//            legend: { display: false },
//            tooltip: { enabled: true, },
//        },
//    };
//
//    var distincts = {
//        "PRIME_TRAVEL": {
//            "StatusLigacao": {
//                "LIGACÃO CANCELADA": 10,
//                "ATENDIMENTO": 5,
//                "BLOCK LIST": 3,
//                "NÃO ATENDE": 15
//            }
//        }
//    }
//
//    for (let camp in distincts) {
//        var _camp = distincts[camp];
//        if (!_camp || Object.keys(_camp).length === 0 || !_camp["StatusLigacao"]) continue;  // Corrigido Object.keys check
//
//        for (let key in _camp["StatusLigacao"]) {
//            if (key === "Total" || key === "total") continue;
//            const randomColor = getRandomColor();
//            total += _camp["StatusLigacao"][key];
//
//            let row = rows["StatusLigacao"].find((row) => row.name === key);
//            if (row) row.value += _camp["StatusLigacao"][key];
//            else rows["StatusLigacao"].push({ name: key, value: _camp["StatusLigacao"][key], color: randomColor });
//
//            if (!data["StatusLigacao"].datasets[0].data.includes(_camp["StatusLigacao"][key]) && !data["StatusLigacao"].labels.includes(key)) {                
//                var color = (row && row.color) ? row.color : randomColor.rgba;
//
//                data["StatusLigacao"].labels.push(key);
//                data["StatusLigacao"].datasets[0].data.push(_camp["StatusLigacao"][key]);
//
//                data["StatusLigacao"].datasets[0].backgroundColor.push(color);
//                data["StatusLigacao"].datasets[0].borderColor.push(color);
//            }
//        }        
//    }
//
//    //console.log(data["StatusLigacao"])
//
//    return (
//        <div className="fixed top-0 left-0 w-full h-full z-[100]">
//            <div className="w-[650px] fixed top-0 left-0 bottom-0 right-0 w-fit h-fit transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all m-auto z-[120] text-gray-600 text-[15px]">
//                <div className="w-full h-fit border-b border-b-[1px] border-gray-300 py-2 text-center font-semibold relative">
//                    Dados do Usuário
//                    <div
//                        className="absolute top-0 bottom-0 right-2 w-[30px] h-[30px] flex items-center justify-center cursor-pointer hover:text-blueDefault transition-all duration-300 my-auto"
//                        onClick={() => close()}
//                    >X</div>
//                </div>
//                <div className="p-4 pb-3 border-b border-b-[1px] border-gray-300">
//                    <div className="flex"> 
//                        <div className="font-semibold">Nome:</div>
//                        <div className="ml-2">{usuario['Nome']} - #{usuario['id_Usuario']}</div>
//                        <div className="ml-auto text-[14px] relative">
//                            <div className='w-fit h-fit font-semibold'>{usuario['Perfil']}</div>
//                        </div>
//                        
//                    </div>
//                    <div className={`flex mt-2 ${!usuario['id_Surpevisor'] ? 'hidden' : ''}`}> 
//                        <div className="font-semibold">Supervisor:</div>
//                        <div className="ml-2 hover:text-blueDefault hover:cursor-pointer transition-all duration-300">{usuario['Surpevisor']} - #{usuario['id_Surpevisor']}</div>
//                    </div>
//                    <div className="mt-2"> 
//                        <div className="font-semibold">Campanhas:</div>
//                        <div className="flex flex-wrap px-2 py-1 gap-y-2 gap-x-3">
//                            {campanhas.map((_campanha, index) => {
//                                if (campanhas['id_Campanha'] === campanha_id) return (<div key={index} className={`w-fit font-semibold text-blueDefault cursor-default`}>{_campanha.Capanha}</div>)
//                                return (<div key={index} className={`w-fit text-gray-600 cursor-pointer`}>{_campanha.Capanha}</div>)
//                            })}                           
//                            
//                        </div>
//                    </div>
//                </div>
//                <div className="w-full h-fit border-b border-b-[1px] border-gray-300 py-2 text-center font-semibold">{toTwoDigits(firstDayOfMonth)}/{toTwoDigits(currentDate.getMonth() + 1)}/{currentDate.getFullYear()} à  {toTwoDigits(lastDayOfMonth)}/{toTwoDigits(currentDate.getMonth() + 1)}/{currentDate.getFullYear()}</div>
//                <div className="px-4 py-2 border-b border-b-[1px] border-gray-300 text-[15px]">
//                    <div className="w-full h-fit border-gray-300 font-semibold text-[16px]">Performance: <span className="text-blueDefault">Prime Travel</span></div>
//                    <div className="w-full h-fit border-gray-300 font-semibold text-[15px] mt-3">• Ligações:</div>
//                    <div className="flex mt-2"> 
//                        <div className="font-semibold my-auto text-[14px]">Total de Ligações/Mês:</div>
//                        <div className="ml-1">100 ligações/mês</div>
//                    </div>
//                    <div className="mt-2 flex"> 
//                        <div className="font-semibold my-auto text-[14px]">Média de Ligações/Dia:</div>
//                        <div className="ml-1">5 ligações/dia</div>
//                    </div>
//                    <div className="mt-2 flex"> 
//                        <div className="font-semibold my-auto text-[14px]">Tempo Conectado:</div>
//                        <div className="ml-1">10 minutos/mês</div>
//                    </div>                    
//                    <div className="mt-2 flex"> 
//                        <div className="font-semibold my-auto text-[14px]">Tempo Conectado/Dia:</div>
//                        <div className="ml-1">10 minutos/dia</div>
//                    </div>
//                    <div className="mt-2 flex"> 
//                        <div className="font-semibold my-auto text-[14px]">Tempo Conectado/Ligação:</div>
//                        <div className="ml-1">10 minutos/ligação</div>
//                    </div>
//                    <div className="w-full h-fit border-gray-300 font-semibold text-[15px] mt-5">• Status das Ligações:</div>
//                    <div className='flex mt-5'>
//                        <div className="flex mx-auto">
//                            <div className="w-fit flex mr-5">
//                                <div className='w-[160px] h-[160px] m-auto'><Doughnut data={data["StatusLigacao"]} options={options} /></div>
//                            </div>
//                            <div className="flex">
//                                <div className="my-auto">
//                                    {rows["StatusLigacao"].map((row, index) => (
//                                        <Column key={index} name={row.name} value={row.value} percentage={getPercentage(row.value, total)} color={row.color} />
//                                    ))}                                
//                                </div>
//                            </div>
//                        </div>
//                    </div>
//                    <div className="w-full h-fit border-gray-300 font-semibold text-[15px] mt-3">Tabulações:</div>
//                </div>
//                <div className="px-4 pb-2">                    
//                    <div className={`flex mt-2 text-[13px] text-gray-600`}> 
//                        <div className="">Data de Cadastro:</div>
//                        <div className="ml-1">16/05/2023 ({years} anos, {months} meses e {days} dias atrás)</div>
//                    </div>
//                </div>
//            </div>
//            <div className="fixed top-0 left-0 w-full h-full z-[100] inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
//        </div>
//    );
//}