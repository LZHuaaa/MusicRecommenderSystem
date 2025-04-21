-- Add features column to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS features JSONB;

-- Create index on features for faster similarity search
CREATE INDEX IF NOT EXISTS idx_songs_features ON songs USING GIN (features); 