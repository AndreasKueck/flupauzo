# Flupauzo

## Gheneralo

Flupauzo estas programpako funkcianta neenrete, por prognozi akvonivelojn. Ghi funkcias per komandlinia enigo kadre de la Android-a apo [Termux](https://play.google.com/store/apps/details?id=com.termux). Flupauzo bazighas sur programpako [slackwater](https://github.com/openwatersio/homebrew-tap). Ankau ghi do devas esti instalita.

## Uzo

Flupauzo eligas ekstremojn au templinion de akvoniveloj. Jen shablonaj ekzemploj (komandoj aliaj, ol kun `ekstremoj` kaj `templinio`, aktuale ne estas subtenataj):

```
flupauzo ekstremoj -p 53.76,9.39 --starto 2026-11-15 | flupauzo-eligo
```

Kaj:

```
flupauzo templinio -p 53.76,9.39 --starto 2026-11-15 --fino 2026-11-16 --intervalo 30 | flupauzo-eligo
```

En la ekzemploj `53.76,9.39` signifas: latitudo 53,76° norde, longitudo 9.39° oriente.

Sekvas priskribo de la procedo, por funkciigi flupauzo-n en sia smartfono.

## Instali npm en Termux

Malfermu apon Termux kaj en ghian konzolon kaj enigu jenan komandon:

```
pkg install npm
```

## Instali slackwater en Termux

En la Termux-konzolon enigu jenan komandon:

```
npm install -g @slackwater/cli
```

## Instali Pitonon en Termux

En la Termux-konzolon enigu unu post la alia jenajn komandojn:

```
pkg update
pkg upgrade
pkg install python
```

## Prepari kelkajn pliajn aferojn

En la Termux-konzolon enigu post la alia jenajn komandojn:

```
mkdir -p "$HOME/.local/bin
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH" >> ~/.bashrc
```

## Krei programon flupauzo


```

```

Kaj:

```
chmod +x "$HOME/.local/bin/flupauzo"
```

## Krei programon flupauzo-eligo

Enigu ...

```
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

# ANSI-Steuersequenzen, insbesondere Farben, entfernen.
ANSI = re.compile(r"\x1b\[[0-?]*[ -/]*[@-~]")

DATUM = re.compile(
    r"([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})"
)

# Beispiele:
# 6:17 AM GMT+1
# 12:56 AM GMT+01:00
# 18:37 UTC+2
# 05:17 UTC
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

TYPEN = {
    "high": "Mak.",
    "low": "Min.",
    "high tide": "Mak.",
    "low tide": "Min.",
    "mak.": "Mak.",
    "min.": "Min.",
}

KOEPFE = {
    3: ("Dato", "Horo (UTK)", "Nivelo"),
    4: ("Dato", "Horo (UTK)", "Tipo", "Nivelo"),
}


def ist_rahmen(zeile):
    """Alte ASCII- und Unicode-Tabellenrahmen erkennen."""
    text = zeile.strip()
    return bool(text) and all(
        zeichen in "+-|=: "
        or "\u2500" <= zeichen <= "\u257f"
        for zeichen in text
    )


def zellen_lesen(zeile):
    """Tabellenzeile mit ASCII- oder Unicode-Trennzeichen lesen."""
    text = zeile.strip()
    if not text or text[0] not in "|│┃":
        return None

    return [
        zelle.strip()
        for zelle in re.split(r"[|│┃]", text.strip("|│┃"))
    ]


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


def nach_utk(lokales_datum, text):
    treffer = ZEIT.fullmatch(text)
    if not treffer:
        raise ValueError(
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

    offset = timedelta(
        hours=offset_stunde,
        minutes=offset_minute,
    )
    if treffer["zeichen"] == "-":
        offset = -offset

    lokal = datetime(
        lokales_datum.year,
        lokales_datum.month,
        lokales_datum.day,
        stunde,
        minute,
        tzinfo=timezone(offset),
    )
    return lokal.astimezone(timezone.utc)


def beschriftung_uebersetzen(text):
    text = re.sub(r"\bmeters\b", "metroj", text, flags=re.I)
    text = re.sub(r"\bStation\b", "Stacio", text, flags=re.I)
    text = re.sub(r"\bLocation\b", "Loko", text, flags=re.I)
    return text


def tabelle_bauen(daten, kopf):
    """Drei Spalten für timeline, vier Spalten für extremes."""
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

        # Beide Tabellenformate erkennen:
        # timeline: Date | Time | Level
        # extremes: Date | Time | Type | Level
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

                datum_text = zellen[0]
                zeit_text = zellen[1]
                niveau = zellen[-1]

                # Leere Datumsfelder beziehen sich auf das zuletzt
                # gelesene lokale Datum, nicht auf das UTK-Datum.
                if datum_text:
                    lokales_datum = datum_lesen(datum_text)

                if lokales_datum is None:
                    raise ValueError("Mankas dato por la unua evento.")

                utk = nach_utk(lokales_datum, zeit_text)

                neue_zeile = [
                    utk.date().isoformat(),
                    utk.strftime("%H:%M"),
                ]

                # Nur extremes besitzt eine Typ-Spalte.
                if len(kopf) == 4:
                    typ = zellen[2]
                    neue_zeile.append(
                        TYPEN.get(typ.casefold(), typ)
                    )

                neue_zeile.append(
                    beschriftung_uebersetzen(niveau).replace(".", ",")
                )
                daten.append(tuple(neue_zeile))
                continue

            # Text nach der Tabelle.
            ausgabe.extend(tabelle_bauen(daten, kopf))
            daten = None
            kopf = None

        ausgabe.append(beschriftung_uebersetzen(zeile))

    if daten is not None:
        ausgabe.extend(tabelle_bauen(daten, kopf))

    return "\n".join(ausgabe).rstrip() + "\n"


def main():
    try:
        # Erst nach erfolgreicher Umrechnung ausgeben.
        sys.stdout.write(umwandeln(sys.stdin))
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

```

Kaj:

```
chmod +x "$HOME/.local/bin/flupauzo-eligo"

```

Kaj:

```
chmod +x "$HOME/.local/bin/flupauzo"
```
