# Database Schema: Products Table (Production Ready)

This documentation reflects the **verified** schema state after full migration.
All columns required for the Product Wizard are now **Implemented**.

## Completed Schema

| Column               | Type         | Default   | Description |
|----------------------|--------------|-----------|-------------|
| `id`                 | UUID         | uuid()    | Primary Key |
| `user_id`            | TEXT         | -         | Owner ID |
| `title`              | TEXT         | -         | Product Name |
| `description`        | TEXT         | -         | Main Description |
| `price`              | DECIMAL      | 0         | Base Price |
| `stock`              | INTEGER      | 0         | Inventory Count |
| `sku`                | TEXT         | -         | Stock Keeping Unit |
| `image_url`          | TEXT         | -         | *Legacy* (Use `images`) |
| `category`           | TEXT         | -         | Main Category |
| `product_type`       | VARCHAR(50)  | 'simple'  | Configurable, Digital, etc. |
| `attributes`         | JSONB        | '{}'      | Custom attributes (Color, Size) |
| `seo`                | JSONB        | '{}'      | Meta Title, Desc, Slug |
| `tiktok`             | JSONB        | '{}'      | Caption, Hashtags, Sound, Stitch |
| `channels`           | JSONB        | '[]'      | Active Sales Channels |
| `tags`               | TEXT         | NULL      | Comma-separated tags |
| `images`             | JSONB        | '[]'      | **New:** Array of Image URLs |
| `video`              | TEXT         | NULL      | **New:** TikTok/Reel Video URL |
| `variants`           | JSONB        | '[]'      | **New:** Complex Variants |
| `price_radar`        | JSONB        | '{}'      | **New:** Auto-Price Logic |
| `shipping`           | JSONB        | '{}'      | **New:** Weight, Dimensions |
| `extras`             | JSONB        | '{}'      | **New:** Personalization (Gravur) |
| `is_ai_generated`    | BOOLEAN      | FALSE     | **New:** Credit Calculation Flag |
| `vendor`             | VARCHAR(255) | NULL      | **New:** Manufacturer |
| `track_quantity`     | BOOLEAN      | FALSE     | **New:** Inventory Tracking |
| `low_stock_threshold`| INTEGER      | 0         | **New:** Low Stock Alert |
| `barcode`            | VARCHAR(255) | NULL      | **New:** EAN/UPC |

## Status
✅ **SYNCED**: The codebase (controllers, validation) and the database schema are now fully aligned.
