# MatteLab

Nettside for barn (1.-8. trinn) med matte- og norsk-oppgaver. Ingen innlogging eller sporing. To egne sider: `matte.html` og `norsk.html`, pluss `about.html` og `contact.html`.

## Struktur
- `index.html` – landingsside med valg av fag.
- `matte.html` + `script-matte.js` – matteoppgaver (300–400 oppgaver), filtre, start/skip/neste.
- `norsk.html` + `script-norsk.js` – norsk med lyd (opptil 500 oppgaver), kategorier (ord/setning/preposisjon/tall).
- `about.html` – info om tjenesten.
- `contact.html` – kontakt + mailto-skjema (kilwe501@hotmail.com, tlf 400 97 347).
- `styles.css` – felles stil, grønt tema, responsive menyer.

## Kjør lokalt
Åpne `index.html` direkte i nettleser, eller start en enkel server:
```bash
npx serve .
# eller
python -m http.server 8000
```

## Deploy til GitHub Pages
1. Commit endringer:
```bash
git add index.html matte.html norsk.html about.html contact.html script-matte.js script-norsk.js styles.css
git commit -m "Oppdater matte/norsk sider"
```
2. Push til `main` (eller `gh-pages` hvis du bruker den):
```bash
git push
```
3. Sørg for at Pages peker på `main` / `docs` eller rot, avhengig av oppsettet ditt.

## Kontakt
- E-post: kilwe501@hotmail.com
- Telefon: +47 400 97 347
