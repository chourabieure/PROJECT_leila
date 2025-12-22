-- Add image positioning columns to cards table
-- These columns allow fine-tuning the image display on cards

-- Add offset X (percentage, -50 to 50)
ALTER TABLE cards ADD COLUMN IF NOT EXISTS image_offset_x REAL DEFAULT 0;

-- Add offset Y (percentage, -50 to 50)
ALTER TABLE cards ADD COLUMN IF NOT EXISTS image_offset_y REAL DEFAULT 0;

-- Add scale factor (0.5 to 2.0, default 1.0 = 100%)
ALTER TABLE cards ADD COLUMN IF NOT EXISTS image_scale REAL DEFAULT 1;

-- Add comments for documentation
COMMENT ON COLUMN cards.image_offset_x IS 'Horizontal image offset as percentage (-50 to 50)';
COMMENT ON COLUMN cards.image_offset_y IS 'Vertical image offset as percentage (-50 to 50)';
COMMENT ON COLUMN cards.image_scale IS 'Image scale factor (0.5 to 2.0, 1.0 = 100%)';

