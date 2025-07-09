-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 09, 2025 at 07:58 PM
-- Server version: 11.5.2-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dinner_o_clock`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `password`, `name`, `created_at`) VALUES
(1, 'admin@example.com', 'admin123', 'Admin User', '2025-07-05 10:47:33');

-- --------------------------------------------------------

--
-- Table structure for table `catering_requests`
--

CREATE TABLE `catering_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `event_date` date NOT NULL,
  `event_type` varchar(100) DEFAULT NULL,
  `guest_count` int(11) NOT NULL,
  `preferences` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `catering_requests`
--

INSERT INTO `catering_requests` (`id`, `user_id`, `event_date`, `event_type`, `guest_count`, `preferences`, `status`, `created_at`) VALUES
(1, 1, '2025-07-05', 'Wedding', 50, 'nothing', 'rejected', '2025-07-05 08:58:03'),
(2, 1, '2025-07-08', 'Wedding', 100, 'no', 'pending', '2025-07-07 18:32:42');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read','responded') DEFAULT 'unread',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `user_id`, `name`, `email`, `subject`, `message`, `status`, `created_at`) VALUES
(1, 1, 'DOTAJ.', 'dotajdot@gmail.com', 'hello dear', 'how are you', 'read', '2025-07-07 22:16:34');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cuisine_type` varchar(100) DEFAULT NULL,
  `dietary_info` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `name`, `description`, `price`, `cuisine_type`, `dietary_info`, `image_url`, `is_active`, `is_featured`, `created_at`) VALUES
(1, 'Spicy Thai Curry', 'Aromatic curry with coconut milk and fresh herbs', 12.99, 'Thai', 'Gluten-Free', '/Uploads/1751923278081-Leonardo_Phoenix_10_A_vibrant_and_refreshing_juice_bar_banner_3.jpg', 1, 0, '2025-07-04 16:00:58'),
(2, 'Italian Margherita Pizza', 'Classic pizza with fresh basil and mozzarella', 10.99, 'Italian', 'Vegetarian', '/Uploads/pizza.jpg', 1, 1, '2025-07-04 16:00:58'),
(3, 'Indian Butter Chicken', 'Creamy tomato-based chicken curry', 14.99, 'Indian', 'null', '/Uploads/1751923448776-Shemins-Butter-Chicken-LR.jpg', 1, 0, '2025-07-04 16:00:58'),
(4, 'Spicy Thai Curry', 'Aromatic curry with coconut milk and fresh herbs', 12.99, 'Thai', 'Gluten-Free', '/uploads/curry.jpg', 1, 1, '2025-07-04 16:35:54'),
(5, 'Italian Margherita Pizza', 'Classic pizza with fresh basil and mozzarella', 10.99, 'Italian', 'Vegetarian', '/Uploads/1751923352619-pizza.jpg', 1, 0, '2025-07-04 16:35:54'),
(10, 'doi chira', 'Famous Student foods', 12.00, 'bangladeshi', 'Doichira', '/Uploads/1751912499174-Untitled project (3).png', 1, 0, '2025-07-05 12:11:32'),
(12, 'Doi Fuchka', 'Famous Food in Bangladesh', 7.00, 'bangladeshi', 'Fuchka', '/Uploads/1751912257975-images (1).jpeg', 1, 0, '2025-07-07 18:17:37'),
(13, 'Special Burger', 'For Students', 7.00, 'American Special', 'Burger', '/Uploads/1751923182291-Food-Combo-Offers.jpg', 1, 1, '2025-07-07 21:19:42');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_date` date NOT NULL,
  `delivery_type` enum('delivery','takeaway') NOT NULL,
  `status` enum('pending','confirmed','delivered','cancelled') DEFAULT 'pending',
  `total_price` decimal(10,2) NOT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_date`, `delivery_type`, `status`, `total_price`, `address`, `created_at`) VALUES
(4, 1, '2025-07-05', 'delivery', 'confirmed', 25.98, 'Savar Cantonment Bazar Rd', '2025-07-04 18:32:47'),
(12, 3, '2025-07-05', 'delivery', 'confirmed', 14.99, 'bangladesh', '2025-07-05 10:36:58'),
(13, 3, '2025-07-05', 'delivery', 'pending', 10.99, 'ashulia', '2025-07-05 11:12:06'),
(14, 3, '2025-07-08', 'delivery', 'confirmed', 10.99, 'jagannathganj ghat', '2025-07-07 18:30:32');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `menu_item_id`, `quantity`, `price`) VALUES
(1, 4, 3, 1, 14.99),
(2, 4, 2, 1, 10.99),
(27, 12, 3, 1, 14.99),
(28, 13, 2, 1, 10.99),
(29, 14, 5, 1, 10.99);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `payment_method` enum('cod','card') NOT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `payment_intent_id` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `payment_status`, `payment_intent_id`, `amount`, `created_at`) VALUES
(1, 4, 'cod', 'pending', NULL, 25.98, '2025-07-04 18:32:47'),
(2, 12, 'cod', 'pending', NULL, 14.99, '2025-07-05 10:36:58'),
(3, 13, 'cod', 'pending', NULL, 10.99, '2025-07-05 11:12:06'),
(4, 14, 'cod', 'pending', NULL, 10.99, '2025-07-07 18:30:32');

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `promotions`
--

INSERT INTO `promotions` (`id`, `title`, `description`, `image_url`, `is_active`, `created_at`) VALUES
(1, 'Combo Offer (Students)', 'Only for Students, Need to verify by your Student ID card...', '/Uploads/1751921740389-Food-Combo-Offers.jpg', 1, '2025-07-07 20:55:40'),
(2, 'STYLAXX - Where Taste Meets Style! 🍔🍹', 'Craving something tasty? STYLAXX brings you delicious burgers, fresh juices & more — made with love, delivered with care!\r\nFast delivery | Fresh ingredients | Irresistible flavor\r\n\r\nOrder now-stylaxx.com & treat yourself! 💬📞', '/Uploads/1751922002469-stylaxx_cover.png', 1, '2025-07-07 21:00:02');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_type` enum('full_week','custom_days') NOT NULL,
  `days` varchar(100) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','paused','cancelled') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `plan_type`, `days`, `start_date`, `end_date`, `status`, `created_at`) VALUES
(1, 4, 'full_week', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', '2025-07-11', NULL, 'active', '2025-07-05 09:00:19');

-- --------------------------------------------------------

--
-- Table structure for table `testimonials`
--

CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `testimonials`
--

INSERT INTO `testimonials` (`id`, `user_id`, `content`, `rating`, `is_active`, `created_at`) VALUES
(8, 1, 'The food from Dinner O clock is amazing! Fast delivery and delicious food. I am very satisfied!', 5, 1, '2025-07-07 20:42:13'),
(9, 2, 'The food was good, but the delivery was a bit late. Overall, a good experience.', 4, 1, '2025-07-07 20:42:13'),
(10, 3, 'It was okay. Nothing special.', 3, 0, '2025-07-07 20:42:13'),
(11, 1, 'I regularly order from Dinner O clock. I always get fresh and hot food. Great service!', 5, 1, '2025-07-07 20:42:13'),
(12, 2, 'Today\'s food was not that good. I hope it will be better next time.', 2, 1, '2025-07-07 20:42:13');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `is_admin` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `address`, `phone`, `created_at`, `is_admin`) VALUES
(1, 'Test User', 'user@example.com', 'ajjiad', '123 Test Address', '01744556670', '2025-07-04 18:31:16', 0),
(2, 'Abdullah', 'aj@gmail.com', 'ajjiad00', 'Savar Cantonment Bazar Rd', '016-130-5222', '2025-07-04 19:03:29', 0),
(3, 'DOTAJ.', 'dotajdot@gmail.com', 'ajjiad', 'Savar Cantonment Bazar Rd', '01613055222', '2025-07-04 19:17:16', 0),
(4, 'Admin User', 'admin@example.com', 'admin123', '123 Admin St', '123-456-7890', '2025-07-05 06:18:49', 1),
(5, 'She', 'she@gmail.com', 'she', 'jagannath ganj ghat', '01996675960', '2025-07-07 18:50:44', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `catering_requests`
--
ALTER TABLE `catering_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `menu_item_id` (`menu_item_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `catering_requests`
--
ALTER TABLE `catering_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `catering_requests`
--
ALTER TABLE `catering_requests`
  ADD CONSTRAINT `catering_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `contact_messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `testimonials`
--
ALTER TABLE `testimonials`
  ADD CONSTRAINT `testimonials_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
