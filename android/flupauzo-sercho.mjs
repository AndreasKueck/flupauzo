import "./flupauzo-app.mjs";
import { loadStations } from "@slackwater/database";

const prognozformularo = document.querySelector("#formo");
const stacikampo = document.querySelector("#stacio");

const sekcio = document.createElement("section");
sekcio.innerHTML = `
  <form id="serchformularo">
    <label>Serchi stacion lau nomo
      <input id="serchvorto" type="search" placeholder="Ekz. Barmouth"
             required autocomplete="off">
    </label>
    <button type="submit">Serchi</button>
  </form>
  <p id="serchstato" aria-live="polite"></p>
  <div id="trovoj"></div>
`;
prognozformularo.before(sekcio);

const serchformularo = sekcio.querySelector("#serchformularo");
const serchvorto = sekcio.querySelector("#serchvorto");
const stato = sekcio.querySelector("#serchstato");
const trovoj = sekcio.querySelector("#trovoj");
const serchbutono = serchformularo.querySelector("button");
let datumbazo;

function normaligi(teksto) {
  return String(teksto ?? "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

serchformularo.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  trovoj.textContent = "";
  const vorto = normaligi(serchvorto.value.trim());
  if (!vorto) {
    stato.textContent = "Enigu stacinomon.";
    return;
  }

  serchbutono.disabled = true;
  stato.textContent = "Serchante …";
  try {
    datumbazo ??= await loadStations();
    const stacioj = datumbazo.accepted.filter(s =>
      s.kind === "tide" &&
      (normaligi(s.name).includes(vorto) || normaligi(s.id).includes(vorto))
    );

    if (!stacioj.length) {
      stato.textContent = "Neniu stacio trovita.";
      return;
    }
    stato.textContent = stacioj.length > 20
      ? `Trovoj: ${stacioj.length}. Jen la unuaj 20; precizigu la nomon laubezone.`
      : `Trovoj: ${stacioj.length}. Elektu stacion:`;

    for (const s of stacioj.slice(0, 20)) {
      const butono = document.createElement("button");
      butono.type = "button";
      butono.textContent = `${s.name} — ${s.id}`;
      butono.style.cssText =
        "display:block;width:100%;margin:.4rem 0;text-align:left;overflow-wrap:anywhere";
      butono.addEventListener("click", () => {
        stacikampo.value = s.id;
        document.querySelector("#eligo").textContent = "";
        trovoj.textContent = "";
        stato.textContent = `Elektita stacio: ${s.name}`;
        prognozformularo.scrollIntoView({block: "nearest"});
      });
      trovoj.appendChild(butono);
    }
  } catch (eraro) {
    stato.textContent = "Eraro: " + (eraro.message || eraro);
  } finally {
    serchbutono.disabled = false;
  }
});
