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

```

Kaj:

```
chmod +x "$HOME/.local/bin/flupauzo-eligo"

```

Kaj:

```
chmod +x "$HOME/.local/bin/flupauzo"
```
