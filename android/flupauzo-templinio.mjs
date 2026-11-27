import "./flupauzo-sercho.mjs";
import { legiDaton } from "./flupauzo-app.mjs";
import { findStation } from "slackwater";

const formo = document.querySelector("#formo");
const eligo = document.querySelector("#eligo");
const butono = formo.querySelector("button");

const elekto = document.createElement("label");
elekto.textContent = "Prognoza tipo ";
const tipo = document.createElement("select");
tipo.style.cssText = "font:inherit;padding:.5rem";
tipo.add(new Option("Ekstremoj", "ekstremoj"));
tipo.add(new Option("Templinio", "templinio"));
elekto.appendChild(tipo);
formo.prepend(elekto);

const kampoj = document.createElement("fieldset");
kampoj.innerHTML = `
  <legend>Templinio</legend>
  <label>Fina dato (inkluzive)
    <input id="fina-dato" type="text" inputmode="numeric"
           placeholder="Ekz.: 20281116">
    <small>Lasu malplena por montri nur la komencan tagon.</small>
  </label>
  <label>Intervalo (minutoj)
    <input id="intervalo" type="number" min="1" max="1440"
           step="1" value="30" required>
  </label>`;
butono.before(kampoj);

function montriKampon() {
  const aktiva = tipo.value === "templinio";
  kampoj.hidden = !aktiva;
  kampoj.disabled = !aktiva;
  eligo.textContent = "";
}
tipo.addEventListener("change", montriKampon);
montriKampon();

formo.addEventListener("submit", async (evento) => {
  // Für Ekstremoj bleibt der bisherige Formularablauf unverändert.
  if (tipo.value !== "templinio") return;
  evento.preventDefault();
  evento.stopImmediatePropagation();

  const datokampo = document.querySelector("#dato");
  const finoKampo = document.querySelector("#fina-dato");
  const dato = legiDaton(datokampo.value);
  const finaDato = finoKampo.value.trim() ? legiDaton(finoKampo.value) : dato;
  if (!dato || !finaDato) {
    eligo.textContent = "Nevalida dato. Ekz.: 20281115 = 2028-11-15.";
    (!dato ? datokampo : finoKampo).focus();
    return;
  }
  if (finaDato < dato) {
    eligo.textContent = "La fina dato estas antau la komenca dato.";
    return;
  }

  const minutoj = Number(document.querySelector("#intervalo").value);
  if (!Number.isInteger(minutoj) || minutoj < 1 || minutoj > 1440) {
    eligo.textContent = "Elektu intervalon inter 1 kaj 1440 minutoj.";
    return;
  }

  const start = new Date(dato + "T00:00:00Z");
  const fino = new Date(finaDato + "T00:00:00Z");
  const limo = fino.getTime() + 86400000;
  if (Math.ceil((limo - start.getTime()) / (minutoj * 60000)) > 2000) {
    eligo.textContent = "Tro da vicoj. Mallongigu la periodon au pligrandigu la intervalon.";
    return;
  }

  datokampo.value = dato;
  if (finoKampo.value.trim()) finoKampo.value = finaDato;
  butono.disabled = true;
  tipo.disabled = true;
  eligo.textContent = "Kalkulante …";
  try {
    const kodo = document.querySelector("#stacio").value.trim();
    const station = await findStation(kodo);
    const { timeline } = await station.getTimelinePrediction({
      start, end: new Date(limo), units: "meters", timeFidelity: minutoj * 60
    });
    const linioj = [];
    for (const punkto of timeline) {
      const t = new Date(punkto.time);
      if (t < start || t.getTime() >= limo) continue;
      const iso = t.toISOString();
      const nivelo = punkto.level.toFixed(2).replace(".", ",");
      linioj.push(`${iso.slice(0,10)}  ${iso.slice(11,16)}       ${nivelo} m`);
    }
    eligo.textContent = linioj.length
      ? "Dato        Horo (UTK)  Nivelo\n" + linioj.join("\n")
      : "Neniuj niveloj por tiu periodo.";
  } catch (eraro) {
    eligo.textContent = "Eraro: " + (eraro.message || eraro);
  } finally {
    butono.disabled = false;
    tipo.disabled = false;
  }
}, true);
