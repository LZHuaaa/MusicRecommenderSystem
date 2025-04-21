-- Add skip_time_seconds column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_song_interactions' 
        AND column_name = 'skip_time_seconds'
    ) THEN
        ALTER TABLE user_song_interactions 
        ADD COLUMN skip_time_seconds INTEGER DEFAULT NULL;
    END IF;
END $$;

-- Create index for skip analysis
CREATE INDEX IF NOT EXISTS idx_user_song_skip_time 
ON user_song_interactions(user_id, song_id, skip_time_seconds);

-- Add comment to explain the column
COMMENT ON COLUMN user_song_interactions.skip_time_seconds 
IS 'Number of seconds the song was played before being skipped'; 