


const ctxViento = document.getElementById('graficoViento').getContext('2d');
const graficoViento = new Chart(ctxViento, {
    type: 'line',
    data: {
        datasets: [
            {
                label: 'Viento',
                data: [],
                borderColor: 'green',
                borderWidth: 2,
                fill: true,
                backgroundColor: 'rgba(19, 230, 47, 0.4)',
                pointBackgroundColor: 'green',
                pointBorderColor: 'green',
                pointBorderWidth: 1,
                tension: 0.4
            },
            {
                label: 'Ráfagas',
                data: [],
                borderColor: 'red',
                pointBackgroundColor: 'red',
                pointBorderColor: 'red',
                pointBorderWidth: 1,
                borderWidth: 2,
                fill: false,
                backgroundColor: 'rgba(255, 0, 0, 0.4)',
                pointRadius: 3, // nasconde i punti
                borderDash: [6, 4],
                tension: 0.1
            },
            {
                label: '20 Kts',
                data: [],
                borderColor: 'blue',
                borderWidth: 1,
                fill: false,
                tension: 0.4,
                pointRadius: 0, // nasconde i punti
            }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                ticks: {
                    callback: function (value) {
                        let ore = Math.floor(value / 60);
                        let minuti = value % 60;
                        return ore + ":" + (minuti < 10 ? "0" : "") + minuti;
                    }, font: {
                        size: 14,    // testo più grande per asse X
                        color: 'black' // colore del testo
                    }
                }
            },
            y: {
                beginAtZero: false,
                ticks: {
                    font: {
                        size: 16,   // testo più grande per asse Y

                    }
                }
            }

        },
        plugins: {
            legend: {
                display: true,
                labels: {
                    boxWidth: 30,   // larghezza rettangolo
                    boxHeight: 2
                }

            }
        }
    }

});





function minutiToOre(data) {
    let ore = parseInt(data.split(':')[0]);
    let minuti = parseInt(data.split(':')[1]);
    return ore * 60 + minuti; // ritorna il totale in minuti
}


// Vento --------------------------------------------------
async function leggiDatiCSV(dataOggi) {
    const sheetId = "1eIKlMLlfEFlngSD4rMZzBq8cdT-XnNlJ-s3rc7Xs6Hw"
    const range = dataOggi;
    const apiKey = "AIzaSyCIpbMVyNP5F5AR7OhOvaQ5v6AXLU__iBk";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
    fetch(url)
        .then(r => r.json())
        .then(data => {
            if (!data.values) {
                console.error("Nessun dato ricevuto:", data);
                return;
            }
            const { ore, ventoMedio, raffiche, direzione, temperatura } = processaDati(data.values);
            let datiVento = {
                ore: ore,
                ventoMedio: ventoMedio,
                raffiche: raffiche,
                direzione: direzione,
                temperatura: temperatura
            };
            aggiornaGraficoVento(datiVento);
        })
        .catch(err => console.error("Errore nel caricamento da Sheets API:", err));

}


function processaDati(values) {
    // Salta la prima riga (header)
    const dati = values.slice(1);
    const ore = dati.map(riga => riga[5]);          // colonna "Ora"
    const ventoMedio = dati.map(riga => parseFloat(riga[2].replace(',', '.')));
    const raffiche = dati.map(riga => parseFloat(riga[3].replace(',', '.')));
    const direzione = dati.map(riga => riga[1]);
    const temperatura = dati.map(riga => parseFloat(riga[4].replace(',', '.')));
    //console.log("Dati ORE ", ore);
    return { ore, ventoMedio, raffiche, direzione, temperatura };
}

function aggiornaGraficoVento(dati) {
    if (dati) {
        scriviGrafico(dati);
    }
    else {
        leggiDatiCSV(dammiData("ieri"));
    }
}

function scriviGrafico(dati) {
    if (!dati.ore || !dati.ventoMedio || !dati.raffiche || !dati.direzione || !dati.temperatura) return;
    const Raff = dati.raffiche[dati.raffiche.length - 1];
    const orario = dati.ore[dati.ore.length - 1];
    const Dir = dati.direzione[dati.direzione.length - 1];
    const Ven = dati.ventoMedio[dati.ventoMedio.length - 1];
    const temp = dati.temperatura[dati.temperatura.length - 1];
    // Creato con for anziche`map per avere il controllo sui punti
    let punti = [];
    const lungo = dati.ore.length;
    let risultato = lungo - 20; // mostra solo gli ultimi 15 punti

    for (let i = risultato; i < dati.ore.length; i++) {

        punti.push({
            x: minutiToOre(dati.ore[i]),
            y: dati.ventoMedio[i]
        });

        //console.log(`Punto ${i}: x=${dati.ore[i]}, y=${dati.ventoMedio[i]}`);
    }

    graficoViento.data.datasets[0].data = punti;
    punti = [];
    for (let i = risultato; i < dati.ore.length; i++) {
        punti.push({
            x: minutiToOre(dati.ore[i]),
            y: dati.raffiche[i]
        });
        //console.log(`Punto ${i}: x=${dati.ore[i]}, y=${dati.ventoMedio[i]}`);
    }

    graficoViento.data.datasets[1].data = punti;
    punti = [];
    for (let i = risultato; i < dati.ore.length; i++) {
        punti.push({
            x: minutiToOre(dati.ore[i]),
            y: 20
        });
        //console.log(`Punto ${i}: x=${dati.ore[i]}, y=${dati.ventoMedio[i]}`);
    }
    graficoViento.data.datasets[2].data = punti;

    //console.log("Dati aggiornati nel grafico del vento:");
    graficoViento.update();
    cambiaColori(Ven, Raff, Dir);
    document.getElementById("vientoDir").textContent = ` ${Dir} `;
    document.getElementById("viento").textContent = `${Ven}/${Raff} Kts`;
    document.getElementById("viento2").textContent = `Temp: ${temp}ºC  a las:${orario}`;
}
function cambiaColori(min, max, dir) {
    let rosso = "#f90707ff";
    let verde = "#18f635ff";
    let colore1 = dammiColore(min);
    let colore2 = dammiColore(max);
    let colore3 = rosso;
    if (dir === "ENE" && min > 16) {
        colore3 = verde;
    }

    //console.log("Colore minimo:", colore1, "Colore massimo:", colore2
    const quadrato1 = document.getElementById("quadrato1");
    quadrato1.style.background = `linear-gradient(to right, ${colore3}, ${colore3})`;
    const quadrato2 = document.getElementById("quadrato2");
    quadrato2.style.background = `linear-gradient(to right, ${colore1}, ${colore2})`;
}
function dammiColore(valore) {
    let colore1 = "#ffffff";// < 14
    let colore2 = "#a3fb9fff"; //<17
    let colore3 = "#c5f55cff"; // <20
    let colore4 = "#fbf309ff"; // < 23
    let colore5 = "#fe6929ff"; // < 26
    let colore6 = "#f11313ff"; // < 29
    let colore7 = "#f884dbff"; // < 32
    let colore8 = "#f91dc5ff";
    let colore9 = "#c406d1ff";// >35
    if (valore < 14) {
        return colore1;
    } else if (valore >= 14 && valore < 17) {
        return colore2;
    } else if (valore >= 17 && valore < 20) {
        return colore3;
    } else if (valore >= 20 && valore < 23) {
        return colore4;
    } else if (valore >= 23 && valore < 26) {
        return colore5;
    } else if (valore >= 26 && valore < 29) {
        return colore6;
    } else if (valore >= 29 && valore < 32) {
        return colore7;
    } else if (valore >= 32 && valore < 35) {
        return colore8;
    } else {
        return colore9;
    }
}
function dammiData(dd) {
    let dataOggi = "";
    if (dd === "oggi") {
        const oggi = new Date();
        const giorno = oggi.getDate().toString().padStart(2, '0');
        const mese = (oggi.getMonth() + 1).toString().padStart(2, '0');
        const anno = oggi.getFullYear();
        dataOggi = `${anno}-${mese}-${giorno}`;
    } else {
        const oggi = new Date();
        const ieri = new Date();
        ieri.setDate(oggi.getDate() - 1);
        const giorno = ieri.getDate().toString().padStart(2, '0');
        const mese = (ieri.getMonth() + 1).toString().padStart(2, '0');
        const anno = ieri.getFullYear();
        dataOggi = `${anno}-${mese}-${giorno}`;
    }
    console.log(dataOggi)
    return dataOggi;
}


// Leggei dati del vento da google sheets
leggiDatiCSV(dammiData("oggi"));



