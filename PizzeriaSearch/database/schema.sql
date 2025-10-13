-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create pizzerias table
CREATE TABLE IF NOT EXISTS pizzerias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(2),
    zipcode VARCHAR(10) NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    phone VARCHAR(20),
    website VARCHAR(500),
    is_dedicated_pizzeria BOOLEAN DEFAULT false,
    has_delivery BOOLEAN DEFAULT false,
    has_pizza_menu BOOLEAN DEFAULT true,
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    price_level INTEGER CHECK (price_level >= 1 AND price_level <= 4),
    source VARCHAR(50) NOT NULL, -- 'google', 'yelp', 'foursquare', 'manual'
    external_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW(),

    -- Ensure unique external IDs per source
    UNIQUE(source, external_id)
);

-- Create indexes for fast queries
CREATE INDEX idx_pizzerias_zipcode ON pizzerias(zipcode);
CREATE INDEX idx_pizzerias_coordinates ON pizzerias USING GIST(coordinates);
CREATE INDEX idx_pizzerias_source ON pizzerias(source);
CREATE INDEX idx_pizzerias_has_delivery ON pizzerias(has_delivery) WHERE has_delivery = true;
CREATE INDEX idx_pizzerias_rating ON pizzerias(rating DESC NULLS LAST);
CREATE INDEX idx_pizzerias_metadata ON pizzerias USING GIN(metadata);

-- Create search history table for analytics
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zipcode VARCHAR(10) NOT NULL,
    search_coordinates GEOGRAPHY(POINT, 4326),
    radius_miles INTEGER,
    results_count INTEGER,
    search_timestamp TIMESTAMP DEFAULT NOW(),
    response_time_ms INTEGER,
    user_ip VARCHAR(45),
    metadata JSONB
);

CREATE INDEX idx_search_history_zipcode ON search_history(zipcode);
CREATE INDEX idx_search_history_timestamp ON search_history(search_timestamp DESC);

-- Create deduplication mapping table
CREATE TABLE IF NOT EXISTS pizzeria_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_id UUID REFERENCES pizzerias(id) ON DELETE CASCADE,
    duplicate_id UUID REFERENCES pizzerias(id) ON DELETE CASCADE,
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(primary_id, duplicate_id)
);

-- Create cache invalidation table
CREATE TABLE IF NOT EXISTS cache_invalidation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) NOT NULL,
    invalidated_at TIMESTAMP DEFAULT NOW(),
    reason VARCHAR(255)
);

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update last_updated
CREATE TRIGGER update_pizzerias_last_updated
    BEFORE UPDATE ON pizzerias
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

-- View for active, deliverable pizzerias
CREATE OR REPLACE VIEW deliverable_pizzerias AS
SELECT *
FROM pizzerias
WHERE has_delivery = true
AND (is_dedicated_pizzeria = true OR has_pizza_menu = true)
ORDER BY rating DESC NULLS LAST;

-- Function for radius search (returns pizzerias within X miles of coordinates)
CREATE OR REPLACE FUNCTION search_pizzerias_by_radius(
    search_lat DECIMAL,
    search_lng DECIMAL,
    radius_miles INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    address TEXT,
    city VARCHAR,
    state VARCHAR,
    zipcode VARCHAR,
    distance_miles DECIMAL,
    phone VARCHAR,
    website VARCHAR,
    rating DECIMAL,
    review_count INTEGER,
    price_level INTEGER,
    is_dedicated_pizzeria BOOLEAN,
    has_delivery BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.address,
        p.city,
        p.state,
        p.zipcode,
        ROUND(
            ST_Distance(
                p.coordinates::geography,
                ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography
            ) * 0.000621371, -- Convert meters to miles
            2
        ) as distance_miles,
        p.phone,
        p.website,
        p.rating,
        p.review_count,
        p.price_level,
        p.is_dedicated_pizzeria,
        p.has_delivery
    FROM pizzerias p
    WHERE
        p.has_delivery = true
        AND (p.is_dedicated_pizzeria = true OR p.has_pizza_menu = true)
        AND ST_DWithin(
            p.coordinates::geography,
            ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography,
            radius_miles * 1609.34 -- Convert miles to meters
        )
    ORDER BY distance_miles ASC, p.rating DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;
