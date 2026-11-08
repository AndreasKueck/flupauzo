cat > "$HOME/.local/bin/flupauzo" <<'PY'
#!/data/data/com.termux/files/usr/bin/python
import os
import sys

BEFEHLE = {
    "ekstremoj": "extremes",
    "templinio": "timeline",
}

OPTIONEN = {
    "-p": "-n",
    "--starto": "--start",
    "--fino": "--end",
    "--intervalo": "--interval",
}

argumente = sys.argv[1:]

# Unterbefehl übersetzen.
if argumente:
    argumente[0] = BEFEHLE.get(argumente[0], argumente[0])

# Optionen übersetzen; unbekannte Argumente unverändert weiterreichen.
uebersetzt = []
nach_trennzeichen = False

for argument in argumente:
    if nach_trennzeichen:
        uebersetzt.append(argument)
    elif argument == "--":
        nach_trennzeichen = True
        uebersetzt.append(argument)
    elif argument.startswith("--") and "=" in argument:
        name, wert = argument.split("=", 1)
        uebersetzt.append(OPTIONEN.get(name, name) + "=" + wert)
    else:
        uebersetzt.append(OPTIONEN.get(argument, argument))

try:
    os.execvp("slackwater", ["slackwater", *uebersetzt])
except FileNotFoundError:
    print("Eraro: slackwater ne trovighas en PATH.", file=sys.stderr)
    sys.exit(127)
except OSError as fehler:
    print(f"Eraro: {fehler}", file=sys.stderr)
    sys.exit(126)
PY
