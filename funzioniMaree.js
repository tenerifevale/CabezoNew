import { maree } from "./archivio.js";

document.getElementById("btnInvia").addEventListener("click", test);
let graficoMaree = "";

function inviaData() {
    console.log("Caricato programma ")
    const ctxMaree = document.getElementById('graficoMaree').getContext('2d');
    graficoMaree = new Chart(ctxMaree, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Marea',
                    data: [],
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: false,
                    pointBackgroundColor: 'blue',
                    tension: 0.4
                },
                {
                    label: 'Marea Max',
                    data: [],
                    borderColor: 'red',
                    borderWidth: 2,
                    fill: false,
                    borderDash: [6, 4],
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: 0,          // inizio alle 00:00
                    max: 1440,       // fine alle 24:00 (1440 minuti)
                    ticks: {
                        stepSize: 60, // etichetta ogni ora
                        callback: function (value) {
                            let ore = Math.floor(value / 60);
                            let minuti = value % 60;
                            return ore + ":" + (minuti < 10 ? "0" : "") + minuti;
                        }
                    }
                },
                y: { beginAtZero: false }
            },
            plugins: {
                verticalLine: {
                    xValue: null, // sarà impostato in seguito
                    color: 'orange',
                    dash: [],
                    width: 4
                },
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 30,   // larghezza rettangolo
                        boxHeight: 2
                    }
                }
            }
        },
        plugins: [verticalLinePlugin]
    });
    let oggi = new Date();
    let giorno = oggi.getDate().toString().padStart(2, '0');
    let mese = (oggi.getMonth() + 1).toString().padStart(2, '0');
    let anno = oggi.getFullYear();
    let dataOggi = `${anno}-${mese}-${giorno}`;
    elabora(maree, dataOggi)
}

document.getElementById("btnInvia").addEventListener("click", cambiaGiorno);
function cambiaGiorno() {
    const data = document.getElementById("data_nuova");
    console.log("Data ----", data);
    const ctxMaree = document.getElementById('graficoMaree_nuova').getContext('2d');
    graficoMaree = new Chart(ctxMaree, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Marea',
                    data: [],
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: false,
                    pointBackgroundColor: 'blue',
                    tension: 0.4
                },
                {
                    label: 'Marea Max',
                    data: [],
                    borderColor: 'red',
                    borderWidth: 2,
                    fill: false,
                    borderDash: [6, 4],
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: 0,          // inizio alle 00:00
                    max: 1440,       // fine alle 24:00 (1440 minuti)
                    ticks: {
                        stepSize: 60, // etichetta ogni ora
                        callback: function (value) {
                            let ore = Math.floor(value / 60);
                            let minuti = value % 60;
                            return ore + ":" + (minuti < 10 ? "0" : "") + minuti;
                        }
                    }
                },
                y: { beginAtZero: false }
            },
            plugins: {
                verticalLine: {
                    xValue: null, // sarà impostato in seguito
                    color: 'orange',
                    dash: [],
                    width: 4
                },
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 30,   // larghezza rettangolo
                        boxHeight: 2
                    }
                }
            }
        },
        plugins: [verticalLinePlugin]
    });
    elabora(maree, data)
}

function dammi_data(dataISO, differenza) {
    const data = new Date(dataISO);
    data.setDate(data.getDate() + differenza);
    return data.toISOString().split("T")[0];
}

const verticalLinePlugin = {
    id: 'verticalLinePlugin',
    afterDraw(chart) {
        const cfg = chart.options.plugins.verticalLine;
        if (!cfg || cfg.xValue == null) return;
        //console.log('Drawing vertical line with config:', cfg);
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const x = xScale.getPixelForValue(cfg.xValue);
        if (!isFinite(x)) return;
        // console.log('Drawing vertical line at x:', x, 'for value:', cfg.xValue);
        const ctx = chart.ctx;
        ctx.save();
        ctx.setLineDash(cfg.dash);
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = cfg.width;
        ctx.beginPath();
        ctx.moveTo(x, yScale.top);
        ctx.lineTo(x, yScale.bottom);
        ctx.stroke();
        ctx.restore();
    }
};




function minutiToOre(data) {
    let ore = parseInt(data.split(':')[0]);
    let minuti = parseInt(data.split(':')[1]);
    return ore * 60 + minuti; // ritorna il totale in minuti
}

function elabora(dati, data) {
    let massimaMarea = 2.50;
    let minoreMarea = 0.10;
    let ore = [];
    let altezza = [];
    let altezzaMax = [];
    let lineaVerticale = 0; // minuti

    const ieri = dammi_data(data, -1)
    const oggi = data;
    const domani = dammi_data(data, +1);
    let mareeDomani = dati[domani];
    let mareeIeri = dati[ieri];
    let mareeOggi = dati[oggi];
    //console.log(mareeIeri);
    //console.log(mareeOggi);
    //console.log(mareeDomani);

    const oggi_reale = new Date();
    //console.log(oggi_reale);
    let oraOggi = oggi_reale.getHours();
    //console.log("Ora corrente:", oraOggi);

    let minutiOggi = oggi_reale.getMinutes();

    lineaVerticale = minutiToOre(`${oraOggi}:${minutiOggi}`); // minuti
    console.log("Linea verticale:", lineaVerticale);

    if (mareeIeri) {
        let marea = mareeIeri[mareeIeri.length - 1];
        //console.log("Ultima marea di ieri:", marea);
        ore.push(minutiToOre(marea.hora) - 1440);
        altezza.push(marea.altura);
        if (marea.altura > 1.2) {
            altezzaMax.push(massimaMarea);
        } else {
            altezzaMax.push(minoreMarea);
        }
    }
    let prossimaMarea = 0;
    if (mareeOggi) {
        for (let i = 0; i < mareeOggi.length; i++) {
            let marea = mareeOggi[i];
            let orario = minutiToOre(marea.hora);
            if (orario <= lineaVerticale) {
                prossimaMarea += 1;
            }

            ore.push(orario);
            altezza.push(marea.altura);
            if (marea.altura > 1.2) {
                altezzaMax.push(massimaMarea);
            } else {
                altezzaMax.push(minoreMarea);
            }
        }
    }
    if (mareeDomani) {
        let marea = mareeDomani[0];
        //console.log("Prima marea di domani:", marea);
        ore.push(minutiToOre(marea.hora) + 1440);
        altezza.push(marea.altura);
        if (marea.altura > 1.2) {
            altezzaMax.push(massimaMarea);
        } else {
            altezzaMax.push(minoreMarea);
        }
    }
    let tipo = "Baja";
    let tipoOld = "Alta";
    let orarioMarea = "";
    let orarioMareaOld = "00:00";
    if (prossimaMarea < mareeOggi.length) {
        if (prossimaMarea == 0) {
            orarioMareaOld = mareeIeri[mareeIeri.length - 1].hora;
        } else {
            orarioMareaOld = mareeOggi[prossimaMarea - 1].hora;
        }
        orarioMarea = mareeOggi[prossimaMarea].hora;
        let altaMarea = mareeOggi[prossimaMarea].altura;
        if (altaMarea > 1.2) {
            tipo = "Alta";
            tipoOld = "Baja";
        }
    } else {
        orarioMareaOld = mareeOggi[prossimaMarea - 1].hora;
        orarioMarea = mareeDomani[0].hora;
        let altaMarea = mareeOggi[0].altura;
        if (altaMarea > 1.2) {
            tipo = "Alta";
            tipoOld = "Baja";
        }
    }

    document.getElementById("oldMarea").textContent = `Última Marea ${tipoOld}: ${orarioMareaOld}`;
    document.getElementById("oraMarea").textContent = `Próxima Marea ${tipo}: ${orarioMarea}`;
    aggiornaGrafico({
        ore: ore,
        altura: altezza,
        alturaMax: altezzaMax,
        lineaVerticale: lineaVerticale
    });


}
// Funzione pubblica per aggiornare il grafico maree
function aggiornaGrafico(dati) {
    if (!dati.ore || !dati.altura || !dati.alturaMax) return;
    graficoMaree.data.datasets[0].data = dati.ore.map((p, i) => ({
        x: p,
        y: dati.altura[i]
    }));
    graficoMaree.data.datasets[1].data = dati.ore.map((p, i) => ({
        x: p,
        y: dati.alturaMax[i]
    }));

    graficoMaree.options.plugins.verticalLine.xValue = dati.lineaVerticale; // minuti

    graficoMaree.update();


}
inviaData();