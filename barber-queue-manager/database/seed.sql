-- QueueCut Database Seed Data
-- Populate the database with initial services and sample data

-- Insert default services
INSERT INTO services (id, name, description, duration, base_price, category) VALUES
('11111111-1111-1111-1111-111111111111', 'Classic Haircut', 'Traditional men''s haircut with scissors and clippers', 30, 25.00, 'haircut'),
('22222222-2222-2222-2222-222222222222', 'Beard Trim & Style', 'Professional beard trimming and styling', 20, 15.00, 'beard'),
('33333333-3333-3333-3333-333333333333', 'Hot Towel Shave', 'Traditional hot towel shave with straight razor', 45, 35.00, 'beard'),
('44444444-4444-4444-4444-444444444444', 'Hair Wash & Style', 'Shampoo, conditioning, and styling', 25, 20.00, 'styling'),
('55555555-5555-5555-5555-555555555555', 'Buzz Cut', 'Quick and clean buzz cut', 15, 15.00, 'haircut'),
('66666666-6666-6666-6666-666666666666', 'Fade Cut', 'Modern fade haircut with precision blending', 40, 30.00, 'haircut'),
('77777777-7777-7777-7777-777777777777', 'Hair Coloring', 'Professional hair coloring service', 90, 60.00, 'coloring'),
('88888888-8888-8888-8888-888888888888', 'Deep Scalp Treatment', 'Therapeutic scalp treatment and massage', 30, 25.00, 'treatment');

-- Insert sample users (passwords: "password123" hashed with bcrypt)
INSERT INTO users (id, email, password_hash, name, phone, role) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'demo@customer.com', '$2b$12$LVgA9.YGjP8.vkG4r6DfGu8VvCUZiJ0p9kJ4x5j5XqVzF5G8LX7z.', 'John Demo Customer', '+1-555-0101', 'customer'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sarah.johnson@email.com', '$2b$12$LVgA9.YGjP8.vkG4r6DfGu8VvCUZiJ0p9kJ4x5j5XqVzF5G8LX7z.', 'Sarah Johnson', '+1-555-0102', 'customer'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'demo@barber.com', '$2b$12$LVgA9.YGjP8.vkG4r6DfGu8VvCUZiJ0p9kJ4x5j5XqVzF5G8LX7z.', 'Alex Martinez', '+1-555-0201', 'barber'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'maria.garcia@email.com', '$2b$12$LVgA9.YGjP8.vkG4r6DfGu8VvCUZiJ0p9kJ4x5j5XqVzF5G8LX7z.', 'Maria Garcia', '+1-555-0202', 'barber'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'mike.wilson@email.com', '$2b$12$LVgA9.YGjP8.vkG4r6DfGu8VvCUZiJ0p9kJ4x5j5XqVzF5G8LX7z.', 'Mike Wilson', '+1-555-0103', 'customer');

-- Insert customer profiles
INSERT INTO customer_profiles (id, user_id, location_latitude, location_longitude, location_address, notification_sms, notification_email, notification_push) VALUES
('c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 37.7749, -122.4194, '123 Main St, San Francisco, CA 94102', true, true, true),
('c2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 37.7849, -122.4094, '456 Oak Ave, San Francisco, CA 94103', true, true, false),
('c3333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 37.7649, -122.4294, '789 Pine St, San Francisco, CA 94104', false, true, true);

-- Insert barber shops
INSERT INTO barber_shops (id, name, description, owner_id, address_street, address_city, address_state, address_zip_code, latitude, longitude, phone, email, max_advance_booking_days, slot_duration, buffer_time, accepts_walk_ins) VALUES
('s1111111-1111-1111-1111-111111111111', 'Golden Gate Barbers', 'Premier barbershop in the heart of San Francisco offering classic and modern cuts', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '1234 Market Street', 'San Francisco', 'CA', '94102', 37.7849, -122.4094, '+1-415-555-0100', 'info@goldengatecutters.com', 14, 30, 10, true),
('s2222222-2222-2222-2222-222222222222', 'Mission District Cuts', 'Trendy barbershop specializing in modern styles and beard grooming', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '567 Mission Street', 'San Francisco', 'CA', '94103', 37.7899, -122.3968, '+1-415-555-0200', 'hello@missioncuts.com', 21, 45, 15, true),
('s3333333-3333-3333-3333-333333333333', 'Castro Classic Barbers', 'Traditional barbershop with hot towel shaves and premium grooming services', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '890 Castro Street', 'San Francisco', 'CA', '94114', 37.7609, -122.4350, '+1-415-555-0300', 'appointments@castrobarbers.com', 30, 30, 5, false);

-- Insert barber profiles
INSERT INTO barber_profiles (id, user_id, shop_id, specialties, experience_years, bio, license_number) VALUES
('b1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 's1111111-1111-1111-1111-111111111111', ARRAY['Classic cuts', 'Fade techniques', 'Beard styling'], 8, 'Passionate about classic barbering with modern techniques', 'CA-BARBER-2016-001'),
('b2222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 's2222222-2222-2222-2222-222222222222', ARRAY['Modern styles', 'Hair coloring', 'Artistic cuts'], 5, 'Creative stylist specializing in contemporary looks', 'CA-BARBER-2019-002');

-- Insert shop operating hours (Mon-Sat, 9 AM - 7 PM)
INSERT INTO shop_operating_hours (shop_id, day_of_week, open_time, close_time, is_closed) VALUES
-- Golden Gate Barbers
('s1111111-1111-1111-1111-111111111111', 1, '09:00', '19:00', false), -- Monday
('s1111111-1111-1111-1111-111111111111', 2, '09:00', '19:00', false), -- Tuesday
('s1111111-1111-1111-1111-111111111111', 3, '09:00', '19:00', false), -- Wednesday
('s1111111-1111-1111-1111-111111111111', 4, '09:00', '19:00', false), -- Thursday
('s1111111-1111-1111-1111-111111111111', 5, '09:00', '20:00', false), -- Friday
('s1111111-1111-1111-1111-111111111111', 6, '08:00', '18:00', false), -- Saturday
('s1111111-1111-1111-1111-111111111111', 0, null, null, true), -- Sunday - Closed

-- Mission District Cuts
('s2222222-2222-2222-2222-222222222222', 1, '10:00', '20:00', false), -- Monday
('s2222222-2222-2222-2222-222222222222', 2, '10:00', '20:00', false), -- Tuesday
('s2222222-2222-2222-2222-222222222222', 3, '10:00', '20:00', false), -- Wednesday
('s2222222-2222-2222-2222-222222222222', 4, '10:00', '20:00', false), -- Thursday
('s2222222-2222-2222-2222-222222222222', 5, '10:00', '21:00', false), -- Friday
('s2222222-2222-2222-2222-222222222222', 6, '09:00', '19:00', false), -- Saturday
('s2222222-2222-2222-2222-222222222222', 0, '11:00', '17:00', false), -- Sunday

-- Castro Classic Barbers
('s3333333-3333-3333-3333-333333333333', 1, '08:00', '18:00', false), -- Monday
('s3333333-3333-3333-3333-333333333333', 2, '08:00', '18:00', false), -- Tuesday
('s3333333-3333-3333-3333-333333333333', 3, '08:00', '18:00', false), -- Wednesday
('s3333333-3333-3333-3333-333333333333', 4, '08:00', '18:00', false), -- Thursday
('s3333333-3333-3333-3333-333333333333', 5, '08:00', '19:00', false), -- Friday
('s3333333-3333-3333-3333-333333333333', 6, '07:00', '17:00', false), -- Saturday
('s3333333-3333-3333-3333-333333333333', 0, null, null, true); -- Sunday - Closed

-- Link barbers to shops
INSERT INTO shop_barbers (shop_id, barber_id, hire_date) VALUES
('s1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', '2022-01-15'),
('s2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', '2023-03-01');

-- Link services to shops with pricing
INSERT INTO shop_services (shop_id, service_id, custom_price, is_available) VALUES
-- Golden Gate Barbers services
('s1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 28.00, true), -- Classic Haircut
('s1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 18.00, true), -- Beard Trim
('s1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 40.00, true), -- Hot Towel Shave
('s1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 22.00, true), -- Hair Wash & Style
('s1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 32.00, true), -- Fade Cut

-- Mission District Cuts services
('s2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 30.00, true), -- Classic Haircut
('s2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 20.00, true), -- Beard Trim
('s2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 35.00, true), -- Fade Cut
('s2222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 75.00, true), -- Hair Coloring
('s2222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 30.00, true), -- Deep Scalp Treatment

-- Castro Classic Barbers services
('s3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 35.00, true), -- Classic Haircut
('s3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 25.00, true), -- Beard Trim
('s3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 50.00, true), -- Hot Towel Shave
('s3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 28.00, true), -- Hair Wash & Style
('s3333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 20.00, true); -- Buzz Cut

-- Insert sample appointments (mix of past and future)
INSERT INTO appointments (id, customer_id, barber_id, shop_id, total_duration, total_price, scheduled_at, estimated_start_time, estimated_end_time, status, queue_position, notes) VALUES
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'b1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 30, 28.00, '2025-08-17 10:00:00', '2025-08-17 10:00:00', '2025-08-17 10:30:00', 'confirmed', 1, 'First time customer'),
('a2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b2222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222', 45, 35.00, '2025-08-17 14:00:00', '2025-08-17 14:00:00', '2025-08-17 14:45:00', 'confirmed', 1, 'Regular customer, prefers modern style');

-- Insert appointment services
INSERT INTO appointment_services (appointment_id, service_id, barber_id, price, duration) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 28.00, 30),
('a2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'b2222222-2222-2222-2222-222222222222', 35.00, 45);

-- Insert sample reviews
INSERT INTO reviews (id, customer_id, shop_id, barber_id, appointment_id, overall_rating, service_quality, cleanliness, wait_time_accuracy, value_for_money, staff_friendliness, title, comment) VALUES
('r1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 's1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', null, 5, 5, 5, 4, 5, 5, 'Excellent service!', 'Alex gave me exactly the cut I wanted. Very professional and the shop is spotless.'),
('r2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', null, 4, 4, 5, 3, 4, 5, 'Great modern cuts', 'Maria is very skilled with modern styles. Wait was a bit longer than expected but worth it.');

-- Insert shop images
INSERT INTO shop_images (shop_id, image_url, image_type, alt_text, display_order) VALUES
('s1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800', 'profile', 'Golden Gate Barbers shop front', 1),
('s1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800', 'gallery', 'Interior view of Golden Gate Barbers', 2),
('s2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800', 'profile', 'Mission District Cuts storefront', 1),
('s2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800', 'gallery', 'Modern interior of Mission District Cuts', 2),
('s3333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1581618243671-5c19e8a40aff?w=800', 'profile', 'Castro Classic Barbers exterior', 1);