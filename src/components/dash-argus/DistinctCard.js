import { useEffect } from "react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function getPercentage(value, total) {
    return ((value / total) * 100).toFixed(2) + "%";
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return {rgba: `rgba(${r}, ${g}, ${b}, 0.7)`, hex: rgbToHex(r, g, b, 0.7)};
};

function rgbToHex(r, g, b, a = 0.7) {
    const toHex = (component) => {
        const hex = component.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    const alpha = Math.round(a * 255);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alpha)}`;
}

export default function DistinctCard({ campanhas = [], title = "", distincts = {} }) {
    var rows = [];
    var total = 0;

    if (!distincts || Object.keys(distincts).length === 0) return (<></>);
    
    var data = {
        labels: [],
        datasets: [{
            label: ``,
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
        }]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true, },
        },
    };

    for (let camp in distincts) {
        var _camp = distincts[camp];
        if (!_camp || Object.keys(_camp).length === 0) continue;  // Corrigido Object.keys check

        for (let key in _camp) {
            if (key === "Total" || key === "total") continue;
            const randomColor = getRandomColor();
            total += _camp[key];

            let row = rows.find((row) => row.name === key);
            if (row) row.value += _camp[key];
            else rows.push({ name: key, value: _camp[key], color: randomColor });

            if (!data.datasets[0].data.includes(_camp[key]) && !data.labels.includes(key)) {
                var color = (row && row.color) ? row.color : randomColor.rgba;


                data.labels.push(key);
                data.datasets[0].data.push(_camp[key]);

                data.datasets[0].backgroundColor.push(color);
                data.datasets[0].borderColor.push(color);
            }
        }        
    }

    rows = rows.sort((a, b) => b.value - a.value);    

    const Column = ({ name = "Null", value = 0, percentage = "0%", color = {} }) => {
        return (
            <div className="flex items-center justify-between pb-[8px] pt-[8px] text-[12px] leading-[12px] last:pb-0 mx-2 font-semibold">
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

    return (
        <div className="flex h-fit w-full p-3">
            <div className="flex w-full mx-auto rounded-xl bg-white bg-clip-border shadow-md border border-[1px] border-gray-300 relative">     
                <h5 className="w-fit block font-sans text-[26px] font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased absolute mx-auto top-3 left-0 right-0">
                    {title}
                </h5>
                <div className="flex pt-[45px] pb-[15px] mt-10 w-fit mx-auto">                    
                    <div className="w-[210px] mx-10 flex my-auto"><Doughnut data={data} options={options} /></div>
                    <div className="relative flex flex-coltext-gray-700 h-full w-full ml-5">
                        <div className="pr-3 pb-3 w-fit h-fit my-auto">
                            <div className={`divide-y divide-gray-200 h-[350px] max-h-[300px] h-fit overflow-y-auto ml-auto flex`}>
                                <div className="m-auto">
                                    {rows.map((row, index) => (
                                        <Column key={index} name={row.name} value={row.value} percentage={getPercentage(row.value, total)} color={row.color} />
                                    ))}
                                    <Column name={"TOTAL"} value={total} percentage={"100%"} />
                                </div>
                            </div>
                            <div className="flex text-blue-gray-900 antialiased mr-[0px] pt-2 hidden">
                                <div className="ml-auto">Total:</div>
                                <div className="ml-2">{total}</div>
                            </div>
                        </div>
                    </div>
                </div>            
            </div>
        </div>
    );
}
