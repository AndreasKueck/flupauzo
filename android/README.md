# Flupauzo por Android

Flupauzo 0.9 estas Android-apo por neenreta uzo. Oni povas serchi stacion, elekti daton per kalendaro au enigi ghin rekte, kaj vidi ekstremojn au templinion de akvoniveloj. Por uzi la instalitan apon, oni ne bezonas Termux.

**La prognozoj estas taksoj. La efektivaj kondichoj povas diferenci de la prognozoj. Ne uzu apon Flupauzo, kiel solan bazon por navigacio au por decidoj pri sekureco. Konsultu aktualajn oficialajn lokajn informojn.**

## Konstrui la APK per Termux

Por la konstruado necesas Bash, Node.js kun npm, `javac`, `dx`, `aapt2`, `zip`, `zipalign` kaj `sha256sum`. La konstruskripto uzas `android.jar` de Android API 28. La normala loko estas `$HOME/flupauzo-sdk/android-28/android.jar`. Por uzi alian lokon, agordu la medivariablon `ANDROID_JAR`.

En la radika dosierujo de la deponejo rulu:

```sh
cd android
bash build-apk.sh
```

La skripto instalas la dependajhojn el `package-lock.json` per `npm ci`. Por la unua konstruado necesas retkonekto. Ne necesas aparte instali la komandlinian programon de Slackwater. La stacia datumbazo venas el `@slackwater/database`; la skripto kontrolas ghian SHA-256-kontrolsumon antau ol enmeti ghin en la APK.

La rezulto estas `build/Flupauzo-0.9-unsigned.apk`. Ghi jam estas vicigita per `zipalign`, sed ankorau ne subskribita. Antau instalado necesas subskribi ghin per `apksigner`. Por ghisdatigi jam instalitan version sen malinstali ghin, uzu la saman subskriban shlosilon kiel por la instalita versio. Privata shlosilo ne apartenas al la deponejo.

## Autoro, fontoj kaj licencoj

Autoro de Flupauzo: Andreas Kück. La kodo verkita de Andreas Kück por Flupauzo estas disponebla lau la [MIT-permesilo](../LICENSE).

Flupauzo uzas Slackwater de Open Waters. La permesiloj de eksteraj programaroj kaj datumaroj restas apartaj. En la apo, «Pri Flupauzo kaj licencoj» enhavas la programarajn licenctekstojn, la datumbazan NOTICE kaj superrigardon de la datumfontoj. «Fonto kaj licenco de la stacio» montras la informojn pri la elektita stacio. Ekzemple, la datumoj de TICON-4 por Barmouth estas sub CC BY-NC 4.0; tio ne estas la permesilo de la tuta projekto.
