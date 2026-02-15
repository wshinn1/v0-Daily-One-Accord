-- Add SEO and social sharing fields to blog_posts table

-- Add Open Graph and Twitter Card fields
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS twitter_card_type TEXT DEFAULT 'summary_large_image' CHECK (twitter_card_type IN ('summary', 'summary_large_image', 'app', 'player'));

-- Add comment for documentation
COMMENT ON COLUMN blog_posts.og_title IS 'Open Graph title for social sharing (defaults to post title if not set)';
COMMENT ON COLUMN blog_posts.og_description IS 'Open Graph description for social sharing (defaults to excerpt if not set)';
COMMENT ON COLUMN blog_posts.og_image IS 'Open Graph image URL for social sharing (defaults to featured_image_url if not set)';
COMMENT ON COLUMN blog_posts.twitter_card_type IS 'Twitter Card type: summary, summary_large_image, app, or player';
