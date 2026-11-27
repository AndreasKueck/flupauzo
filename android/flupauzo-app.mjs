import { findStation } from "slackwater";

document.head.insertAdjacentHTML("beforeend",
  '<meta name="viewport" content="width=device-width, initial-scale=1">');

document.body.innerHTML = `
  <style>
    body { font: 1rem sans-serif; margin: 1.2rem; max-width: 36rem }
    label { display: block; margin: 1rem 0 }
    input, button { font: inherit; padding: .55rem }
    input { display: block; box-sizing: border-box; width: 100% }
    pre { font-size: 1rem; overflow-x: auto }
  </style>
  <h1>Flupauzo</h1>
  <form id="formo">
    <label>Stacia kodo
      <input id="stacio" value="ticon/barmouth-bar-gbr-cmems"
             required spellcheck="false" autocapitalize="none">
    </label>
    <label>Dato (UTK)
      <input id="dato" type="text" inputmode="numeric" value="2028-11-15"
             placeholder="2050-11-15" required aria-describedby="datohelpo">
      <small id="datohelpo">Ekz.: 20501115 = 2050-11-15</small>
    </label>
    <label>Au elektu per kalendaro
      <input id="kalendaro" type="date" value="2028-11-15">
    </label>
    <button>Prognozi</button>
  </form>
  <pre id="eligo" aria-live="polite"></pre>
  <small>La prognozoj estas neoficialaj. Uzu ilin je propra risko.</small>`;

const formo = document.querySelector("#formo");
const eligo = document.querySelector("#eligo");
const butono = formo.querySelector("button");

formo.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  butono.disabled = true;
  eligo.textContent = "Kalkulante …";
  try {
    const kodo = document.querySelector("#stacio").value.trim();
    const dato = legiDaton(datokampo.value);
    if (!dato) {
      eligo.textContent = "Nevalida dato. Ekz.: 20501115 = 2050-11-15.";
      datokampo.focus();
      return;
    }
    datokampo.value = dato;
    const start = new Date(dato + "T00:00:00Z");
    const end = new Date(start.getTime() + 86400000);
    const station = await findStation(kodo);
    const { extremes } = await station.getExtremesPrediction({
      start, end, units: "meters"
    });

    const linioj = [];
    for (const e of extremes) {
      const iso = new Date(e.time).toISOString();
      if (iso.slice(0, 10) !== dato) continue;
      const horo = iso.slice(11, 16);
      const tipo = e.high ? "Mak." : "Min.";
      const nivelo = e.level.toFixed(2).replace(".", ",");
      linioj.push(`${horo}      ${tipo}   ${nivelo} m`);
    }
    eligo.textContent = linioj.length
      ? `${dato}\n\nHoro (UTK) Tipo   Nivelo\n${linioj.join("\n")}`
      : "Neniuj ekstremoj por tiu dato.";
  } catch (eraro) {
    eligo.textContent = "Eraro: " + (eraro.message || eraro);
  } finally {
    butono.disabled = false;
  }
});


const datokampo = document.querySelector("#dato");
const kalendaro = document.querySelector("#kalendaro");

export function legiDaton(enigo) {
  let dato = enigo.trim();
  if (/^\d{8}$/.test(dato)) {
    dato = `${dato.slice(0, 4)}-${dato.slice(4, 6)}-${dato.slice(6)}`;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dato) || dato.startsWith("0000")) return null;
  const tago = new Date(dato + "T00:00:00Z");
  if (Number.isNaN(tago.getTime())) return null;
  return tago.toISOString().slice(0, 10) === dato ? dato : null;
}

datokampo.addEventListener("input", () => {
  kalendaro.value = legiDaton(datokampo.value) || "";
});
kalendaro.addEventListener("change", () => {
  if (kalendaro.value) datokampo.value = kalendaro.value;
});
