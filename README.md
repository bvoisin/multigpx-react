# Yet Another MultiGpx Website

Ce site permet d'afficher de multiples traces GPX sur une carte.

Il est déployé sur https://multigpx.vercel.app/psc-1km

## Fonctionalités

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
    