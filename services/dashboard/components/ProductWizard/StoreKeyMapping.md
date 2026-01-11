# Product Wizard Store Key Mapping (Audit)

To ensure data persistence across steps, we use **HARDCODED KEYS** in the `productWizardStore`.
This guarantees that even if the UI Step Index changes (e.g. adding a new step), the data remains accessible.

## Key Map

| Key | Component | Content |
|---|---|---|
| **2** | `GeneralInfo.tsx` | title, description, shortDescription |
| **3** | `MediaUpload.tsx` | images (Array), video (String) |
| **4** | `AttributesVariants.tsx` | attributes (Obj), variants (Array) |
| **5** | `PriceRadar.tsx` | priceRadar Config |
| **6** | `PricingInventory.tsx` | price, compare_price |
| **7** | `PricingInventory.tsx` | sku, barcode, quantity, trackQuantity, lowStockThreshold |
| **8** | `Shipping.tsx` | weight, dimensions, shippingClass |
| **9** | `SEOMarketing.tsx` | seo, tiktok |
| **10** | `Organization.tsx` | category, vendor, tags |
| **11** | `Configurator.tsx` | personalizationConfig (extras) |
| **12** | `ChannelsSync.tsx` | channels |

## Validation Logic
- **ProductWizard.tsx (handleSaveProduct):** Must read specifically from these keys.
- **Components:** Must strictly write to these keys.

## Status Check
- [x] GeneralInfo writes to 2.
- [x] MediaUpload writes to 3.
- [x] PricingInventory writes to 6 & 7.
- [x] AttributesVariants writes to 4.
- [x] Configurator writes to 11.
- [x] SEOMarketing writes to 9.
- [x] Organization writes to 10.
- [x] Shipping writes to 8.

All components appear to be using the correct Hardcoded Keys.
The `ProductWizard.tsx` payload construction must match this map.
