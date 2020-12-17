# Yet Another MultiGpx Website

Ce site permet d'afficher de multiples traces GPX sur une carte.

Il est déployé sur https://multigpx.vercel.app/psc-1km

## Fonctionnalités

* Utilisation de la carte
    * Vous pouvez changer le fond de carte (3 dispo en cliquant sur l'icone en haut à droite)
    * Quelques infos sur chaque trace en passant la souris, modifiables en cliquant sur la trace
* Gestion des Traces :
    * On peut directement drag'n dropper des fichiers .gpx sur la page. Ils seront rajoutés à la carte
    * Il n'est pas possible aujourd'hui d'effacer des traces, mais on peut les remplacer (même nom de fichier
    * Lorsque vous exporter votre trace GPX depuis Strava, Strava omet certaines information (URL, votre nom, ...). Vous pouvez les rajouter en cliquant sur la trace.
    * Aussi Strava rajoute plein d'info (altiture, mesures cardiaques), que le site ignore (le fichier GPX est expurgé avant sauvegarde)
* Nouvelles Cartes:
    * On peut facilement créer de nouvelles cartes, en changeant le dernier bout de l'url. Ex: https://multigpx.vercel.app/maNouvelleCarteAvecMesSuperTraces
    * Il est prévu d'avoir un annuaire des cartes disponibles. Mais celles commençant par un '_' resteront relativement privées

## Run locally

This site is built on top of NextJs (react), and uses an S3 bucket to store the GPX files. There is currently no database since all the data is stored in the GPX files.

You will need NPM and a AWS S3 Bucket (see below) to run this server locally

Steps:

* git clone this repository
* Install NPM
* Create a .env.local at the root containing

      MY_AWS_ACCESS_KEY=??????
      MY_AWS_SECRET_KEY=??????
      MY_AWS_REGION=??????
      MY_AWS_BUCKET_NAME=??????
      DIR_PREFIX=
  Rqs:
    * The DIR_PREFIX adds a prefix in front of the filePaths in the Bucket, enabling you to share a Bucket with multiple instances
    * AWS variables are prefixed with MY_ to prevent a name clash (see https://vercel.com/docs/platform/limits?query=reserve#reserved-variables)

* run `npm run dev`

## Deploy on Vercel

TODO

## AWS S3 Bucket Setup

* You need to create a S3 Bucket (You might also need to add CORS rules to the Bucket) → `MY_AWS_BUCKET_NAME` and `MY_AWS_REGION`
* and attach a IAM User with the following ACLs on this Bucket:
    * s3:GetObject
    * s3:ListBucket
    * s3:PutObject
    * s3:PutObjectAcl
* Create an access key on this user → `MY_AWS_ACCESS_KEY` and `MY_AWS_SECRET_KEY`

