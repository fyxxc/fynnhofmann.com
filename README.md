# fynnhofmann.com

Was die Seite kann

Design: Dunkel, entspannt, mit dieser animierten Kugel in der Mitte.

Overlays: Wenn man auf Icons klickt, geht kein neuer Tab auf, sondern ein Overlay legt sich drüber. Fühlt sich einfach flüssiger an.

Responsive: Läuft auf dem Handy genauso gut wie auf dem Desktop.

Anti-Copy: Ich hab ein paar Hürden eingebaut (Rechtsklick-Sperre etc.), damit man den Code nicht sofort klauen kann.

Impressum: Ist auch schon drin und verlinkt.

Die Technik dahinter

Ich habe bewusst auf komplexe Frameworks oder Build-Tools verzichtet. Das Ding soll einfach laufen.

HTML5 & Vanilla JS: Kein React, kein Vue, einfach Standard-Webtechnologie.

Tailwind CSS: Nutze ich via CDN für das Styling.

Icons: Kommen von Lucide (ebenfalls via CDN).

Wie du das Ding startest

Du brauchst kein npm install oder irgendwelche Server.

Lad dir die Dateien runter.

Pack deine Bilder in denselben Ordner (siehe unten).

Doppelklick auf die index.html – fertig.

Bilder, die du brauchst

Damit die Seite nicht kaputt aussieht, müssen diese Bilder im Ordner liegen (oder du änderst die Namen im Code):

fynn.jpeg (Dein Profilbild)

bls_welle7.jpeg (Hintergrund im LinkedIn-Bereich)

bbc.png (Zertifikat 1)

memory.png (Zertifikat 2)

ambassador.png (Zertifikat 3)

Info zum "Kopierschutz"

Seien wir ehrlich: Da wir im Web sind und der Browser den Code lesen muss, gibt es keinen 100%igen Schutz. Jeder, der sich mit DevTools auskennt (so wie wir), kommt da ran.

Aber: Ich habe Rechtsklick, Textauswahl und die gängigen Shortcuts (F12, Ctrl+U etc.) blockiert. Das hält zumindest die meisten "Gelegenheits-Diebe" ab.

Anpassungen

Willst du die Links ändern?

Suche im Code einfach nach mailto:, threema.id oder linkedin.com und trag deine Sachen ein.

Impressum: Das findest du ganz unten im Code im div mit der ID impressum-overlay. Einfach den Text austauschen.

Stand: 2024 | Fynn Hofmann
