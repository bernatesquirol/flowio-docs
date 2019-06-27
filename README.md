# Guia del desenvolupador - flowio-docs

Aquesta és la guia per a desenvolupadors del repositori flowio-docs. 

## Dependències 🚩

- `electron`
- `electron-builder`
- `flowio-core`
  - `pako`
  - `lodash`
  - `xml2js`

## Instal·lació 💻

Per tal d'instal·lar-ho com a desenvolupador es necessiten les comandes `git`  i `npm` (Node.JS):

`git clone --recursive https://github.com/bernatesquirol/flowio-docs.git`

`cd ./flowio-docs`

`npm install`

`cd ./flowio-core`

`npm install`

Torna a l'arrel (`flowio-desktop`): `cd ..`

`npm start`

Les dependencies estan enllaçades a través de submòduls de git. La qual cosa quan es commita un submòdul, també s'ha de commitar el(s) mòdul(s) superior(s) (sinó, no canvia la referència al nou commit).

## Release 🗃

Es crea el release amb [electron-builder](https://www.electron.build/) i es fa corrent l'script:

`npm run-script release`

Per defecte crea la versió portable, la unpacked i la d'instal·lació.

## Documentació 📖

Aquesta aplicació és un wrap d'electron de [docsify](https://docsify.js.org/#/quickstart)

#### `main.js`

És el punt d'entrada de l'aplicació, agafa els paràmetres de l'urlParams.json de flowio-desktop, i crea una vista utilitzant docsify

#### `flowio-docs.js`

Converteix els diagrames en el format de docsify, tot creant les sidebars i els README's de cada carpeta. Ho crea tot en una carpeta `_docs` allà on tenim tots els diagrames (`flowio_path`). Preserva l'estructura de carpetes de la carpeta on es guarda tot

## Bugs coneguts 🐛

- si no hi ha connexió a internet no es carreguen els esquemes de la documentació (per culpa de la dependència de `viewer.min.js`)

## Millores possibles ✅

- Implementar un buscador