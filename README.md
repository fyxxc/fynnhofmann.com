WAS DIE SEITE KANN

Design: Dunkel, entspannt, mit einer animierten Kugel in der Mitte.

Overlays: Wenn man auf Icons klickt, geht kein neuer Tab auf, sondern ein Overlay legt sich drüber. Das sorgt für ein flüssigeres Gefühl.

Responsive: Die Seite läuft auf dem Handy genauso gut wie auf dem Desktop.

Anti-Copy: Es sind ein paar Hürden eingebaut (Rechtsklick-Sperre etc.), damit der Code nicht sofort kopiert werden kann.

Impressum: Ist bereits integriert und verlinkt.


DIE TECHNIK DAHINTER

Ich habe bewusst auf komplexe Frameworks oder Build-Tools verzichtet. Das Projekt soll einfach laufen ("Keep it simple").

HTML5 & Vanilla JS: Kein React, kein Vue – reine Standard-Webtechnologie.

Tailwind CSS: Wird für das Styling genutzt (via CDN eingebunden).

Icons: Stammen von Lucide (ebenfalls via CDN).


WIE DU DAS DING STARTEST

Du brauchst kein npm install und keinen lokalen Server.

Lade dir die Dateien herunter.

Packe deine Bilder in denselben Ordner (siehe Liste unten).

Mache einen Doppelklick auf die index.html – fertig.


BILDER, DIE DU BRAUCHST

Damit die Seite korrekt angezeigt wird, müssen folgende Bilder im Ordner liegen (oder du passt die Namen im Code an):

fynn.jpeg (Dein Profilbild)

bls_welle7.jpeg (Hintergrund im LinkedIn-Bereich)

bbc.png (Zertifikat 1)

memory.png (Zertifikat 2)

ambassador.png (Zertifikat 3)


INFO ZUM "KOPIERSCHUTZ"

Seien wir ehrlich: Da wir im Web sind und der Browser den Code interpretieren muss, gibt es keinen 100%igen Schutz. Jeder, der sich mit DevTools auskennt (so wie wir), kommt an den Source-Code.

Aber: Ich habe Rechtsklick, Textauswahl und gängige Shortcuts (F12, Ctrl+U etc.) blockiert. Das hält zumindest die meisten "Gelegenheits-Diebe" ab.


ANPASSUNGEN

Links ändern: Suche im Code einfach nach mailto:, threema.id oder linkedin.com und trage deine eigenen Daten ein.

Impressum: Den Text findest du ganz unten im Code im div mit der ID impressum-overlay. Einfach den Inhalt austauschen.

Stand: 2025 | Fynn Hofmann
