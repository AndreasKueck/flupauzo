import "./flupauzo-templinio.mjs";
import { loadStations } from "@slackwater/database";
import tekstoj from "./flupauzo-licencoj.json";

function elemento(tipo, teksto) {
  const e = document.createElement(tipo);
  if (teksto != null) e.textContent = teksto;
  return e;
}

function sekcio(patro, titolo) {
  const d = elemento("details");
  d.style.margin = "1rem 0";
  const s = elemento("summary", titolo);
  s.style.cursor = "pointer";
  d.appendChild(s);
  patro.appendChild(d);
  return d;
}

function tekstbloko(patro, teksto) {
  const p = elemento("pre", teksto);
  p.style.cssText = "white-space:pre-wrap;overflow-wrap:anywhere;font:inherit";
  patro.appendChild(p);
}

const stacikampo = document.querySelector("#stacio");
const stacia = sekcio(document.body, "Fonto kaj licenco de la stacio");
const informo = elemento("div");
stacia.appendChild(informo);

async function montriStacion() {
  if (!stacia.open) return;
  const id = stacikampo.value.trim();
  informo.textContent = "Legante …";
  try {
    const db = await loadStations();
    if (id !== stacikampo.value.trim()) return;
    const s = db.all.find(x => x.id === id);
    informo.replaceChildren();
    if (!s) {
      informo.textContent = "Stacio ne trovita. Elektu stacion au kontrolu la kodon.";
      return;
    }
    informo.appendChild(elemento("h3", `${s.name} — ${s.id}`));
    const eroj = [
      s.attribution, s.source?.url, s.license?.type, s.license?.url,
      s.license?.notes, s.disclaimers
    ];
    for (const ero of eroj) {
      if (ero == null || ero === "") continue;
      if (Array.isArray(ero) && !ero.length) continue;
      tekstbloko(informo, typeof ero === "string" ? ero : JSON.stringify(ero, null, 2));
    }
  } catch (e) {
    informo.textContent = "Eraro: " + (e.message || e);
  }
}

stacia.addEventListener("toggle", montriStacion);
// Alte Angaben nicht unter einer neu eingegebenen oder gewählten Station zeigen.
stacikampo.addEventListener("input", () => { stacia.open = false; });
document.querySelector("#trovoj").addEventListener("click", () => { stacia.open = false; });

const pri = sekcio(document.body, "Pri Flupauzo kaj licencoj");
pri.appendChild(elemento("p", "Autoro de Flupauzo: Andreas Kück"));
pri.appendChild(elemento("p", "La kodo verkita de Andreas Kück por Flupauzo estas disponebla lau la MIT-permesilo."));
pri.appendChild(elemento("p", "La prognozoj estas taksoj. La efektivaj kondichoj povas diferenci de la prognozoj. Ne uzu apon Flupauzo, kiel solan bazon por navigacio au por decidoj pri sekureco. Konsultu aktualajn oficialajn lokajn informojn."));

pri.appendChild(elemento("p",
  "Flupauzo uzas Slackwater de Open Waters por kalkuli la prognozojn."));
tekstbloko(pri, "Slackwater: https://openwaters.io/tides/slackwater/");

pri.appendChild(elemento("h3", "Programaro kaj originalaj licenctekstoj"));
for (const t of tekstoj) {
  tekstbloko(sekcio(pri, t.titel), t.text);
}

const fontoj = sekcio(pri, "Datumfontoj kaj licencoj");
fontoj.appendChild(elemento("p",
  "La licenco dependas de la datumfonto kaj de la stacio. " +
  "Iuj datumoj estas sub CC BY-NC 4.0. " +
  "Por la originalaj indikoj pri unu stacio, vidu «Fonto kaj licenco de la stacio»."));
const listo = elemento("ul");
fontoj.appendChild(listo);
fontoj.addEventListener("toggle", async () => {
  if (!fontoj.open || listo.childElementCount) return;
  try {
    const db = await loadStations();
    const grupoj = new Map();
    for (const s of db.all) {
      const k = `${s.source?.name ?? "?"} — ${s.license?.type ?? "?"}`;
      grupoj.set(k, (grupoj.get(k) || 0) + 1);
    }
    listo.replaceChildren();
    for (const [k, n] of [...grupoj].sort(([a], [b]) => a.localeCompare(b))) {
      listo.appendChild(elemento("li", `${k} (${n})`));
    }
  } catch (e) {
    listo.textContent = "Eraro: " + (e.message || e);
  }
});
