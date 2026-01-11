# IST-Zustand Analyse (Product Wizard System)

## 1. Product Type Selector (Step 1)
*   **Status:** ✔️ **Ready**
*   **Coverage:** 
    *   Simple, Configurable, Grouped, Virtual, Bundle, Downloadable, Subscription, Personalized, Bookable.
    *   UI implementation complete.

## 2. Magic Product Creator / AI (Step 2)
*   **Status:** ⚠️ **Unvollständig**
*   **Details:**
    *   AI Image Analysis works (Mock or Backend endpoint).
    *   ❌ **Credit Logic Missing:** No frontend logic to track or display "1 Credit" cost. Backend confirmation needed on save.

## 3. Basisdaten (Step 3)
*   **Status:** ✔️ **Ready**
*   **Coverage:** Title, Description, Short Description, Category, Vendor, Tags.

## 4. Details (Step 4)
*   **Status:** ⚠️ **Unvollständig**
*   **Attributes/Variants:** ✔️ Implemented.
*   **Personalization:** ⚠️ Major gaps.
    *   Existing: Simple "Enable" toggle and "Label" input.
    *   ❌ **Missing:** Gravur Logic (Max Chars, Multiline, Price per Char vs Fix Price).

## 5. Media (Step 5)
*   **Status:** ⚠️ **Unvollständig**
*   **Images:** ✔️ Upload & Media Library Integration complete.
*   **TikTok/Video:** ⚠️ Partial.
    *   TikTok fields (Caption/Hashtags) exist in `SEOMarketing` but not dedicated Video Upload in `MediaUpload`. 
    *   Prompt asks for specific "TikTok / Reels Video Upload", "Sound", "Duet/Stitch Toggle". These are **missing**.

## 6. Preise & Credits (Step 6)
*   **Status:** ⚠️ **Unvollständig**
*   **Price Logic:** ✔️ Base implemented.
*   **Auto-Calc:** ✔️ Price Radar handles fees.
*   **Credit Logic:** ❌ No visual tracking of "0.10 Credit / Channel" costs.

## 7. Kanäle (Step 7)
*   **Status:** ✔️ **Ready**
*   **Details:** Lists active channels. Logic depends on backend connections.

## 8. Versand & Lager (Step 8)
*   **Status:** ✔️ **Ready**
*   **Details:** Weight, Dimensions, Stock implemented in `Shipping.tsx` and `Inventory.tsx`.

## 9. Extras & Organisation (Step 9)
*   **Status:** ✔️ **Ready**
*   **Details:** Covered by SEO/Marketing and other steps.

## 10. Prüfung & Sync (Step 10)
*   **Status:** ⚠️ **Unvollständig**
*   **Summary:** ✔️ Shows basic info.
*   **Readiness Score:** ❌ Missing.
*   **Credit Final Check:** ❌ No "Total Credits" summary before save.

---
**Priorisierte Aufgaben:**
1.  **Personalization:** Erweitere `Configurator.tsx` um Gravur-Optionen.
2.  **Credit System:**
    *   Implementiere `CreditCalculation`-Logik im Frontend.
    *   Zeige Kosten in `PreviewSave.tsx`.
3.  **Media:** Füge Video/TikTok-spezifische Felder hinzu (wenn kritisch -> Prio 2, sonst Prio 3).
