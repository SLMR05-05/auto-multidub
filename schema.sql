-- =============================================================================
-- AUTO-NARRATION & MULTILINGUAL AI TRAVEL COMPANION SYSTEM
-- Database Schema (MySQL 8.0+)
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `multilingual_travel_guide`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `multilingual_travel_guide`;

-- Tắt kiểm tra khóa ngoại trong quá trình khởi tạo cấu trúc
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. PHÂN HỆ QUẢN TRỊ CMS & XÁC THỰC NGƯỜI DÙNG (ADMIN, EDITOR, DU KHÁCH)
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NULL COMMENT 'Mật khẩu băm (null nếu đăng nhập thuần OAuth2 Google/Apple/Facebook)',
    `full_name` VARCHAR(100) NOT NULL,
    `role` ENUM('ADMIN', 'EDITOR', 'ANALYST', 'USER') NOT NULL DEFAULT 'USER' COMMENT 'USER: Du khách dùng Web App',
    `avatar_url` VARCHAR(600) NULL,
    `phone_number` VARCHAR(20) NULL,
    `is_email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `failed_attempts` INT NOT NULL DEFAULT 0,
    `locked_until` DATETIME NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`),
    KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_social_accounts`;
CREATE TABLE `user_social_accounts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `provider` ENUM('GOOGLE', 'APPLE', 'FACEBOOK') NOT NULL COMMENT 'Nhà cung cấp OAuth2',
    `provider_user_id` VARCHAR(150) NOT NULL COMMENT 'Sub/ID định danh duy nhất từ Google/Apple/Facebook',
    `email` VARCHAR(150) NULL,
    `avatar_url` VARCHAR(600) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_provider_user` (`provider`, `provider_user_id`),
    KEY `idx_social_user` (`user_id`),
    CONSTRAINT `fk_social_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `device_info` VARCHAR(255) NULL,
    `ip_address` VARCHAR(45) NULL,
    `expires_at` DATETIME NOT NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_refresh_token` (`token`),
    KEY `idx_refresh_user` (`user_id`),
    CONSTRAINT `fk_refresh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_favorites`;
CREATE TABLE `user_favorites` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `poi_id` BIGINT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_poi_fav` (`user_id`, `poi_id`),
    KEY `idx_fav_user` (`user_id`),
    CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_fav_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `action` VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, PUBLISH',
    `entity_name` VARCHAR(50) NOT NULL COMMENT 'POI, TOUR, AUDIO, QR, SYSTEM',
    `entity_id` BIGINT NULL,
    `before_data` JSON NULL,
    `after_data` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_audit_user` (`user_id`),
    KEY `idx_audit_entity` (`entity_name`, `entity_id`),
    KEY `idx_audit_created` (`created_at`),
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `setting_key` VARCHAR(50) NOT NULL,
    `setting_value` TEXT NOT NULL,
    `description` VARCHAR(255) NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. PHÂN HỆ QUẢN LÝ DANH MỤC NGÔN NGỮ & ĐỊA BÀN THÍ ĐIỂM
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `languages`;
CREATE TABLE `languages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(10) NOT NULL COMMENT 'vi, en, zh-CN, th, hi, ko, ja, ...',
    `name` VARCHAR(50) NOT NULL COMMENT 'Vietnamese, English, Thai, ...',
    `native_name` VARCHAR(100) NOT NULL COMMENT 'Tiếng Việt, English, ไทย, ...',
    `locale_tts` VARCHAR(20) NOT NULL COMMENT 'vi-VN, en-US, th-TH, ...',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_default` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Tiếng Việt là ngôn ngữ mặc định (bắt buộc)',
    `order_index` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_languages_code` (`code`),
    KEY `idx_languages_active` (`is_active`, `order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `wards`;
CREATE TABLE `wards` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT 'Khánh Hội, Vĩnh Hội, Xóm Chiếu',
    `district` VARCHAR(50) NOT NULL DEFAULT 'Quận 4',
    `city` VARCHAR(50) NOT NULL DEFAULT 'Thành phố Hồ Chí Minh',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_wards_name` (`name`, `district`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `bus_stops`;
CREATE TABLE `bus_stops` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `code` VARCHAR(50) NULL COMMENT 'Mã trạm xe buýt quy hoạch',
    `ward_id` BIGINT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `address` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_busstops_ward` (`ward_id`),
    CONSTRAINT `fk_busstops_ward` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. PHÂN HỆ ĐIỂM THUYẾT MINH POI & ĐA PHƯƠNG TIỆN (AUDIO, ẢNH, BẢN DỊCH)
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `pois`;
CREATE TABLE `pois` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã định danh duy nhất (VD: POI_NHA_RONG)',
    `name` VARCHAR(200) NOT NULL COMMENT 'Tên địa danh tiếng Việt chuẩn',
    `ward_id` BIGINT NULL,
    `bus_stop_id` BIGINT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `radius_meters` INT NOT NULL DEFAULT 50 COMMENT 'PRD P1: 20m - 300m, mặc định 50m',
    `priority` INT NOT NULL DEFAULT 3 COMMENT '1 (thấp nhất) đến 5 (cao nhất)',
    `cooldown_minutes` INT NULL COMMENT 'Ghi đè thời gian cooldown riêng (null = 30 phút mặc định)',
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `version` INT NOT NULL DEFAULT 1 COMMENT 'Phiên bản dữ liệu nội dung POI',
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_pois_code` (`code`),
    KEY `idx_pois_status` (`status`, `is_deleted`),
    KEY `idx_pois_ward` (`ward_id`),
    KEY `idx_pois_bus_stop` (`bus_stop_id`),
    CONSTRAINT `fk_pois_ward` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_pois_bus_stop` FOREIGN KEY (`bus_stop_id`) REFERENCES `bus_stops` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `poi_translations`;
CREATE TABLE `poi_translations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `poi_id` BIGINT NOT NULL,
    `language_code` VARCHAR(10) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `narration_script` LONGTEXT NOT NULL COMMENT 'Kịch bản đọc TTS chuẩn theo dấu câu đặc thù',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_poi_lang` (`poi_id`, `language_code`),
    CONSTRAINT `fk_poi_trans_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_poi_trans_lang` FOREIGN KEY (`language_code`) REFERENCES `languages` (`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `poi_audios`;
CREATE TABLE `poi_audios` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `poi_id` BIGINT NOT NULL,
    `language_code` VARCHAR(10) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(600) NOT NULL,
    `audio_url` VARCHAR(600) NOT NULL,
    `format` VARCHAR(20) NOT NULL DEFAULT 'mp3' COMMENT 'mp3, m4a, aac, wav',
    `duration_seconds` INT NOT NULL DEFAULT 0,
    `file_size_bytes` BIGINT NOT NULL DEFAULT 0,
    `checksum_sha256` VARCHAR(64) NULL,
    `is_prerecorded` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'True = File thu âm thật; False = Sinh bằng TTS',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_poi_audio_lang` (`poi_id`, `language_code`),
    CONSTRAINT `fk_poi_audio_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_poi_audio_lang` FOREIGN KEY (`language_code`) REFERENCES `languages` (`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `poi_images`;
CREATE TABLE `poi_images` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `poi_id` BIGINT NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(600) NOT NULL,
    `image_url` VARCHAR(600) NOT NULL,
    `order_index` INT NOT NULL DEFAULT 0,
    `is_primary` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_poi_images_poi` (`poi_id`, `order_index`),
    CONSTRAINT `fk_poi_images_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. PHÂN HỆ TUYẾN TOUR & MÃ QR HIỆN TRƯỜNG
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `tours`;
CREATE TABLE `tours` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `cover_image_url` VARCHAR(600) NULL,
    `estimated_minutes` INT NOT NULL DEFAULT 60,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `version` INT NOT NULL DEFAULT 1,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_tours_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tour_pois`;
CREATE TABLE `tour_pois` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tour_id` BIGINT NOT NULL,
    `poi_id` BIGINT NOT NULL,
    `order_index` INT NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_tour_poi` (`tour_id`, `poi_id`),
    KEY `idx_tour_pois_order` (`tour_id`, `order_index`),
    CONSTRAINT `fk_tour_pois_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tour_pois_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `qr_codes`;
CREATE TABLE `qr_codes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL COMMENT 'Chuỗi ngẫu nhiên Base62 >= 8 ký tự',
    `poi_id` BIGINT NOT NULL,
    `bus_stop_id` BIGINT NULL,
    `label` VARCHAR(150) NULL COMMENT 'Tên biển báo / Vị trí dán vật lý',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `scan_count` BIGINT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_qrcodes_code` (`code`),
    KEY `idx_qrcodes_poi` (`poi_id`),
    KEY `idx_qrcodes_bus_stop` (`bus_stop_id`),
    CONSTRAINT `fk_qrcodes_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_qrcodes_bus_stop` FOREIGN KEY (`bus_stop_id`) REFERENCES `bus_stops` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. PHÂN HỆ ĐÓNG GÓI DỮ LIỆU OFFLINE & ĐỒNG BỘ VI SAI (DELTA SYNC)
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `offline_packages`;
CREATE TABLE `offline_packages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `ward_id` BIGINT NULL,
    `tour_id` BIGINT NULL,
    `language_code` VARCHAR(10) NULL COMMENT 'null = gói hình ảnh dùng chung',
    `package_type` ENUM('MEDIA_IMAGES', 'AUDIO_LANG', 'FULL_BUNDLE') NOT NULL,
    `version` INT NOT NULL DEFAULT 1,
    `file_path` VARCHAR(600) NOT NULL,
    `file_size_bytes` BIGINT NOT NULL,
    `checksum_sha256` VARCHAR(64) NOT NULL,
    `status` ENUM('BUILDING', 'READY', 'FAILED', 'DEPRECATED') NOT NULL DEFAULT 'READY',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_offline_ward` (`ward_id`),
    KEY `idx_offline_tour` (`tour_id`),
    CONSTRAINT `fk_offline_ward` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_offline_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `offline_package_pois`;
CREATE TABLE `offline_package_pois` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `package_id` BIGINT NOT NULL,
    `poi_id` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_package_poi` (`package_id`, `poi_id`),
    CONSTRAINT `fk_pkg_pois_pkg` FOREIGN KEY (`package_id`) REFERENCES `offline_packages` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pkg_pois_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. PHÂN HỆ ĐỊNH DANH DU KHÁCH (THIẾT BỊ / TÀI KHOẢN) & ANALYTICS HÀNH VI
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `devices`;
CREATE TABLE `devices` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `device_id` VARCHAR(64) NOT NULL COMMENT 'Chuỗi UUID ngẫu nhiên tạo trên mobile/web app',
    `user_id` BIGINT NULL COMMENT 'Tài khoản người dùng đăng nhập trên thiết bị',
    `consent_analytics` BOOLEAN NOT NULL DEFAULT TRUE,
    `os_version` VARCHAR(50) NULL,
    `app_version` VARCHAR(20) NULL,
    `preferred_language` VARCHAR(10) NOT NULL DEFAULT 'vi',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_devices_uuid` (`device_id`),
    KEY `idx_devices_user` (`user_id`),
    CONSTRAINT `fk_devices_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `playback_logs`;
CREATE TABLE `playback_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `device_id` VARCHAR(64) NOT NULL,
    `user_id` BIGINT NULL COMMENT 'Tài khoản người dùng đăng nhập khi nghe',
    `poi_id` BIGINT NOT NULL,
    `trigger_type` ENUM('GPS', 'QR', 'MANUAL') NOT NULL,
    `audio_mode` ENUM('PRERECORDED', 'TTS') NOT NULL,
    `language_code` VARCHAR(10) NOT NULL,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NULL,
    `listened_seconds` INT NOT NULL DEFAULT 0,
    `is_completed` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'PRD: >= 95% độ dài bài',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_playback_poi` (`poi_id`, `created_at`),
    KEY `idx_playback_device` (`device_id`),
    KEY `idx_playback_user` (`user_id`),
    KEY `idx_playback_trigger` (`trigger_type`),
    CONSTRAINT `fk_playback_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_playback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tracking_sessions`;
CREATE TABLE `tracking_sessions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `device_id` VARCHAR(64) NOT NULL,
    `user_id` BIGINT NULL,
    `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ended_at` DATETIME NULL,
    `total_points` INT NOT NULL DEFAULT 0,
    `is_anonymized` BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (`id`),
    KEY `idx_tracking_device` (`device_id`, `started_at`),
    KEY `idx_tracking_user` (`user_id`),
    CONSTRAINT `fk_tracking_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `location_points`;
CREATE TABLE `location_points` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `session_id` BIGINT NOT NULL,
    `device_id` VARCHAR(64) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `accuracy_meters` DOUBLE NOT NULL,
    `recorded_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_points_session` (`session_id`),
    KEY `idx_points_time` (`recorded_at`),
    CONSTRAINT `fk_points_session` FOREIGN KEY (`session_id`) REFERENCES `tracking_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. PHÂN HỆ TRỢ LÝ ĐỐI ĐÁP VOICE AI & DỊCH THUẬT DU KHÁCH (MỚI BỔ SUNG)
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `conversation_sessions`;
CREATE TABLE `conversation_sessions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `device_id` VARCHAR(64) NOT NULL,
    `user_id` BIGINT NULL COMMENT 'Tài khoản du khách đối thoại',
    `current_poi_id` BIGINT NULL COMMENT 'POI du khách đang đứng gần (nếu có context)',
    `language_code` VARCHAR(10) NOT NULL DEFAULT 'vi',
    `session_title` VARCHAR(255) NULL COMMENT 'Tóm tắt chủ đề đối thoại',
    `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_conv_device` (`device_id`),
    KEY `idx_conv_user` (`user_id`),
    KEY `idx_conv_poi` (`current_poi_id`),
    CONSTRAINT `fk_conv_poi` FOREIGN KEY (`current_poi_id`) REFERENCES `pois` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_conv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `conversation_messages`;
CREATE TABLE `conversation_messages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `session_id` BIGINT NOT NULL,
    `sender_type` ENUM('USER', 'ASSISTANT') NOT NULL,
    `input_type` ENUM('VOICE', 'TEXT') NOT NULL DEFAULT 'VOICE',
    `content` TEXT NOT NULL COMMENT 'Nội dung người dùng nói hoặc AI trả lời',
    `audio_url` VARCHAR(600) NULL COMMENT 'File âm thanh giọng nói (TTS đối với AI hoặc ghi âm của User)',
    `tokens_used` INT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_msg_session` (`session_id`),
    CONSTRAINT `fk_msg_session` FOREIGN KEY (`session_id`) REFERENCES `conversation_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `translation_logs`;
CREATE TABLE `translation_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `device_id` VARCHAR(64) NOT NULL,
    `user_id` BIGINT NULL,
    `source_language` VARCHAR(10) NOT NULL,
    `target_language` VARCHAR(10) NOT NULL,
    `original_text` TEXT NOT NULL,
    `translated_text` TEXT NOT NULL,
    `audio_url` VARCHAR(600) NULL COMMENT 'Âm thanh đọc văn bản dịch',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_trans_device` (`device_id`, `created_at`),
    KEY `idx_trans_user` (`user_id`),
    CONSTRAINT `fk_trans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- DỮ LIỆU KHỞI TẠO BAN ĐẦU (SEED DATA)
-- =============================================================================

-- 1. Danh mục 7 ngôn ngữ quốc tế chuẩn PRD (kèm cờ bật/tắt và mặc định)
INSERT INTO `languages` (`code`, `name`, `native_name`, `locale_tts`, `is_active`, `is_default`, `order_index`) VALUES
('vi', 'Vietnamese', 'Tiếng Việt', 'vi-VN', TRUE, TRUE, 1),
('en', 'English', 'English', 'en-US', TRUE, FALSE, 2),
('zh-CN', 'Chinese (Simplified)', '简体中文', 'zh-CN', TRUE, FALSE, 3),
('th', 'Thai', 'ไทย', 'th-TH', TRUE, FALSE, 4),
('hi', 'Hindi', 'हिन्दी', 'hi-IN', TRUE, FALSE, 5),
('ko', 'Korean', '한국어', 'ko-KR', TRUE, FALSE, 6),
('ja', 'Japanese', '日本語', 'ja-JP', TRUE, FALSE, 7);

-- 2. Danh mục 3 phường thí điểm (Quận 4)
INSERT INTO `wards` (`name`, `district`, `city`) VALUES
('Khánh Hội', 'Quận 4', 'Thành phố Hồ Chí Minh'),
('Vĩnh Hội', 'Quận 4', 'Thành phố Hồ Chí Minh'),
('Xóm Chiếu', 'Quận 4', 'Thành phố Hồ Chí Minh');

-- 3. Tham số hệ thống mặc định theo PRD (P1 - P10)
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES
('DATA_VERSION', '1', 'Phiên bản dữ liệu toàn hệ thống phục vụ Delta Sync'),
('GEOFENCE_RADIUS_DEFAULT', '50', 'Bán kính kích hoạt Geofence mặc định (mét)'),
('DEBOUNCE_SECONDS', '3', 'Thời gian ở trong vùng liên tục trước khi kích hoạt (giây)'),
('HYSTERESIS_FACTOR', '1.2', 'Hệ số bán kính khi rời vùng kích hoạt'),
('COOLDOWN_MINUTES', '30', 'Thời gian tối thiểu không phát lặp cùng 1 POI (phút)'),
('GPS_ACCURACY_THRESHOLD', '50', 'Ngưỡng sai số GPS chấp nhận được (mét)'),
('ANALYTICS_RECORD_MOVING_INTERVAL', '10', 'Chu kỳ ghi nhận tọa độ khi di chuyển (giây)'),
('ANALYTICS_RECORD_IDLE_INTERVAL', '60', 'Chu kỳ ghi nhận tọa độ khi đứng yên (giây)'),
('RAW_LOCATION_RETENTION_DAYS', '90', 'Thời hạn lưu trữ dữ liệu tọa độ thô (ngày)');
