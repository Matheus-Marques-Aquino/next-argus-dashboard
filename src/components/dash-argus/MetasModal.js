import React, { useState, useEffect, useRef } from 'react';
import InputMask from 'react-input-mask';
import axios from 'axios';
//import { data } from 'autoprefixer';

export default function MetasModal({ campanhas = [], metas = {}, update, isOpen, close }) {
    const [metaCampanhas, setMetaCampanhas] = useState({});
    const [loading, setLoading] = useState(false);

    const salvarMetas = async () => {
        if (loading) return;

        try {
            setLoading(true);
            await axios.post("/api/argus/metas/atualizar", { campanhas: campanhas, metas: metaCampanhas, endpoint: 'metas-atualizar' }, { headers: { 'Content-Type': 'application/json' } })
                .then((response) => {
                    const { data } = response;
                    //console.log('BBBB', data);
                    update(data);
                })
                .catch((error) => {
                    console.log('Erro ao salvar metas:', error);
                });
            setLoading(false);
            close();
        } catch(e) {
            console.log('Erro ao salvar metas:', e);
            setLoading(false);
        }
    };

    const recarregarMetas = async () => {
        if (loading) return;

        try {
            setLoading(true);
            await axios.post("/api/argus/metas", { endpoint: 'metas' }, { headers: { 'Content-Type': 'application/json' } })
                .then((response) => {
                    const { data } = response;
                    setMetaCampanhas({...metaCampanhas, ...data});
                })
                .catch((error) => {
                    console.log('Erro ao salvar metas:', error);
                });
            setLoading(false);
        } catch(e) {
            console.log('Erro ao salvar metas:', e);
            setLoading(false);
        }
    }

    const init = () => {
        var _metas = {};

        if (!campanhas || !campanhas.length) campanhas = [];

        try{
            if (!Array.isArray(campanhas) || !campanhas.length) return;
            
            for(const camp in campanhas) {
                const { sanitaze } = campanhas[camp];
                const meta = metas[sanitaze] || 0;
                _metas[sanitaze] = (parseInt(meta)) ? parseInt(meta) : meta;
            }

            setMetaCampanhas(_metas);
        }catch(e){
            console.log('Erro ao carregar metas:', e);
        }
    }

    useState(() => {
        init();
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full z-[100]">
            <div 
                className="w-[420px] fixed top-0 left-0 bottom-0 right-0 w-fit h-fit transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all m-auto z-[120] text-gray-600 text-[15px]"
                onClick={(e)=>{ e.stopPropagation(); }}
            >
                <div className="w-full h-fit border-b border-b-[1px] border-gray-300 py-2 text-center font-semibold relative">
                    Metas das Campanhas
                    <div
                        className="absolute top-0 bottom-0 right-2 w-[30px] h-[30px] flex items-center justify-center cursor-pointer hover:text-blueDefault transition-all duration-300 my-auto"
                        onClick={()=>{ if (!loading) close(); }}
                    >X</div>
                </div>
                
                <div className="w-fit h-[500px] max-h-[500px] overflow-auto py-2 font-semibold relative border-b border-b-[1px] border-gray-300">
                    <div className="w-fit px-4 underline text-blueDefault cursor-pointer text-[14px]" onClick={()=>{ recarregarMetas() }}> Recarregar Metas</div>
                    {campanhas.map((campanha, index) => {
                        var customCSS = "";
                        if (index == 0) customCSS = "border-t border-t-[1px] border-t-gray-200";

                        return (
                            <div className={`flex mt-2 py-1 px-4 border-b border-b-[1px] border-b-gray-200 text-[14px] ${customCSS}`}>
                                <div className="ml-auto w-[180px] h-[30px] flex">
                                    <div className="h-fit my-auto">{campanha['Campanha']}:</div>
                                </div>
                                <div className='mr-auto w-fit h-fit relative flex'>
                                    <InputMask 
                                        alwaysShowMask={false}
                                        placeholder="0,00"
                                        className="w-[160px] h-[28px] border border-gray-300 rounded-md text-center my-auto relative" 
                                        value={metaCampanhas[campanha['sanitaze']]}
                                        onChange={(e) => { 
                                            var { value } = e.target;
                                            value = value || 0;
                                            value = value.replace(/\D/g, '');
                                            setMetaCampanhas({ ...metaCampanhas, [campanha['sanitaze']]: value });
                                        }}
                                    />
                                    <div className='absolute top-0 left-5 bottom-0 my-auto h-fit w-fit'>R$</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className='w-full flex py-3'> 
                    <div className="px-[8px] py-[4px] bg-gray-400 rounded-[8px] text-white opacity-75 cursor-pointer hover:opacity-90 ml-4" onClick={()=>{if (!loading) close()}}>CANCELAR</div>
                    <div className="px-[8px] py-[4px] bg-green-500 rounded-[8px] text-white opacity-75 cursor-pointer hover:opacity-90 ml-auto mr-4" onClick={()=>{ salvarMetas() }}>{!loading ? 'SALVAR' : 'SALVANDO...'}</div>
                </div>
            </div>
            <div 
                className="fixed top-0 left-0 w-full h-full z-[100] inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={()=>{ if (!loading) close(); }}
            ></div>
        </div>
    );

};