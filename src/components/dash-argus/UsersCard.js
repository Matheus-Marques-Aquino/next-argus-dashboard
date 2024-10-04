import { useEffect } from "react";

function sanitazeName(name) {
    if (typeof name !== 'string') return '';
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '_').toUpperCase();
}

export default function UsersCard({ campanhas = [], title = "", distincts = {}, select }) {
    var rows = [];
    var total = 0;

    //console.log(distincts, campanhas)

    if (!distincts || !Object.keys(distincts).length) return (<></>);

    for (let camp in distincts) {
        var _camp = {...distincts[camp]};
        if (!_camp || Object.keys(_camp).length === 0) continue;

        var count = campanhas.includes(camp);

        for (let key in _camp) {            
            let row = rows.find((row) => row.name === key);
            let nome = "";
            let perfil = "";
            let supervisor = "";
            let id = null;

            if (_camp && _camp[key] && _camp[key]["Nome"]) nome = _camp[key]["Nome"];
            if (_camp && _camp[key] && _camp[key]["Perfil"]) perfil = _camp[key]["Perfil"];
            if (_camp && _camp[key] && _camp[key]["Supervisor"]) supervisor = _camp[key]["Supervisor"];
            if (_camp && _camp[key] && _camp[key]["id_Usuario"]) id = _camp[key]["id_Usuario"];

            rows.push({ nome, perfil, supervisor, id  });
            if (count) total += 1;
        }
    }

    const Column = ({ name = "Null", role = "", supervisor = "", id = null }) => {
        return (
            <div className="flex items-center justify-between pb-[8px] pt-[8px] text-[12px] leading-[12px] last:pb-0 font-semibold">
                <div className="w-[320px] flex items-center gap-x-3 cursor-pointer">
                    <div className="block text-gray-700 antialiased">    
                        {name}                                 
                    </div>
                </div>
                <div className="block text-blue-gray-900 antialiased mx-3 cursor-pointer">
                    {role}
                </div>
                <div className="w-fit flex items-center gap-x-3 cursor-pointer mr-2">
                    <div 
                        className="block text-blue-500 antialiased transition duration-300 ease-in-out hover:underline"
                        onClick={() => { console.log(id, campanhas[0]); if (!id || !campanhas[0]) return; select(id, campanhas[0]); }}
                    >    
                        Ver mais                                
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex h-fit p-3">
            <div className="w-full mx-auto">
                <div className="relative flex flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md border border-[1px] border-gray-300">
                    <div className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <h5 className="block font-sans text-md font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                                {title}
                            </h5>
                        </div>
                        <div className="divide-y divide-gray-200 mt-5 h-[400px] max-h-[400px] overflow-y-auto">
                            {rows.map((row, index) => (
                                <Column key={index} name={row.nome} role={row.perfil} supervisor={row.supervisor} id={row.id}/>
                            ))}
                        </div>
                        <div className="flex text-blue-gray-900 antialiased pt-2">
                            <div className="">Total:</div>
                            <div className="ml-auto">{total}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
