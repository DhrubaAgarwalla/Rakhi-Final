-- This migration creates the app_settings table

CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- Insert initial delivery charge settings
INSERT INTO app_settings (key, value) VALUES
    ('delivery_charge_settings', '{"flatDeliveryCharge": 50, "freeDeliveryThreshold": 500}');