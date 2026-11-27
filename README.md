# Flupauzo

## Du variantoj

- **[Android-apo](android/README.md):** neenreta apo kun staciosercho, kalendaro, ekstremoj kaj templinio. Vidu la apartan priskribon kaj la instrukciojn por konstrui la APK.
- **Komandlinia varianto:** por uzo en Termux. La sekvaj instrukcioj rilatas al tiu varianto.

## Komandlinia varianto

Flupauzo estas programpako funkcianta neenrete, por prognozi akvonivelojn. Ghi funkcias per komandlinia enigo kadre de la Android-a apo [Termux](https://play.google.com/store/apps/details?id=com.termux). Flupauzo bazighas sur programpako [slackwater](https://github.com/openwatersio/homebrew-tap) de [Open Waters](https://github.com/openwatersio). Ankau slackwater do devas esti instalita.

**La prognozoj estas neoficialaj. Uzi ilin okazas je propra risko.**

## Uzo

Flupauzo prognozas ekstremojn au templinion de akvoniveloj. Jen shablonaj uz-ekzemploj:

```
flupauzo ekstremoj -p 52.75,-4.05 --starto 2028-11-15 | flupauzo-eligo
```

Kaj:

```
flupauzo templinio -p 52.75,-4.05 --starto 2028-11-15 --fino 2028-11-16 --intervalo 30 | flupauzo-eligo
```

En la ekzemploj `52.75,-4.05` specifas lokon kun latitudo 52,75° norde kaj longitudo 4,05° okcidente.
Specifas `--intervalo 30` intervalon de 30 minutoj.

Anstatau `-p 52.75,-4.05` oni povas enigi `-s ` plus staciokodon; en la ekzemplo tio estas `ticon/barmouth-bar-gbr-cmems`, do ekzemple<br>

```
flupauzo ekstremoj -s ticon/barmouth-bar-gbr-cmems --starto 2028-11-15 | flupauzo-eligo
```

Por ricevi liston de staciokodoj de stacioj en au proksime al loko de difinita nomo, oni enigu ekzemple

```
flupauzo stacioj "barmouth"
```

Aktuale ne estas subtenataj
- ebloj aliaj, por specifi lokon au stacion, kaj
- komandoj aliaj, ol tiaj funkciantaj kombine kun `ekstremoj`, `stacioj` kaj `templinio`.

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
