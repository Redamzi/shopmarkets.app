# Rolle

Du agierst als Senior SaaS Product Architect + Full-Stack Reviewer + AI Product Engineer.
Deine Aufgabe ist es, das bestehende System zu prüfen, vervollständigen, optimieren und produktionsreif zu machen.

🎯 Ziel

Ein vollständig integrierter Product Wizard (Step 1–10) mit:

*   AI-gestützter Produkterstellung
*   Credit-basiertem Abrechnungssystem
*   Multichannel-Insertion (User-Channels + Shop-Markets Network)
*   Preis-Radar & Gebühren-Auto-Calc
*   Klarem UX-Flow
*   Keine unnötigen Steps je Produkttyp
*   Credits werden erst nach finaler Berechnung abgezogen

🔍 Verbindliche Prüf- & Implementierungsanweisung (WICHTIG)

Bevor du irgendetwas neu erstellst oder änderst:

1.  **Analysiere den IST-Zustand des Systems:**
    *   vorhandene Backend-Endpunkte
    *   vorhandene Wizard-Steps
    *   bestehende Credit-Logik
    *   vorhandene Channel-Integrationen
    *   vorhandene AI-Funktionen

2.  **Markiere klar:**
    *   ✔️ bereits vorhanden
    *   ⚠️ unvollständig
    *   ❌ fehlt vollständig

3.  **Implementiere oder erweitere NUR, was:**
    *   fehlt
    *   unvollständig ist
    *   nicht produktionsreif ist

4.  **Verändere KEINE funktionierende Logik, außer:**
    *   sie widerspricht diesem Prompt
    *   sie verhindert Skalierung oder Monetarisierung    

**Zielzustand:**
*   Production-Ready
*   Skalierbar
*   Credit-sicher
*   UX-klar
*   API-sauber

🧩 SYSTEM-KONTEXT

*   Backend + Datenbanken + Auth liegen vollständig auf 👉 start.shopmarkets.app
*   Frontend-Marketplace: 👉 shop-markets.com
*   Jeder SaaS-User:
    *   Hat einen eigenen Shop (Vorschau + optional Kauf)
    *   Kann eigene Kanäle verbinden
    *   Oder Shop-Markets.com als Master-Distributor nutzen
*   Inserieren ist kostenlos
*   Monetarisierung erfolgt nur bei Verkauf & Services

🧱 PRODUCT WIZARD – STEP LOGIK (DYNAMISCH)

**Step 1 – Product Type Selector**
*   Wähle Produkttyp:
    *   Simple
    *   Configurable
    *   Grouped
    *   Bundle
    *   Virtual
    *   Downloadable
    *   Subscription
    *   Personalized
    *   Bookable
👉 Nur relevante Steps laden

**Step Logic Matrix (Dynamisches Laden je Typ)**
| Produkttyp | Relevante Steps | Besonderheiten |
|---|---|---|
| **Simple** | Type, AI, Basis, Attribute, Media, Price, Channels, Shipping, Org, Sync | Standard-Ablauf |
| **Configurable** | Type, AI, Basis, Attribute, **Variants**, Media, Price, Channels, Shipping, Org, Sync | Varianten-Editor aktiv |
| **Personalized** | Type, AI, Basis, Attribute, **Configurator**, Media, Price, Channels, Shipping, Org, Sync | Gravur/Text-Optionen |
| **Virtual** | Type, AI, Basis, Media, Price, Channels, Org, Sync | ❌ Kein Versand |
| **Downloadable** | Type, AI, Basis, Media, Price, Channels, Org, Sync | ❌ Kein Versand, ➕ Datei-Upload |
| **Bundle** | Type, AI, Basis, Media, Price, Channels, Shipping, Org, Sync | Auswahl verknüpfter Produkte |
| **Subscription** | Type, AI, Basis, Media, Price, Channels, Org, Sync | ➕ Intervall-Einstellungen |
| **Bookable** | Type, AI, Basis, Media, Price, Channels, Org, Sync | ➕ Kalender/Slot-Logik |

**Legende der Steps:**
*   **Type:** Produkttyp wählen
*   **AI:** Magic Creator
*   **Basis:** Titel, Beschreibung
*   **Attribute:** Material, Farbe (Single)
*   **Variants:** Größen, Farben (Complex)
*   **Configurator:** Personalisierung (Gravur)
*   **Media:** Bilder, Video, TikTok
*   **Price:** Preise, Radar, Credits
*   **Channels:** Marktplätze wählen
*   **Shipping:** Versand & Lager
*   **Org:** Tags, EAN, Vendor
*   **Sync:** Prüfung & Speichern

**Step 2 – Magic Product Creator (AI)**
*   Funktion
    *   Foto hochladen
*   KI erkennt:
    *   Produkttyp
    *   Titel
    *   Beschreibung
    *   Attribute
    *   Varianten (wenn möglich)
    *   Stil
    *   SEO-optimiert
    *   Locker
    *   Freundlich
    *   Witzig
*   Kosten
    *   1 Credit
    *   ❗ Credit erst abziehen nach finaler Produkt-Berechnung & Speichern

**Step 3 – Basisdaten**
*   Produktname
*   Kurzbeschreibung
*   Langbeschreibung
*   Kategorie
*   Marke
*   Tags

**Step 4 – Aufgeteilt in EINZELNE Sub-Steps**
*   4.1 Attribute
    *   Material
    *   Farbe
    *   Größe
    *   Gewicht
    *   Herkunft
    *   Pflegehinweise
*   4.2 Varianten
    *   Größen
    *   Farben
    *   Sets
    *   Preisaufschläge
*   4.3 Personalisierung (WICHTIG)
    *   Für z.B. Ring mit Gravur (Silber):
        *   Textfeld für Gravur
        *   Max. Zeichenlänge
        *   Mehrzeilig / einzeilig
        *   Preis pro Zeichen oder Fixpreis
        *   Vorschau-Text
        *   Pflichtfeld optional

**Step 5 – Medien**
*   Bilder
*   Videos
*   AI-generierte Bilder (optional)
*   TikTok / Reels Video Upload
*   Caption
*   Hashtags
*   Sound
*   Duet / Stitch Toggle

**Step 6 – Preise & Credits**
*   Manuell
    *   Basispreis
    *   Rabatt
    *   Steuerklasse
*   Gebühren-Auto-Calc
    *   Automatische Aufschläge je Kanal:
        *   Amazon z.B. +15%
        *   eBay z.B. +10%
    *   Ziel: Gleicher Nettogewinn überall
*   Kosten
    *   0.10 Credit je Kanal

**Step 7 – Kanäle (SEHR WICHTIG)**
*   Lade NUR verbundene Kanäle von: 👉 https://start.shopmarkets.app/connections
*   Wenn KEIN Kanal vorhanden
    *   Produkt bleibt im SaaS Dashboard
*   Trotzdem:
    *   Einzelne spätere Kanal-Übertragung möglich
*   Inserierung
    *   Automatisch
    *   Kostenlos
*   Shop-Markets.com kann als Master-Channel genutzt werden

**Step 8 – Versand & Lager**
*   Gewicht
*   Maße
*   Versandprofile
*   Lagerbestand
*   Dropshipping / Own Stock

**Step 9 – Extras & Organisation**
*   Interne Notizen
*   Lieferant
*   SKU-Mapping
*   Steuerlogik
*   SEO-Meta

**Step 10 – Prüfung & Sync**
*   Readiness Score (z.B. 95%)
*   Kanal-Check
*   SEO-Check
*   Medien-Check
*   Button: 👉 Speichern & Sync
*   ❗ Credits JETZT erst abziehen

📊 PREIS-RADAR (OPTIONAL, ABO)

*   Funktion
    *   Findet günstigstes Konkurrenzangebot im Web
    *   Dynamische Preisanpassung möglich
*   Einstellungen
    *   Check-Intervall: 1 Stunde
    *   Auto-Adjust: Ein / Aus
*   Kosten
    *   5 Credits / Monat

💳 CREDIT-MODELL (TRANSPARENT)
Aktion | Kosten
--- | ---
Manuelles Produkt | 0 Credits
AI Product Generator | 1 Credit
Kanal-Übertragung (API) | API-Kosten + 30%
Kanal ohne API | 0.30 Credit
Gebühren-Auto-Calc | 0.10 Credit / Kanal
Preis-Radar | 5 Credits / Monat

❗ Credits IMMER erst nach finaler Berechnung & Save abziehen

🛒 MARKETPLACE-LOGIK

*   Produkte erscheinen auf:
    *   Shop-Markets.com
    *   Start.ShopMarkets.app
*   Kunde sieht:
    *   Welcher Shop verkauft
    *   Weitere Produkte des Shopbetreibers
*   Verkauf:
    *   Provision für Shop-Markets
    *   Rest an SaaS-User
