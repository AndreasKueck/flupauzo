cat > "$HOME/.local/bin/flupauzo-eligo" <<'PY'
#!/data/data/com.termux/files/usr/bin/python
import re
import sys
from datetime import date, datetime, timedelta, timezone


MONATE = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4,
    "may": 5, "jun": 6, "jul": 7, "aug": 8,
    "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}

ANSI = re.compile(r"\x1b\[[0-?]*[ -/]*[@-~]")

DATUM = re.compile(r"([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})")

ZEIT = re.compile(
    r"(?P<stunde>\d{1,2}):(?P<minute>[0-5]\d)"
    r"\s*(?P<ampm>AM|PM)?"
    r"\s*(?:GMT|UTC|UTK|Z)"
    r"(?:\s*(?P<zeichen>[+-])"
    r"(?P<offset_stunde>\d{1,2})"
    r"(?::?(?P<offset_minute>[0-5]\d))?"
    r")?",
    re.IGNORECASE,
)

# Zum Beispiel: ticon/rechtenfleth-4970030-deu-wsv
STATIONS_ID = re.compile(
    r"(?<![\w./-])"
    r"[A-Za-z0-9][A-Za-z0-9_.-]*/"
    r"[A-Za-z0-9][A-Za-z0-9_.-]*"
    r"(?![\w/-])"
)

ID_KOEPFE = {"id", "station id", "station identifier"}

TYPEN = {
    "high": "Mak.",
    "low": "Min.",
    "high tide": "Mak.",
    "low tide": "Min.",
    "mak.": "Mak.",
    "min.": "Min.",
}

KOEPFE = {
    3: ("Dato", "Horo", "Nivelo"),
    4: ("Dato", "Horo", "Tipo", "Nivelo"),
}


def ist_rahmen(zeile):
    text = zeile.strip()
    return bool(text) and all(
        zeichen in "+-|=: " or "\u2500" <= zeichen <= "\u257f"
        for zeichen in text
    )


def zellen_lesen(zeile):
    text = zeile.strip()
    if not text or text[0] not in "|│┃":
        return None
    return [
        zelle.strip()
        for zelle in re.split(r"[|│┃]", text.strip("|│┃"))
    ]


def stations_ids(eingabe):
    id_spalte = None
    gesehen = set()

    for original in eingabe:
        zeile = ANSI.sub("", original).strip()
        if not zeile or ist_rahmen(zeile):
            continue

        zellen = zellen_lesen(zeile)
        if zellen is not None:
            koepfe = [
                re.sub(r"[\s_-]+", " ", zelle.casefold())
                for zelle in zellen
            ]
            spalte = next(
                (i for i, kopf in enumerate(koepfe) if kopf in ID_KOEPFE),
                None,
            )
            if spalte is not None:
                id_spalte = spalte
                continue

        if id_spalte is not None and zellen is not None:
            # Bei bekanntem Kopf nur die ID-Spalte ausgeben.
            kandidaten = zellen[id_spalte:id_spalte + 1]
        else:
            # Auch Klartext wie "ID: ticon/..." verarbeiten.
            kandidaten = STATIONS_ID.findall(zeile)

        for stations_id in kandidaten:
            if stations_id and stations_id not in gesehen:
                gesehen.add(stations_id)
                yield stations_id


def datum_lesen(text):
    try:
        return date.fromisoformat(text)
    except ValueError:
        pass

    treffer = DATUM.fullmatch(text)
    if not treffer:
        raise ValueError(f"Nekonata dato: {text!r}")

    monat = MONATE.get(treffer[1].casefold())
    if monat is None:
        raise ValueError(f"Nekonata monato: {treffer[1]!r}")

    return date(int(treffer[3]), monat, int(treffer[2]))


class UnbekanntesZeitformat(ValueError):
    pass


def nach_utk(lokales_datum, text):
    treffer = ZEIT.fullmatch(text)
    if not treffer:
        raise UnbekanntesZeitformat(
            f"Nekonata horformato aŭ mankanta horzono: {text!r}"
        )

    stunde = int(treffer["stunde"])
    minute = int(treffer["minute"])
    ampm = treffer["ampm"]

    if ampm:
        if not 1 <= stunde <= 12:
            raise ValueError(f"Nevalida horo: {text!r}")
        stunde %= 12
        if ampm.upper() == "PM":
            stunde += 12
    elif not 0 <= stunde <= 23:
        raise ValueError(f"Nevalida horo: {text!r}")

    offset_stunde = int(treffer["offset_stunde"] or 0)
    offset_minute = int(treffer["offset_minute"] or 0)
    if offset_stunde > 23:
        raise ValueError(f"Nevalida horzono: {text!r}")

    offset = timedelta(hours=offset_stunde, minutes=offset_minute)
    if treffer["zeichen"] == "-":
        offset = -offset

    lokal = datetime(
        lokales_datum.year, lokales_datum.month, lokales_datum.day,
        stunde, minute, tzinfo=timezone(offset),
    )
    return lokal.astimezone(timezone.utc)


def beschriftung_uebersetzen(text):
    text = re.sub(r"\bmeters\b", "metroj", text, flags=re.I)
    text = re.sub(r"\bStation\b", "Stacio", text, flags=re.I)
    return re.sub(r"\bLocation\b", "Loko", text, flags=re.I)


def tabelle_bauen(daten, kopf):
    alle = [kopf] + daten
    spaltenzahl = len(kopf)
    breiten = [
        max(len(zeile[i]) for zeile in alle)
        for i in range(spaltenzahl)
    ]

    def formatieren(zeile):
        return "  ".join(
            text.rjust(breiten[i])
            if i == spaltenzahl - 1
            else text.ljust(breiten[i])
            for i, text in enumerate(zeile)
        ).rstrip()

    return [
        formatieren(kopf),
        "  ".join("-" * breite for breite in breiten),
        *(formatieren(zeile) for zeile in daten),
    ]


def umwandeln(eingabe):
    ausgabe = []
    daten = None
    kopf = None
    lokales_datum = None

    for original in eingabe:
        zeile = ANSI.sub("", original).rstrip("\r\n")
        if ist_rahmen(zeile):
            continue

        zellen = zellen_lesen(zeile)

        if (
            zellen
            and len(zellen) in KOEPFE
            and zellen[0].casefold() in ("date", "dato")
            and zellen[1].casefold() in ("time", "horo")
        ):
            if daten is not None:
                ausgabe.extend(tabelle_bauen(daten, kopf))

            kopf = KOEPFE[len(zellen)]
            daten = []
            lokales_datum = None
            continue

        if daten is not None:
            if not zeile.strip():
                continue

            if zellen is not None:
                if len(zellen) != len(kopf):
                    raise ValueError(
                        f"Atendataj {len(kopf)} kolumnoj: {zeile!r}"
                    )

                # Leere Datumsfelder beziehen sich auf das vorherige
                # lokale Datum, auch bei einem Tageswechsel in UTK.
                if zellen[0]:
                    lokales_datum = datum_lesen(zellen[0])
                if lokales_datum is None:
                    raise ValueError("Mankas dato por la unua evento.")

                try:
                    utk = nach_utk(lokales_datum, zellen[1])
                except UnbekanntesZeitformat:
                    neue_zeile = [lokales_datum.isoformat(), zellen[1]]
                else:
                    neue_zeile = [
                        utk.date().isoformat(),
                        utk.strftime("%H:%M") + " UTK",
                    ]

                if len(kopf) == 4:
                    typ = zellen[2]
                    neue_zeile.append(TYPEN.get(typ.casefold(), typ))

                neue_zeile.append(
                    beschriftung_uebersetzen(zellen[-1]).replace(".", ",")
                )
                daten.append(tuple(neue_zeile))
                continue

            ausgabe.extend(tabelle_bauen(daten, kopf))
            daten = None
            kopf = None

        ausgabe.append(beschriftung_uebersetzen(zeile))

    if daten is not None:
        ausgabe.extend(tabelle_bauen(daten, kopf))

    return "\n".join(ausgabe).rstrip() + "\n"


def main():
    try:
        if sys.argv[1:] == ["--stacioj"]:
            for stations_id in stations_ids(sys.stdin):
                print(stations_id)
        elif not sys.argv[1:]:
            sys.stdout.write(umwandeln(sys.stdin))
        else:
            print("Uzo: flupauzo-eligo [--stacioj]", file=sys.stderr)
            return 2

        sys.stdout.flush()
    except ValueError as fehler:
        print(f"Eraro: {fehler}", file=sys.stderr)
        return 1
    except BrokenPipeError:
        return 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
PY
