# Fynnhofmann.com -- Projektübersicht

Stand: 2026-02-09

Dieses Repo ist meine persönliche Webplattform. Die Seite läuft statisch
über Cloudflare Pages und nutzt Supabase für Login und Daten.

Die Idee dahinter: Nicht nur eine Website, sondern ein persönliches
Control Center.

------------------------------------------------------------------------

## Aufbau der Seite

Startseite: Kontaktlinks + Einstieg.

Login: Unterscheidung zwischen Admin und Recruiter.

Admin Bereich: Eigenes Dashboard mit Widgets.

Recruiter Bereich: Unterlagen, Skills und Profilinfos.

Wishlist: Test- und Spielbereich für Features.

Portfolio: Öffentliche Projekteübersicht.

Wiki: Persönliche Knowledge Base.

------------------------------------------------------------------------

## Wichtige Regeln im Projekt

Design kommt immer aus:

/assets/css/main.css

Neue Seiten dürfen kein eigenes Design mitbringen. Alles soll sich
gleich anfühlen.

Javascript liegt zentral unter:

/assets/js/

------------------------------------------------------------------------

## Ordneridee

portfolio/ dashboard/ wiki/ recruiter/ app/

Jedes Modul ist unabhängig und kann erweitert werden, ohne andere
Bereiche zu zerstören.

------------------------------------------------------------------------

## Wie neue Features gebaut werden

1.  Neue HTML Seite im passenden Ordner erstellen
2.  main.css einbinden
3.  JS Datei unter assets/js anlegen
4.  Script am Ende der Seite laden

------------------------------------------------------------------------

## Ziel der Plattform

Eine Mischung aus:

-   Portfolio
-   Bewerbungsportal
-   Lernplattform
-   Experimentierfläche
