mkdir -p "$HOME/.local/bin"

cat > "$HOME/.local/bin/flupauzo" <<'PY'
#!/data/data/com.termux/files/usr/bin/python
import os
import subprocess
import sys
from pathlib import Path


BEFEHLE = {
    "stacioj": "stations",
    "ekstremoj": "extremes",
    "templinio": "timeline",
}

OPTIONEN = {
    "-p": "-n",
    "--starto": "--start",
    "--fino": "--end",
    "--intervalo": "--interval",
}
# -s ist bereits die slackwater-Option für eine Stations-ID.
# Sie muss ebenso wie die ID selbst nicht übersetzt werden.


def argumente_uebersetzen(argumente):
    if not argumente:
        return []

    ergebnis = [BEFEHLE.get(argumente[0], argumente[0])]
    nach_trennzeichen = False

    for argument in argumente[1:]:
        if nach_trennzeichen:
            ergebnis.append(argument)
        elif argument == "--":
            nach_trennzeichen = True
            ergebnis.append(argument)
        elif argument.startswith("--") and "=" in argument:
            name, wert = argument.split("=", 1)
            ergebnis.append(OPTIONEN.get(name, name) + "=" + wert)
        else:
            ergebnis.append(OPTIONEN.get(argument, argument))

    return ergebnis


def main():
    argumente = argumente_uebersetzen(sys.argv[1:])
    befehl = argumente[0] if argumente else None
    aufruf = ["slackwater", *argumente]

    # Hilfe und fremde Unterbefehle nicht als Datenausgabe behandeln.
    optionen = argumente[:argumente.index("--")] if "--" in argumente else argumente
    hilfe = any(arg in ("-h", "--help", "--version") for arg in optionen)

    try:
        if hilfe or befehl not in BEFEHLE.values():
            os.execvp("slackwater", aufruf)

        # Nur stdout filtern. Fehlermeldungen auf stderr bleiben sichtbar.
        ergebnis = subprocess.run(aufruf, stdout=subprocess.PIPE)
        if ergebnis.returncode != 0:
            sys.stdout.buffer.write(ergebnis.stdout)
            code = ergebnis.returncode
            return code if code > 0 else 128 - code

        filterpfad = Path(__file__).resolve().with_name("flupauzo-eligo")
        filteraufruf = [sys.executable, str(filterpfad)]
        if befehl == "stations":
            filteraufruf.append("--stacioj")

        return subprocess.run(filteraufruf, input=ergebnis.stdout).returncode

    except FileNotFoundError as fehler:
        print(f"Eraro: {fehler}", file=sys.stderr)
        return 127
    except BrokenPipeError:
        return 0
    except OSError as fehler:
        print(f"Eraro: {fehler}", file=sys.stderr)
        return 126


if __name__ == "__main__":
    sys.exit(main())
PY
