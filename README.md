# Flupauzo

## Gheneralo

Flupauzo estas programpako funkcianta neenrete, por prognozi akvonivelojn. Ghi funkcias per komandlinia enigo kadre de la Android-a apo [Termux](https://play.google.com/store/apps/details?id=com.termux). Flupauzo bazighas sur programpako [slackwater](https://github.com/openwatersio/homebrew-tap). Ankau ghi do devas esti instalita.

**La prognozoj estas neoficialaj. Uzi ilin okazas je propra risko.**

## Uzo

Flupauzo prognozas ekstremojn au templinion de akvoniveloj. Jen shablonaj uz-ekzemploj:

```
flupauzo ekstremoj -p 53.76,9.39 --starto 2026-11-15 | flupauzo-eligo
```

Kaj:

```
flupauzo templinio -p 53.76,9.39 --starto 2026-11-15 --fino 2026-11-16 --intervalo 30 | flupauzo-eligo
```

En la ekzemploj `53.76,9.39` specifas lokon kun latitudo 53,76° norde kaj longitudo 9,39° oriente.
Specifas `--intervalo 30` intervalon de 30 minutoj.

Aktuale ne estas subtenataj
- ebloj aliaj, por specifi lokon, kaj
- komandoj aliaj, ol tiaj funkciantaj kombine kun `ekstremoj` kaj `templinio`.

Sekvas priskribo de la procedo, por funkciigi flupauzo-n en sia smartfono.

## Instali npm en Termux

Malfermu apon Termux kaj en ghian konzolon enigu jenan komandon:

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

En la Termux-konzolon enigu unu post la alia jenajn komandojn:

```
mkdir -p "$HOME/.local/bin
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH" >> ~/.bashrc
```

## Krei programon flupauzo

Kopiu la enhavon de [krei_flupauzo_n.sh](https://github.com/AndreasKueck/flupauzo/blob/main/krei_flupauzo_n.sh), algluu ghin en la Termux-konzolon kaj tushu la enigo-klavon.
Poste enigu en la Termux-konzolon jenon:

```
chmod +x "$HOME/.local/bin/flupauzo"
```

## Krei programon flupauzo-eligo

Kopiu la enhavon de [krei_flupauzo_eligo_n.sh](https://github.com/AndreasKueck/flupauzo/blob/main/krei_flupauzo_eligo_n.sh), algluu ghin en la Termux-konzolon kaj tushu la enigo-klavon.
Poste enigu en la Termux-konzolon jenon:

```
chmod +x "$HOME/.local/bin/flupauzo-eligo"
```
