-- Creating the database
CREATE DATABASE dinner_o_clock;
USE dinner_o_clock;

-- Table for users (customers)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Plain text as requested (not secure for production)
    address TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for admins
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Plain text as requested (not secure for production)
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for menu items
CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    cuisine_type VARCHAR(100), -- e.g., Italian, Indian, Fusion
    dietary_info VARCHAR(100), -- e.g., Vegetarian, Vegan, Gluten-Free
    image_url VARCHAR(255), -- Path to image in uploads/ folder
    is_active BOOLEAN DEFAULT TRUE, -- Whether the item is available
    is_featured BOOLEAN DEFAULT FALSE, -- For featured dishes in homepage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for orders
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date DATE NOT NULL,
    delivery_type ENUM('delivery', 'takeaway') NOT NULL,
    status ENUM('pending', 'confirmed', 'delivered', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10, 2) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for order items
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Table for catering requests
CREATE TABLE catering_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_date DATE NOT NULL,
    event_type VARCHAR(100),
    guest_count INT NOT NULL,
    preferences TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for subscriptions
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_type ENUM('full_week', 'custom_days') NOT NULL,
    days VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for testimonials
CREATE TABLE testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for promotions
CREATE TABLE promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for menu_items (including featured flag)
INSERT INTO menu_items (name, description, price, cuisine_type, dietary_info, image_url, is_active, is_featured)
VALUES
    ('Spicy Thai Curry', 'Aromatic curry with coconut milk and fresh herbs', 12.99, 'Thai', 'Gluten-Free', '/uploads/curry.jpg', TRUE, TRUE),
    ('Italian Margherita Pizza', 'Classic pizza with fresh basil and mozzarella', 10.99, 'Italian', 'Vegetarian', '/Uploads/pizza.jpg', TRUE, TRUE),
    ('Indian Butter Chicken', 'Creamy tomato-based chicken curry', 14.99, 'Indian', NULL, '/Uploads/butter_chicken.jpg', TRUE, TRUE);

-- Sample data for testimonials
INSERT INTO testimonials (user_id, content, rating, is_active)
VALUES
    (1, 'Amazing food and super convenient delivery!', 5, TRUE),
    (1, 'The weekly menu keeps things exciting!', 4, TRUE),
    (1, 'Perfect catering for our office event.', 5, TRUE);

-- Sample data for promotions
INSERT INTO promotions (title, description, image_url, is_active)
VALUES
    ('New Subscriber Discount', 'Get 20% off your first week of subscription!', '/uploads/promo1.jpg', TRUE),
    ('Family Meal Deal', 'Order for 4+ people and save 15%!', '/uploads/promo2.jpg', TRUE);