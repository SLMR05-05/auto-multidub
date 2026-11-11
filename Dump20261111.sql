-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: multilingual_travel_guide
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audios`
--

DROP TABLE IF EXISTS `audios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(600) COLLATE utf8mb4_unicode_ci NOT NULL,
  `format` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `language_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `translation_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audios`
--

LOCK TABLES `audios` WRITE;
/*!40000 ALTER TABLE `audios` DISABLE KEYS */;
/*!40000 ALTER TABLE `audios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `action` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `before_data` json DEFAULT NULL,
  `after_data` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actor_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actor_id` bigint DEFAULT NULL,
  `entity_type` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_entity` (`entity_name`,`entity_id`),
  KEY `idx_audit_created` (`created_at`),
  KEY `idx_audit_actor` (`actor_email`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'INITIALIZE_SYSTEM','SYSTEM_SETTINGS','1',NULL,'{\"status\": \"INITIALIZED\"}','127.0.0.1','2026-11-04 14:37:06',NULL,NULL,''),(2,2,'PUBLISH_POI','POIS','1','{\"status\": \"DRAFT\"}','{\"status\": \"PUBLISHED\"}','127.0.0.1','2026-11-04 14:37:06',NULL,NULL,''),(3,2,'CREATE_TOUR','TOURS','1',NULL,'{\"code\": \"TOUR_LICH_SU_Q4\"}','127.0.0.1','2026-11-04 14:37:06',NULL,NULL,''),(4,NULL,'UPSERT_TRANSLATION',NULL,'1',NULL,'{\"name\": \"Bến Nhà Rồng - Di tích Lịch sử Khởi hành tìm đường cứu nước\", \"language\": \"vi\"}',NULL,'2026-11-11 11:43:03','admin@example.com',6,'POI'),(5,NULL,'UPSERT_TRANSLATION',NULL,'1',NULL,'{\"name\": \"Bến Nhà Rồng - Di tích Lịch sử Khởi hành tìm đường cứu nước\", \"language\": \"vi\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(6,NULL,'UPSERT_TRANSLATION',NULL,'1',NULL,'{\"name\": \"Nha Rong Wharf - Ho Chi Minh Museum\", \"language\": \"en\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(7,NULL,'UPSERT_TRANSLATION',NULL,'1',NULL,'{\"name\": \"芽龙港 - 胡志明博物馆\", \"language\": \"zh-CN\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(8,NULL,'UPSERT_TRANSLATION',NULL,'1',NULL,'{\"name\": \"ท่าเรือญารง - พิพิธภัณฑ์โฮจิมินห์\", \"language\": \"th\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(9,NULL,'UPSERT_TRANSLATION',NULL,'1',NULL,'{\"name\": \"न्हा रोंग घाट - हो ची मिन्ह संग्रहालय\", \"language\": \"hi\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(10,NULL,'UPSERT_TRANSLATION',NULL,'1',NULL,'{\"name\": \"냐롱 부두 - 호찌민 박물관\", \"language\": \"ko\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(11,NULL,'UPSERT_TRANSLATION',NULL,'1',NULL,'{\"name\": \"ニャロン埠頭 - ホーチミン博物館\", \"language\": \"ja\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(12,NULL,'UPSERT_TRANSLATION',NULL,'2',NULL,'{\"name\": \"Cầu Mống bắc qua Kênh Bến Nghé\", \"language\": \"vi\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(13,NULL,'UPSERT_TRANSLATION',NULL,'2',NULL,'{\"name\": \"Mong Bridge - Century-old Pedestrian Bridge\", \"language\": \"en\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(14,NULL,'UPSERT_TRANSLATION',NULL,'2',NULL,'{\"name\": \"蒙桥（Cầu Mống）- 百年人行桥\", \"language\": \"zh-CN\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(15,NULL,'UPSERT_TRANSLATION',NULL,'2',NULL,'{\"name\": \"สะพานม้ง - สะพานเดินเท้าอายุนับศตวรรษ\", \"language\": \"th\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(16,NULL,'UPSERT_TRANSLATION',NULL,'2',NULL,'{\"name\": \"मोंग ब्रिज - सदी पुराना पैदल पुल\", \"language\": \"hi\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(17,NULL,'UPSERT_TRANSLATION',NULL,'2',NULL,'{\"name\": \"몽 다리 - 백년의 보행자 다리\", \"language\": \"ko\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(18,NULL,'UPSERT_TRANSLATION',NULL,'2',NULL,'{\"name\": \"モン橋 - 百年の歩道橋\", \"language\": \"ja\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(19,NULL,'UPSERT_TRANSLATION',NULL,'3',NULL,'{\"name\": \"Công viên Khánh Hội & Khu thể thao Vân Đồn\", \"language\": \"vi\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(20,NULL,'UPSERT_TRANSLATION',NULL,'3',NULL,'{\"name\": \"Khanh Hoi Park & Van Don Sports Center\", \"language\": \"en\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(21,NULL,'UPSERT_TRANSLATION',NULL,'3',NULL,'{\"name\": \"庆会公园与云屯体育中心\", \"language\": \"zh-CN\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(22,NULL,'UPSERT_TRANSLATION',NULL,'3',NULL,'{\"name\": \"สวนสาธารณะคั้ญโห่ยและศูนย์กีฬาวันดอน\", \"language\": \"th\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(23,NULL,'UPSERT_TRANSLATION',NULL,'3',NULL,'{\"name\": \"खान्ह होई पार्क और वान दोन खेल केंद्र\", \"language\": \"hi\"}',NULL,'2026-11-11 11:43:08','admin@example.com',6,'POI'),(24,NULL,'UPSERT_TRANSLATION',NULL,'3',NULL,'{\"name\": \"칸호이 공원과 반돈 체육센터\", \"language\": \"ko\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(25,NULL,'UPSERT_TRANSLATION',NULL,'3',NULL,'{\"name\": \"カインホイ公園とヴァンドン体育センター\", \"language\": \"ja\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(26,NULL,'UPSERT_TRANSLATION',NULL,'4',NULL,'{\"name\": \"Giáo xứ Nhà thờ Vĩnh Hội\", \"language\": \"vi\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(27,NULL,'UPSERT_TRANSLATION',NULL,'4',NULL,'{\"name\": \"Vinh Hoi Parish Church\", \"language\": \"en\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(28,NULL,'UPSERT_TRANSLATION',NULL,'4',NULL,'{\"name\": \"永汇教区教堂\", \"language\": \"zh-CN\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(29,NULL,'UPSERT_TRANSLATION',NULL,'4',NULL,'{\"name\": \"โบสถ์หวิญโห่ย\", \"language\": \"th\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(30,NULL,'UPSERT_TRANSLATION',NULL,'4',NULL,'{\"name\": \"विन्ह होई पैरिश चर्च\", \"language\": \"hi\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(31,NULL,'UPSERT_TRANSLATION',NULL,'4',NULL,'{\"name\": \"빈호이 성당\", \"language\": \"ko\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(32,NULL,'UPSERT_TRANSLATION',NULL,'4',NULL,'{\"name\": \"ヴィンホイ教会\", \"language\": \"ja\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(33,NULL,'UPSERT_TRANSLATION',NULL,'5',NULL,'{\"name\": \"Đình Vĩnh Hội - Di tích Kiến trúc Nghệ thuật\", \"language\": \"vi\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(34,NULL,'UPSERT_TRANSLATION',NULL,'5',NULL,'{\"name\": \"Vinh Hoi Communal House - Architectural and Artistic Relic\", \"language\": \"en\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(35,NULL,'UPSERT_TRANSLATION',NULL,'5',NULL,'{\"name\": \"永汇亭 - 建筑艺术遗迹\", \"language\": \"zh-CN\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(36,NULL,'UPSERT_TRANSLATION',NULL,'5',NULL,'{\"name\": \"ศาลเจ้าเวียญโห่ย - โบราณสถานศิลปะสถาปัตยกรรม\", \"language\": \"th\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(37,NULL,'UPSERT_TRANSLATION',NULL,'5',NULL,'{\"name\": \"विन्ह होई सामुदायिक मंदिर - वास्तुकला एवं कला स्मारक\", \"language\": \"hi\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(38,NULL,'UPSERT_TRANSLATION',NULL,'5',NULL,'{\"name\": \"빈호이 사당 - 건축 예술 유적\", \"language\": \"ko\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(39,NULL,'UPSERT_TRANSLATION',NULL,'5',NULL,'{\"name\": \"ヴィンホイ亭 - 建築芸術遺跡\", \"language\": \"ja\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(40,NULL,'UPSERT_TRANSLATION',NULL,'6',NULL,'{\"name\": \"Phố Ẩm thực Ốc Vĩnh Khánh - Sôi động về đêm\", \"language\": \"vi\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(41,NULL,'UPSERT_TRANSLATION',NULL,'6',NULL,'{\"name\": \"Vinh Khanh Seafood & Snail Food Street\", \"language\": \"en\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(42,NULL,'UPSERT_TRANSLATION',NULL,'6',NULL,'{\"name\": \"永庆海鲜螺蛳美食街\", \"language\": \"zh-CN\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(43,NULL,'UPSERT_TRANSLATION',NULL,'6',NULL,'{\"name\": \"ถนนอาหารทะเลหอยหวิญคั้ญ\", \"language\": \"th\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(44,NULL,'UPSERT_TRANSLATION',NULL,'6',NULL,'{\"name\": \"विन्ह खान्ह सीफूड और घोंघा फूड स्ट्रीट\", \"language\": \"hi\"}',NULL,'2026-11-11 11:43:09','admin@example.com',6,'POI'),(45,NULL,'UPSERT_TRANSLATION',NULL,'6',NULL,'{\"name\": \"빈칸 해산물·달팽이 먹자골목\", \"language\": \"ko\"}',NULL,'2026-11-11 11:43:10','admin@example.com',6,'POI'),(46,NULL,'UPSERT_TRANSLATION',NULL,'6',NULL,'{\"name\": \"ヴィンカイン海鮮・巻貝グルメ街\", \"language\": \"ja\"}',NULL,'2026-11-11 11:43:10','admin@example.com',6,'POI'),(47,NULL,'UPSERT_TRANSLATION',NULL,'7',NULL,'{\"name\": \"Chợ Xóm Chiếu (Chợ 200 - Thiên đường ăn vặt)\", \"language\": \"vi\"}',NULL,'2026-11-11 11:43:10','admin@example.com',6,'POI'),(48,NULL,'UPSERT_TRANSLATION',NULL,'7',NULL,'{\"name\": \"Xom Chieu Market (Market 200 - Street Food Paradise)\", \"language\": \"en\"}',NULL,'2026-11-11 11:43:10','admin@example.com',6,'POI'),(49,NULL,'UPSERT_TRANSLATION',NULL,'7',NULL,'{\"name\": \"召庙市场（200市场 - 街头美食天堂）\", \"language\": \"zh-CN\"}',NULL,'2026-11-11 11:43:10','admin@example.com',6,'POI'),(50,NULL,'UPSERT_TRANSLATION',NULL,'7',NULL,'{\"name\": \"ตลาดซ๊อมเจี๊ยว (ตลาด 200 - สวรรค์ของอาหารว่าง)\", \"language\": \"th\"}',NULL,'2026-11-11 11:43:10','admin@example.com',6,'POI'),(51,NULL,'UPSERT_TRANSLATION',NULL,'7',NULL,'{\"name\": \"सोम चीउ बाज़ार (बाज़ार 200 - स्ट्रीट फूड का स्वर्ग)\", \"language\": \"hi\"}',NULL,'2026-11-11 11:43:10','admin@example.com',6,'POI'),(52,NULL,'UPSERT_TRANSLATION',NULL,'7',NULL,'{\"name\": \"촘찌에우 시장 (200 시장 - 길거리 음식의 천국)\", \"language\": \"ko\"}',NULL,'2026-11-11 11:43:10','admin@example.com',6,'POI'),(53,NULL,'UPSERT_TRANSLATION',NULL,'7',NULL,'{\"name\": \"ソムチエウ市場（200市場 - 屋台グルメの天国）\", \"language\": \"ja\"}',NULL,'2026-11-11 11:43:10','admin@example.com',6,'POI'),(54,NULL,'UPSERT_TRANSLATION',NULL,'5',NULL,'{\"name\": \"ศาลเจ้าหวิญโห่ย - โบราณสถานศิลปะสถาปัตยกรรม\", \"language\": \"th\"}',NULL,'2026-11-11 11:44:21','admin@example.com',6,'POI'),(55,NULL,'UPSERT_TRANSLATION',NULL,'5',NULL,'{\"name\": \"Đình Vĩnh Hội - Di tích Kiến trúc Nghệ thuật\", \"language\": \"vi\"}',NULL,'2026-11-11 13:43:45','admin@example.com',6,'POI'),(56,NULL,'PUBLISH',NULL,'5',NULL,'{\"status\": \"PUBLISHED\", \"version\": 54}',NULL,'2026-11-11 13:43:45','admin@example.com',6,'POI');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_stops`
--

DROP TABLE IF EXISTS `bus_stops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_stops` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward_id` bigint DEFAULT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_busstops_ward` (`ward_id`),
  CONSTRAINT `fk_busstops_ward` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_stops`
--

LOCK TABLES `bus_stops` WRITE;
/*!40000 ALTER TABLE `bus_stops` DISABLE KEYS */;
INSERT INTO `bus_stops` VALUES (1,'Trạm Cầu Khánh Hội (01)','BS-KH01',1,10.7681,106.7052,'Đoàn Như Hài, Phường Khánh Hội, Quận 4',1,'2026-11-04 14:37:06',NULL),(2,'Trạm Bến Nhà Rồng (02)','BS-KH02',1,10.7675,106.7068,'Nguyễn Tất Thành, Phường Khánh Hội, Quận 4',1,'2026-11-04 14:37:06',NULL),(3,'Trạm Cầu Ông Lãnh Vĩnh Hội (03)','BS-VH01',2,10.7645,106.6995,'Hoàng Diệu, Phường Vĩnh Hội, Quận 4',1,'2026-11-04 14:37:06',NULL),(4,'Trạm Chợ Xóm Chiếu (04)','BS-XC01',3,10.7618,106.7042,'Lê Văn Linh, Phường Xóm Chiếu, Quận 4',1,'2026-11-04 14:37:06',NULL),(5,'Trạm Nhà thờ Xóm Chiếu (05)','BS-XC02',3,10.7602,106.7058,'Nguyễn Tất Thành, Phường Xóm Chiếu, Quận 4',1,'2026-11-04 14:37:06',NULL);
/*!40000 ALTER TABLE `bus_stops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_messages`
--

DROP TABLE IF EXISTS `conversation_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` bigint NOT NULL,
  `sender_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `input_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung người dùng nói hoặc AI trả lời',
  `audio_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tokens_used` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_msg_session` (`session_id`),
  CONSTRAINT `fk_msg_session` FOREIGN KEY (`session_id`) REFERENCES `conversation_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_messages`
--

LOCK TABLES `conversation_messages` WRITE;
/*!40000 ALTER TABLE `conversation_messages` DISABLE KEYS */;
INSERT INTO `conversation_messages` VALUES (1,1,'USER','VOICE','Bến Nhà Rồng mở cửa vào những khung giờ nào vậy trợ lý?',NULL,24,'2026-11-04 13:20:51'),(2,1,'ASSISTANT','VOICE','Bảo tàng Hồ Chí Minh - Bến Nhà Rồng mở cửa từ 7h30 đến 11h30 và 13h30 đến 17h00 từ Thứ Ba đến Chủ Nhật hàng tuần. Thứ Hai đóng cửa định kỳ bạn nhé!','audio/ai_resp_1.mp3',88,'2026-11-04 13:21:51'),(3,2,'USER','VOICE','What are the must-try dishes here at Xom Chieu market?',NULL,18,'2026-11-04 14:10:51'),(4,2,'ASSISTANT','VOICE','At Xom Chieu Market 200, you definitely should try Pha Lau (braised beef offal with bread), crispy fried seafood spring rolls, and hot crab soup along Le Van Linh street!','audio/ai_resp_2.mp3',95,'2026-11-04 14:11:51');
/*!40000 ALTER TABLE `conversation_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_sessions`
--

DROP TABLE IF EXISTS `conversation_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `device_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint DEFAULT NULL COMMENT 'Tài khoản du khách đối thoại',
  `current_poi_id` bigint DEFAULT NULL COMMENT 'POI du khách đang đứng gần (nếu có context)',
  `language_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vi',
  `session_title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ended_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_conv_device` (`device_id`),
  KEY `idx_conv_user` (`user_id`),
  KEY `idx_conv_poi` (`current_poi_id`),
  CONSTRAINT `fk_conv_poi` FOREIGN KEY (`current_poi_id`) REFERENCES `pois` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_conv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_sessions`
--

LOCK TABLES `conversation_sessions` WRITE;
/*!40000 ALTER TABLE `conversation_sessions` DISABLE KEYS */;
INSERT INTO `conversation_sessions` VALUES (1,'dev-c8a41280-97bf-4e76-a200-fe7445441ca2',4,1,'vi','Hỏi đáp lịch sử và giá vé Bến Nhà Rồng','2026-11-04 13:19:51','2026-11-04 14:37:56',NULL),(2,'dev-77b31190-21ac-4e12-b110-ee88992233aa',5,7,'en','Food recommendations around Xom Chieu Market','2026-11-04 14:09:51','2026-11-04 14:34:51',NULL);
/*!40000 ALTER TABLE `conversation_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devices`
--

DROP TABLE IF EXISTS `devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `device_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Chuỗi UUID ngẫu nhiên tạo trên mobile/web app',
  `user_id` bigint DEFAULT NULL COMMENT 'Tài khoản người dùng đăng nhập trên thiết bị',
  `consent_analytics` tinyint(1) NOT NULL DEFAULT '1',
  `os_version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `app_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_language` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vi',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `analytics_consent` bit(1) NOT NULL,
  `consent_updated_at` datetime(6) DEFAULT NULL,
  `last_seen_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `device_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'WEB',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_devices_uuid` (`device_id`),
  KEY `idx_devices_user` (`user_id`),
  CONSTRAINT `fk_devices_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devices`
--

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;
INSERT INTO `devices` VALUES (1,'dev-c8a41280-97bf-4e76-a200-fe7445441ca2',4,1,'Windows 11 (Chrome)','2.1.0','vi','2026-11-04 14:34:50','2026-11-11 14:04:17',_binary '\0',NULL,'2026-11-11 13:30:33','WEB'),(2,'dev-77b31190-21ac-4e12-b110-ee88992233aa',5,1,'iOS 18 (Mobile App)','2.1.0','en','2026-11-04 14:34:50','2026-11-11 14:04:17',_binary '\0',NULL,'2026-11-11 13:30:33','APP'),(3,'web-client-test-1',NULL,1,NULL,NULL,'vi','2026-11-11 13:30:41','2026-11-11 13:30:41',_binary '\0',NULL,'2026-11-11 13:30:41','WEB'),(4,'dev-ff7199bc-0ccc-4ed2',NULL,1,NULL,NULL,'vi','2026-11-11 13:51:54','2026-11-11 13:54:17',_binary '\0',NULL,'2026-11-11 13:54:18','WEB');
/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guides`
--

DROP TABLE IF EXISTS `guides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guides` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `location_id` bigint NOT NULL,
  `source_language` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guides`
--

LOCK TABLES `guides` WRITE;
/*!40000 ALTER TABLE `guides` DISABLE KEYS */;
/*!40000 ALTER TABLE `guides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `histories`
--

DROP TABLE IF EXISTS `histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `histories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `detail` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `histories`
--

LOCK TABLES `histories` WRITE;
/*!40000 ALTER TABLE `histories` DISABLE KEYS */;
/*!40000 ALTER TABLE `histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `languages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'vi, en, zh-CN, th, hi, ko, ja, ...',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Vietnamese, English, Thai, ...',
  `native_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tiếng Việt, English, ไทย, ...',
  `locale_tts` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'vi-VN, en-US, th-TH, ...',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Tiếng Việt là ngôn ngữ mặc định (bắt buộc)',
  `order_index` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_languages_code` (`code`),
  KEY `idx_languages_active` (`is_active`,`order_index`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `languages`
--

LOCK TABLES `languages` WRITE;
/*!40000 ALTER TABLE `languages` DISABLE KEYS */;
INSERT INTO `languages` VALUES (1,'vi','Tiếng Việt','Tiếng Việt','vi-VN',1,1,1,'2026-11-04 14:30:06',_binary '\0'),(2,'en','English','English','en-US',1,0,2,'2026-11-04 14:30:06',_binary '\0'),(3,'zh-CN','French','Français','zh-CN',1,0,3,'2026-11-04 14:30:06',_binary '\0'),(4,'th','Chinese','中文','th-TH',1,0,4,'2026-11-04 14:30:06',_binary '\0'),(5,'hi','Hindi','हिन्दी','hi-IN',1,0,5,'2026-11-04 14:30:06',_binary '\0'),(6,'ko','Korean','한국어','ko-KR',1,0,6,'2026-11-04 14:30:06',_binary '\0'),(7,'ja','Japanese','日本語','ja-JP',1,0,7,'2026-11-04 14:30:06',_binary '\0');
/*!40000 ALTER TABLE `languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location_points`
--

DROP TABLE IF EXISTS `location_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location_points` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `accuracy_meters` double NOT NULL,
  `recorded_at` datetime NOT NULL,
  `accuracy` double NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_points_session` (`session_id`),
  KEY `idx_points_time` (`recorded_at`),
  KEY `idx_location_session` (`session_id`),
  KEY `idx_location_device` (`device_id`),
  KEY `idx_location_recorded` (`recorded_at`),
  CONSTRAINT `fk_points_session` FOREIGN KEY (`session_id`) REFERENCES `tracking_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location_points`
--

LOCK TABLES `location_points` WRITE;
/*!40000 ALTER TABLE `location_points` DISABLE KEYS */;
INSERT INTO `location_points` VALUES (1,'1','dev-c8a41280-97bf-4e76-a200-fe7445441ca2',10.768,106.7055,5,'2026-11-04 12:44:51',0,'2026-11-10 22:31:37'),(2,'1','dev-c8a41280-97bf-4e76-a200-fe7445441ca2',10.7683,106.7067,3.5,'2026-11-04 13:04:51',0,'2026-11-10 22:31:37'),(3,'1','dev-c8a41280-97bf-4e76-a200-fe7445441ca2',10.769,106.705,4,'2026-11-04 13:34:51',0,'2026-11-10 22:31:37'),(4,'1','dev-c8a41280-97bf-4e76-a200-fe7445441ca2',10.7695,106.7042,3,'2026-11-04 14:04:51',0,'2026-11-10 22:31:37'),(5,'1','dev-c8a41280-97bf-4e76-a200-fe7445441ca2',10.765,106.703,4.5,'2026-11-04 14:34:51',0,'2026-11-10 22:31:37'),(6,'2','dev-77b31190-21ac-4e12-b110-ee88992233aa',10.7618,106.7042,4,'2026-11-04 13:44:51',0,'2026-11-10 22:31:37'),(7,'2','dev-77b31190-21ac-4e12-b110-ee88992233aa',10.7619,106.704,3.5,'2026-11-04 13:59:51',0,'2026-11-10 22:31:37'),(8,'2','dev-77b31190-21ac-4e12-b110-ee88992233aa',10.7625,106.7015,4.2,'2026-11-04 14:19:51',0,'2026-11-10 22:31:37'),(9,'2','dev-77b31190-21ac-4e12-b110-ee88992233aa',10.7635,106.7012,5,'2026-11-04 14:34:51',0,'2026-11-10 22:31:37');
/*!40000 ALTER TABLE `location_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offline_package_pois`
--

DROP TABLE IF EXISTS `offline_package_pois`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offline_package_pois` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `package_id` bigint NOT NULL,
  `poi_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_package_poi` (`package_id`,`poi_id`),
  KEY `fk_pkg_pois_poi` (`poi_id`),
  CONSTRAINT `fk_pkg_pois_pkg` FOREIGN KEY (`package_id`) REFERENCES `offline_packages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pkg_pois_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offline_package_pois`
--

LOCK TABLES `offline_package_pois` WRITE;
/*!40000 ALTER TABLE `offline_package_pois` DISABLE KEYS */;
INSERT INTO `offline_package_pois` VALUES (1,1,1),(2,1,2),(3,1,3),(4,1,4),(5,1,5),(6,1,6),(7,1,7),(9,2,1),(10,2,2),(11,2,3),(12,2,4),(13,2,6),(14,2,7),(16,3,1),(17,3,2),(18,3,6),(19,3,7),(21,4,1),(22,4,2),(23,4,3);
/*!40000 ALTER TABLE `offline_package_pois` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offline_packages`
--

DROP TABLE IF EXISTS `offline_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offline_packages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward_id` bigint DEFAULT NULL,
  `tour_id` bigint DEFAULT NULL,
  `language_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'null = gói hình ảnh dùng chung',
  `package_type` enum('AUDIO_LANG','FULL_BUNDLE','MEDIA_IMAGES') COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` int NOT NULL DEFAULT '1',
  `file_path` varchar(700) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size_bytes` bigint NOT NULL,
  `checksum_sha256` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('BUILDING','FAILED','READY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `built_at` datetime(6) DEFAULT NULL,
  `data_version` bigint NOT NULL,
  `error_message` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `poi_count` int NOT NULL,
  `size_bytes` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_offline_ward` (`ward_id`),
  KEY `idx_offline_tour` (`tour_id`),
  KEY `idx_package_lang` (`language_code`),
  KEY `idx_package_status` (`status`),
  CONSTRAINT `fk_offline_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_offline_ward` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offline_packages`
--

LOCK TABLES `offline_packages` WRITE;
/*!40000 ALTER TABLE `offline_packages` DISABLE KEYS */;
INSERT INTO `offline_packages` VALUES (1,'PKG_MEDIA_IMAGES_Q4','Thư viện hình ảnh tư liệu di tích (Toàn bộ Quận 4)',1,NULL,'vi','MEDIA_IMAGES',2,'packages/pkg_images_q4_v2.tar.gz',25690112,'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855','READY','2026-11-04 14:34:51',NULL,0,NULL,0,25690112),(2,'PKG_AUDIO_VI_Q4','Dữ liệu giọng đọc thuyết minh Tiếng Việt (HD)',1,NULL,'vi','AUDIO_LANG',2,'packages/pkg_audio_vi_q4_v2.tar.gz',19084083,'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e','READY','2026-11-04 14:34:51',NULL,0,NULL,0,19084083),(3,'PKG_AUDIO_EN_Q4','Audio Narration English (US Native Voice)',1,NULL,'en','AUDIO_LANG',1,'packages/pkg_audio_en_q4_v1.tar.gz',17616076,'8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4','READY','2026-11-04 14:34:51',NULL,0,NULL,0,17616076),(4,'PKG_TOUR_LICH_SU','Gói dữ liệu trọn gói Tuyến Tour Di sản Quận 4',1,1,'vi','FULL_BUNDLE',1,'packages/pkg_tour_lich_su_v1.tar.gz',28311552,'5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8','READY','2026-11-04 14:34:51',NULL,0,NULL,0,28311552);
/*!40000 ALTER TABLE `offline_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playback_logs`
--

DROP TABLE IF EXISTS `playback_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playback_logs` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint DEFAULT NULL COMMENT 'Tài khoản người dùng đăng nhập khi nghe',
  `poi_id` bigint NOT NULL,
  `trigger_type` enum('GPS','MANUAL','QR') COLLATE utf8mb4_unicode_ci NOT NULL,
  `audio_mode` enum('LOCAL_AUDIO','PRERECORDED','STREAM_AUDIO','TEXT','TTS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `language_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `listened_seconds` int NOT NULL DEFAULT '0',
  `is_completed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'PRD: >= 95% độ dài bài',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `bus_stop_id` bigint DEFAULT NULL,
  `qr_code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qr_id` bigint DEFAULT NULL,
  `valid_listen` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_playback_poi` (`poi_id`,`created_at`),
  KEY `idx_playback_device` (`device_id`),
  KEY `idx_playback_user` (`user_id`),
  KEY `idx_playback_trigger` (`trigger_type`),
  KEY `idx_playback_start` (`start_time`),
  KEY `idx_playback_qr` (`qr_id`),
  CONSTRAINT `fk_playback_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_playback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playback_logs`
--

LOCK TABLES `playback_logs` WRITE;
/*!40000 ALTER TABLE `playback_logs` DISABLE KEYS */;
INSERT INTO `playback_logs` VALUES ('1','dev-c8a41280-97bf-4e76-a200-fe7445441ca2',4,1,'GPS','PRERECORDED','vi','2026-11-04 13:09:51','2026-11-04 13:10:51',65,1,'2026-11-04 14:34:51',NULL,NULL,NULL,_binary ''),('2','dev-c8a41280-97bf-4e76-a200-fe7445441ca2',4,2,'MANUAL','PRERECORDED','vi','2026-11-04 14:06:51','2026-11-04 14:07:51',45,1,'2026-11-04 14:34:51',NULL,NULL,NULL,_binary ''),('3','dev-77b31190-21ac-4e12-b110-ee88992233aa',5,7,'QR','PRERECORDED','en','2026-11-04 14:00:51','2026-11-04 14:01:51',45,1,'2026-11-04 14:34:51',NULL,NULL,NULL,_binary ''),('34d4ae45-ad76-4df9-a4db-54454109dc02','dev-ff7199bc-0ccc-4ed2',NULL,4,'MANUAL','PRERECORDED','vi','2026-11-11 06:51:21','2026-11-11 06:51:53',32,1,'2026-11-11 13:51:54',NULL,NULL,NULL,_binary ''),('3e1b0518-17e5-4fd2-b47a-ff7973b9fb5b','dev-ff7199bc-0ccc-4ed2',NULL,5,'MANUAL','PRERECORDED','vi','2026-11-11 06:53:39','2026-11-11 06:54:17',38,1,'2026-11-11 13:54:18',NULL,NULL,NULL,_binary ''),('4','dev-77b31190-21ac-4e12-b110-ee88992233aa',5,6,'GPS','PRERECORDED','en','2026-11-04 14:20:51','2026-11-04 14:21:51',60,1,'2026-11-04 14:34:51',NULL,NULL,NULL,_binary ''),('84372233-f4a6-4824-80de-ffa4ea57ef70','dev-ff7199bc-0ccc-4ed2',NULL,5,'MANUAL','PRERECORDED','vi','2026-11-11 06:52:02','2026-11-11 06:52:40',38,1,'2026-11-11 13:52:40',NULL,NULL,NULL,_binary ''),('ad6dad97-e70e-46c5-b345-836465a91bbc','dev-ff7199bc-0ccc-4ed2',NULL,7,'MANUAL','PRERECORDED','vi','2026-11-11 06:52:58','2026-11-11 06:53:29',31,1,'2026-11-11 13:53:30',NULL,NULL,NULL,_binary ''),('test-uuid-test1','web-client-test-1',NULL,1,'MANUAL','PRERECORDED','vi','2026-11-11 13:30:41',NULL,45,1,'2026-11-11 13:30:41',NULL,NULL,NULL,_binary '');
/*!40000 ALTER TABLE `playback_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poi_audios`
--

DROP TABLE IF EXISTS `poi_audios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poi_audios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `poi_id` bigint NOT NULL,
  `language_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(700) COLLATE utf8mb4_unicode_ci NOT NULL,
  `audio_url` varchar(600) COLLATE utf8mb4_unicode_ci NOT NULL,
  `format` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'mp3' COMMENT 'mp3, m4a, aac, wav',
  `duration_seconds` double NOT NULL,
  `file_size_bytes` bigint NOT NULL DEFAULT '0',
  `checksum_sha256` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_prerecorded` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'True = File thu âm thật; False = Sinh bằng TTS',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `content_type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size_bytes` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_poi_audio_lang` (`poi_id`,`language_code`),
  KEY `fk_poi_audio_lang` (`language_code`),
  CONSTRAINT `fk_poi_audio_lang` FOREIGN KEY (`language_code`) REFERENCES `languages` (`code`) ON DELETE CASCADE,
  CONSTRAINT `fk_poi_audio_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poi_audios`
--

LOCK TABLES `poi_audios` WRITE;
/*!40000 ALTER TABLE `poi_audios` DISABLE KEYS */;
INSERT INTO `poi_audios` VALUES (1,1,'vi','poi_1_vi.mp3','audio/poi_1_vi.mp3','https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg','mp3',46.7,746933,'1695a7a19d58f1f0fdf32c411be90d8f3e9c5fcd1e0cc7f743d4f3998d9fb24c',1,'2026-11-04 14:37:07','audio/mpeg',746933),(2,1,'en','poi_1_en.mp3','audio/poi_1_en.mp3','https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg','mp3',58,980000,'e4d909c290d0fb1ca068ffaddf22cbd0',1,'2026-11-04 14:37:07','audio/mpeg',0),(3,2,'vi','poi_2_vi.mp3','audio/poi_2_vi.mp3','https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg','mp3',37.5,600229,'db49ce004651b5ede3b542271eef6d1ad08c8849b033bff91b8eec7ec11fdac1',1,'2026-11-04 14:37:07','audio/mpeg',600229),(4,3,'vi','poi_3_vi.mp3','audio/poi_3_vi.mp3','https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg','mp3',33.6,537536,'5059ad850179e8e8df6ccf84dafc5a064b4720ad8b79c282b048a05d163c769d',1,'2026-11-04 14:37:07','audio/mpeg',537536),(5,4,'vi','poi_4_vi.mp3','audio/poi_4_vi.mp3','https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg','mp3',31.5,504518,'e0bb4f548cfe0b1544467be000b54023243515b74ec93d1ef8f91016676c84c6',1,'2026-11-04 14:37:07','audio/mpeg',504518),(6,6,'vi','poi_6_vi.mp3','audio/poi_6_vi.mp3','https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg','mp3',29.3,469410,'8f28737af4ae8c740d5d190d919a6e0e9187d611e390682833fbe112ed424816',1,'2026-11-04 14:37:07','audio/mpeg',469410),(7,7,'vi','poi_7_vi.mp3','audio/poi_7_vi.mp3','https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg','mp3',30.9,494905,'2e0e2cff66930de81aac8ef4b8e88ff092a4dcb0e173b6a0359548bcb7418374',1,'2026-11-04 14:37:07','audio/mpeg',494905),(9,5,'vi','poi_5_vi.mp3','audio/poi_5_vi.mp3','https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg','mp3',37.5,600647,'06bd6d9abe5673e181dccd00d79b15858eef5e9638eaf8de5ea4fc39f3690183',1,'2026-11-11 11:30:09','audio/mpeg',600647);
/*!40000 ALTER TABLE `poi_audios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poi_images`
--

DROP TABLE IF EXISTS `poi_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poi_images` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `poi_id` bigint NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(700) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(600) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `content_type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_image` bit(1) NOT NULL,
  `size_bytes` bigint NOT NULL,
  `sort_order` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_poi_images_poi` (`poi_id`,`order_index`),
  KEY `idx_poi_image_order` (`poi_id`,`sort_order`),
  CONSTRAINT `fk_poi_images_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poi_images`
--

LOCK TABLES `poi_images` WRITE;
/*!40000 ALTER TABLE `poi_images` DISABLE KEYS */;
INSERT INTO `poi_images` VALUES (1,1,'nharong-1.jpg','images/nharong-1.jpg','https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',1,1,'2026-11-04 14:37:06','image/jpeg',_binary '\0',0,0),(2,1,'nharong-2.jpg','images/nharong-2.jpg','https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',2,0,'2026-11-04 14:37:06','image/jpeg',_binary '\0',0,0),(3,2,'caumong-1.jpg','images/caumong-1.jpg','https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',1,1,'2026-11-04 14:37:06','image/jpeg',_binary '\0',0,0),(4,3,'khanhhoi-park.jpg','images/khanhhoi-park.jpg','https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',1,1,'2026-11-04 14:37:06','image/jpeg',_binary '\0',0,0),(5,4,'nhatho-vinhhoi.jpg','images/nhatho-vinhhoi.jpg','https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',1,1,'2026-11-04 14:37:06','image/jpeg',_binary '\0',0,0),(6,5,'dinh-vinhhoi.jpg','images/dinh-vinhhoi.jpg','https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80',1,1,'2026-11-04 14:37:06','image/jpeg',_binary '\0',0,0),(7,6,'pho-oc-vinhkhanh.jpg','images/pho-oc-vinhkhanh.jpg','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',1,1,'2026-11-04 14:37:06','image/jpeg',_binary '\0',0,0),(8,7,'cho-xomchieu.jpg','images/cho-xomchieu.jpg','https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',1,1,'2026-11-04 14:37:06','image/jpeg',_binary '\0',0,0);
/*!40000 ALTER TABLE `poi_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poi_translations`
--

DROP TABLE IF EXISTS `poi_translations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poi_translations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `poi_id` bigint NOT NULL,
  `language_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `narration_script` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `name` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tts_script` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_poi_lang` (`poi_id`,`language_code`),
  UNIQUE KEY `uk_poi_translation_lang` (`poi_id`,`language_code`),
  KEY `fk_poi_trans_lang` (`language_code`),
  CONSTRAINT `fk_poi_trans_lang` FOREIGN KEY (`language_code`) REFERENCES `languages` (`code`) ON DELETE CASCADE,
  CONSTRAINT `fk_poi_trans_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poi_translations`
--

LOCK TABLES `poi_translations` WRITE;
/*!40000 ALTER TABLE `poi_translations` DISABLE KEYS */;
INSERT INTO `poi_translations` VALUES (1,1,'vi','Bến Nhà Rồng - Di tích Lịch sử Khởi hành tìm đường cứu nước','Bến Nhà Rồng tọa lạc bên sông Sài Gòn, khởi công ngày 4 tháng 3 năm 1863 và hoàn thành năm 1864, từng là trụ sở của hãng vận tải Messageries Impériales, sau đổi thành Messageries Maritimes. Công trình nổi bật với mái ngói tráng men trang trí đôi rồng chầu mặt nguyệt. Nơi đây ghi dấu sự kiện ngày 3 tháng 6 năm 1911, Nguyễn Tất Thành lên tàu Amiral Latouche-Tréville; tàu rời bến ngày 5 tháng 6 năm 1911, mở đầu hành trình tìm đường cứu nước. Sau năm 1975, công trình trở thành chi nhánh Bảo tàng Hồ Chí Minh tại Thành phố Hồ Chí Minh.','Chào mừng quý khách đến với Bến Nhà Rồng. Nơi đây từng là thương cảng sầm uất bậc nhất Sài Gòn xưa. Điểm nổi bật là đôi rồng gốm uốn lượn trên nóc mái.','2026-11-04 14:37:06','2026-11-11 11:43:03','Bến Nhà Rồng - Di tích Lịch sử Khởi hành tìm đường cứu nước','Chào mừng quý khách đến với Bến Nhà Rồng, di tích lịch sử bên bờ sông Sài Gòn. Công trình được khởi công ngày 4 tháng 3 năm 1863 và hoàn thành vào năm 1864, nguyên là trụ sở của hãng vận tải Pháp Messageries Impériales, sau này là Messageries Maritimes. Điểm nhấn kiến trúc là mái ngói tráng men với đôi rồng uốn lượn chầu mặt nguyệt, biểu tượng gắn với tên gọi Nhà Rồng. Nơi đây đã đi vào lịch sử dân tộc khi ngày 3 tháng 6 năm 1911, người thanh niên Nguyễn Tất Thành bước lên tàu Amiral Latouche-Tréville; hai ngày sau, con tàu rời bến, khởi đầu hành trình tìm đường cứu nước. Sau năm 1975, công trình được chuyển thành chi nhánh Bảo tàng Hồ Chí Minh, lưu giữ nhiều hiện vật quý về cuộc đời và sự nghiệp của Người. Mời quý khách dành thời gian tham quan và cảm nhận không gian lịch sử đặc biệt này.'),(2,1,'en','Nha Rong Wharf - Ho Chi Minh Museum','Nha Rong Wharf stands on the Saigon River. Construction began on 4 March 1863 and was completed in 1864 as the headquarters of the French shipping company Messageries Impériales, later renamed Messageries Maritimes. Its roof is decorated with glazed terracotta dragons flanking a moon. On 3 June 1911, Nguyen Tat Thanh boarded the ship Amiral Latouche-Treville; the vessel left port two days later, beginning his journey to find a way to save the country. After 1975, the building became a branch of the Ho Chi Minh Museum in Ho Chi Minh City.','Welcome to Nha Rong Wharf, a historic landmark in District 4. Notice the French colonial architecture adorned with dragon statues on the roof.','2026-11-04 14:37:06','2026-11-11 11:43:08','Nha Rong Wharf - Ho Chi Minh Museum','Welcome to Nha Rong Wharf, a historic site on the bank of the Saigon River. Construction began on 4 March 1863 and was completed in 1864. The building served as the headquarters of the French shipping company Messageries Impériales, later known as Messageries Maritimes. Its most distinctive feature is the glazed terracotta roof with two dragons curving toward a moon, the image that gave the site its name. Nha Rong Wharf entered national history on 3 June 1911, when the young Nguyen Tat Thanh boarded the ship Amiral Latouche-Treville. The ship departed two days later, beginning his long journey to find a way to save the country. After 1975, the building became a branch of the Ho Chi Minh Museum, preserving many precious artifacts about his life and work. Please take your time to explore this special historic space.'),(3,2,'vi','Cầu Mống bắc qua Kênh Bến Nghé','Cầu Mống bắc qua kênh Bến Nghé, nối Quận 1 với Quận 4, được xây dựng năm 1882 bởi công ty của kỹ sư Gustave Eiffel. Cầu dài 128 mét, rộng 5,2 mét, kết cấu thép uốn vòm mềm mại, nguyên có tên Pont des Messageries Maritimes, thay thế cho một bến phà trước đó. Năm 2005, trong quá trình thi công hầm Thủ Thiêm, cây cầu được tháo dỡ và sau đó dựng lại thành cầu đi bộ. Ngày nay, Cầu Mống là điểm ngắm hoàng hôn và chụp ảnh quen thuộc của người dân và du khách.','Trước mắt bạn là Cầu Mống, một biểu tượng kiến trúc thép duyên dáng bắc qua kênh Bến Nghé nối liền hai bờ sông lịch sử.','2026-11-04 14:37:06','2026-11-11 11:43:08','Cầu Mống bắc qua Kênh Bến Nghé','Trước mắt quý khách là Cầu Mống, cây cầu thép duyên dáng bắc qua kênh Bến Nghé, nối liền Quận 1 và Quận 4. Cầu được xây dựng vào năm 1882 bởi công ty của kỹ sư Gustave Eiffel, dài 128 mét, rộng 5,2 mét, với kết cấu vòm thép thanh thoát. Ban đầu cầu mang tên Pont des Messageries Maritimes và thay thế cho một bến phà đưa khách qua kênh. Trải qua hơn một thế kỷ, cầu từng được tháo dỡ vào năm 2005 trong quá trình thi công hầm Thủ Thiêm, rồi được dựng lại thành cầu dành cho người đi bộ. Ngày nay, nơi đây là điểm dừng chân lý tưởng để ngắm hoàng hôn buông xuống trên kênh và ghi lại những khung hình đẹp của Sài Gòn.'),(4,2,'en','Mong Bridge - Century-old Pedestrian Bridge','Mong Bridge crosses Ben Nghe Canal, linking District 1 and District 4. It was built in 1882 by the company of engineer Gustave Eiffel, measures 128 meters long and 5.2 meters wide, and has a graceful steel arch structure. Originally named Pont des Messageries Maritimes, it replaced an earlier ferry crossing. In 2005, during construction of the Thu Thiem Tunnel, the bridge was dismantled and later rebuilt as a pedestrian bridge. Today it is a popular spot for sunset views and photography.','Before you is Mong Bridge, one of the oldest bridges in Ho Chi Minh City, offering breathtaking views of the canal and sunset.','2026-11-04 14:37:06','2026-11-11 11:43:08','Mong Bridge - Century-old Pedestrian Bridge','Before you is Mong Bridge, an elegant steel bridge spanning Ben Nghe Canal and connecting District 1 with District 4. It was built in 1882 by the company of engineer Gustave Eiffel. The bridge is 128 meters long and 5.2 meters wide, with a light and graceful steel arch. It was originally called Pont des Messageries Maritimes and replaced a ferry that once carried passengers across the canal. Over more than a century, the bridge witnessed many changes in the city. In 2005, it was dismantled during construction of the Thu Thiem Tunnel and later rebuilt as a pedestrian bridge. Today, Mong Bridge is an ideal place to watch the sunset over the canal and capture beautiful images of Saigon.'),(5,3,'vi','Công viên Khánh Hội & Khu thể thao Vân Đồn','Công viên Khánh Hội nằm ven đường Bến Vân Đồn, Quận 4, rộng khoảng 4,9 héc-ta và là công viên lớn nhất của quận. Khu đất từng được quy hoạch mở rộng lên 22,5 héc-ta vào năm 1985 nhưng phương án này không được thực hiện. Năm 2019, công viên được chỉnh trang với đài phun nước trên diện tích khoảng 4.000 mét vuông. Liền kề là Trung tâm thể thao Vân Đồn tại số 120-122 đường Khánh Hội, rộng 10.800 mét vuông, có ba bể bơi phục vụ nhu cầu luyện tập và giải trí của người dân.','Bạn đang ở khu vực Công viên Khánh Hội, không gian xanh mát và yên bình giữa lòng Quận 4 sôi động.','2026-11-04 14:37:06','2026-11-11 11:43:08','Công viên Khánh Hội & Khu thể thao Vân Đồn','Quý khách đang đứng tại Công viên Khánh Hội, khoảng không gian xanh rộng nhất của Quận 4 với diện tích gần 5 héc-ta, trải dài ven đường Bến Vân Đồn. Khu đất này từng có quy hoạch mở rộng lên 22,5 héc-ta vào năm 1985, nhưng phương án ấy không được triển khai. Năm 2019, công viên được chỉnh trang, bổ sung đài phun nước trên khuôn viên khoảng 4.000 mét vuông, tạo nên điểm nhấn cảnh quan cho khu vực. Phía sau công viên là Trung tâm thể thao Vân Đồn, tọa lạc tại số 120 đến 122 đường Khánh Hội, rộng 10.800 mét vuông với ba bể bơi. Đây là nơi người dân địa phương rèn luyện thể thao, đi bộ và thư giãn vào sáng sớm hoặc chiều muộn. Mời quý khách tản bộ và cảm nhận nhịp sống bình yên bên dòng kênh.'),(6,4,'vi','Giáo xứ Nhà thờ Vĩnh Hội','Nhà thờ Vĩnh Hội tọa lạc tại số 158 đường Bến Vân Đồn, Quận 4. Giáo xứ được thành lập năm 1875, có gốc rễ từ đợt di cư của giáo dân trong giai đoạn 1859-1862. Năm 1890, giáo xứ được sáp nhập vào giáo xứ Xóm Chiếu, rồi tái lập với tên Vĩnh Hội vào năm 1945. Nhà thờ nhận Đức Mẹ Mân Côi làm bổn mạng, là trung tâm sinh hoạt tín ngưỡng của cộng đồng Công giáo trong khu vực.','Chào mừng bạn đến với Nhà thờ Vĩnh Hội, một công trình kiến trúc tôn giáo trang nghiêm trên đường Bến Vân Đồn.','2026-11-04 14:37:06','2026-11-11 11:43:09','Giáo xứ Nhà thờ Vĩnh Hội','Quý khách đang đến với Nhà thờ Vĩnh Hội, một trong những giáo xứ lâu đời của vùng đất Quận 4 ngày nay. Nhà thờ tọa lạc tại số 158 đường Bến Vân Đồn. Giáo xứ được thành lập vào năm 1875, với gốc rễ gắn liền đợt di cư của giáo dân trong những năm 1859 đến 1862. Năm 1890, giáo xứ được sáp nhập vào giáo xứ Xóm Chiếu, sau đó được tái lập dưới tên Vĩnh Hội vào năm 1945. Đức Mẹ Mân Côi được chọn làm bổn mạng, và hình ảnh ấy gắn bó với đời sống đức tin của bao thế hệ giáo dân nơi đây. Ngôi nhà thờ hôm nay là trung tâm sinh hoạt tín ngưỡng, đồng thời là một phần ký ức của cộng đồng Công giáo trong khu vực. Mời quý khách giữ sự trang nghiêm khi tham quan.'),(7,5,'vi','Đình Vĩnh Hội - Di tích Kiến trúc Nghệ thuật','Đình Vĩnh Hội tọa lạc tại số 240/242 đường Bến Vân Đồn, Quận 4. Vùng đất Vĩnh Hội hình thành trong khoảng năm 1818-1836, và ngôi đình được dựng vào khoảng năm 1820. Kiến trúc hiện nay được trùng tu vào khoảng năm 1970. Đình còn lưu giữ sắc phong do vua Tự Đức ban năm 1895, là di tích kiến trúc nghệ thuật cấp thành phố, đồng thời là không gian sinh hoạt tín ngưỡng và gắn kết cộng đồng của cư dân địa phương.','Chào mừng quý khách đến với Đình thần Vĩnh Hội, nơi lưu giữ những giá trị tâm linh và văn hóa truyền thống của cư dân vùng sông nước.','2026-11-04 14:37:06','2026-11-11 11:43:09','Đình Vĩnh Hội - Di tích Kiến trúc Nghệ thuật','Trước mắt quý khách là Đình Vĩnh Hội, một di tích kiến trúc nghệ thuật cấp thành phố tại số 240 trên 242 đường Bến Vân Đồn. Vùng đất Vĩnh Hội được hình thành trong khoảng những năm 1818 đến 1836, và ngôi đình được dựng vào khoảng năm 1820 để làm nơi thờ tự, sinh hoạt của cư dân. Trải qua nhiều biến động, kiến trúc hiện nay của đình được trùng tu vào khoảng năm 1970. Đặc biệt, đình còn lưu giữ sắc phong do vua Tự Đức ban vào năm 1895, một chứng tích quý về lịch sử và tín ngưỡng của vùng đất này. Hằng năm, đình là nơi diễn ra các nghi lễ truyền thống, góp phần gìn giữ bản sắc văn hóa và gắn kết cộng đồng. Mời quý khách tham quan trong sự tôn trọng không gian linh thiêng.'),(8,6,'vi','Phố Ẩm thực Ốc Vĩnh Khánh - Sôi động về đêm','Phố ốc Vĩnh Khánh chạy dọc đường Vĩnh Khánh, đoạn từ Bến Vân Đồn đến Tôn Đản, dài khoảng một ki-lô-mét. Khu phố nổi tiếng với các quán ốc, hải sản và món nhậu từ những năm 1990. Cuối tháng 3 năm 2018, Quận 4 chính thức đưa nơi đây vào hoạt động như một tuyến phố ẩm thực ban đêm. Năm 2025, Vĩnh Khánh được tạp chí Time Out xếp hạng 10 trong danh sách những con phố thú vị nhất thế giới.','Chào mừng bạn đến với Phố ốc Vĩnh Khánh. Hãy cảm nhận không khí náo nhiệt và thưởng thức ẩm thực đường phố đặc sắc nơi đây.','2026-11-04 14:37:06','2026-11-11 11:43:09','Phố Ẩm thực Ốc Vĩnh Khánh - Sôi động về đêm','Chào mừng quý khách đến với phố ốc Vĩnh Khánh, tuyến phố ẩm thực nổi tiếng bậc nhất Quận 4. Con phố dài khoảng một ki-lô-mét, chạy từ đường Bến Vân Đồn đến đường Tôn Đản. Từ những năm 1990, các quán ốc và hải sản nơi đây đã dần tạo nên tiếng vang, thu hút thực khách khắp Sài Gòn. Cuối tháng 3 năm 2018, Quận 4 chính thức đưa Vĩnh Khánh vào hoạt động như một tuyến phố ẩm thực ban đêm, với hệ thống đèn chiếu sáng và không gian được chỉnh trang. Năm 2025, tạp chí Time Out xếp Vĩnh Khánh ở vị trí thứ 10 trong danh sách những con phố thú vị nhất thế giới. Đến đây, quý khách có thể thưởng thức ốc hương, ốc móng tay, sò, nghêu, cua, ghẹ và nhiều món hải sản hấp dẫn. Hãy chọn cho mình một quán yêu thích và tận hưởng không khí nhộn nhịp về đêm.'),(9,6,'en','Vinh Khanh Seafood & Snail Food Street','Vinh Khanh food street runs along Vinh Khanh Street from Ben Van Don to Ton Dan, about one kilometer long. The area became famous for its snail and seafood restaurants in the 1990s. In late March 2018, District 4 officially opened it as a night food street. In 2025, Time Out ranked Vinh Khanh 10th in its list of the world\'s coolest streets.','Welcome to Vinh Khanh Street, where lively outdoor dining and exquisite seafood flavors come together every evening.','2026-11-04 14:37:06','2026-11-11 11:43:09','Vinh Khanh Seafood & Snail Food Street','Welcome to Vinh Khanh snail street, the most famous food street in District 4. The street stretches about one kilometer from Ben Van Don to Ton Dan. Since the 1990s, the snail and seafood restaurants here have gradually built a reputation that draws diners from all over Saigon. In late March 2018, District 4 officially opened Vinh Khanh as a night food street, with better lighting and a redesigned public space. In 2025, Time Out ranked it 10th among the world\'s coolest streets. Here you can enjoy sea snails, scallops, clams, crab and many other seafood dishes. Pick a restaurant you like and soak up the lively atmosphere after dark.'),(10,7,'vi','Chợ Xóm Chiếu (Chợ 200 - Thiên đường ăn vặt)','Chợ Xóm Chiếu tọa lạc tại số 200 đường Xóm Chiếu, Quận 4, nên người dân quen gọi là Chợ 200. Tên gọi Xóm Chiếu bắt nguồn từ một xóm làm chiếu ven kinh Bến Nghé có từ thời Gia Long. Chợ hình thành qua nhiều thập niên, gắn với đời sống cư dân và nổi tiếng với các món ăn dân dã miền Nam như phá lấu bò, súp cua, ốc cay, mì hến và chè. Đây là địa chỉ quen thuộc của người địa phương và du khách muốn khám phá ẩm thực đường phố Sài Gòn.','Bạn vừa đến Chợ Xóm Chiếu. Hãy chuẩn bị bước vào thiên đường ẩm thực đường phố với vô số món ngon giá bình dân.','2026-11-04 14:37:06','2026-11-11 11:43:10','Chợ Xóm Chiếu (Chợ 200 - Thiên đường ăn vặt)','Quý khách đang đến với Chợ Xóm Chiếu, khu chợ dân sinh nổi tiếng của Quận 4, thường được gọi thân thương là Chợ 200. Tên gọi này bắt nguồn từ địa chỉ số 200 đường Xóm Chiếu. Còn cái tên Xóm Chiếu đã có từ lâu, gắn với một xóm làm chiếu ven kinh Bến Nghé từ thời Gia Long. Trải qua nhiều thập niên, chợ trở thành nơi mua bán, gặp gỡ và là điểm hẹn ẩm thực quen thuộc của người dân trong vùng. Đến đây, thực khách có thể tìm thấy phá lấu bò, súp cua, ốc cay, mì hến và những chén chè Nam Bộ ngọt mát. Không gian chợ tuy bình dị nhưng đầy ắp hương vị và nhịp sống Sài Gòn. Mời quý khách thong thả dạo quanh và chọn cho mình một món ăn yêu thích.'),(11,7,'en','Xom Chieu Market (Market 200 - Street Food Paradise)','Xom Chieu Market is located at 200 Xom Chieu Street, District 4, which is why locals call it Market 200. The name Xom Chieu comes from a mat-making hamlet beside Ben Nghe Canal dating back to the Gia Long era. The market took shape over many decades and is known for rustic southern dishes such as beef pha lau, crab soup, spicy snails, vermicelli with clams, and sweet soups. It is a familiar address for locals and visitors who want to explore Saigon street food.','Welcome to Xom Chieu Market, the street food capital of District 4. Follow the tempting aromas to discover Saigon authentic street dishes.','2026-11-04 14:37:06','2026-11-11 11:43:10','Xom Chieu Market (Market 200 - Street Food Paradise)','You are arriving at Xom Chieu Market, a famous neighborhood market in District 4, affectionately known as Market 200. The name comes from its address at 200 Xom Chieu Street. The name Xom Chieu itself is much older, linked to a hamlet of mat makers beside Ben Nghe Canal in the Gia Long era. Over many decades, the market has become a place for trading, meeting and enjoying food for people in the area. Here, diners can find beef pha lau, crab soup, spicy snails, vermicelli with clams and bowls of sweet southern che. The market is simple and down-to-earth, yet full of flavor and the everyday rhythm of Saigon. Please take your time to wander and choose a dish you like.'),(14,1,'zh-CN',NULL,'芽龙港位于西贡河畔，1863年3月4日动工，1864年落成，原为法国航运公司“帝国邮轮公司”（Messageries Impériales）的办事处，后改称“海运公司”（Messageries Maritimes）。建筑屋顶以琉璃瓦装饰双龙拱月图案。1911年6月3日，阮必成登上“阿米拉尔·拉图什-特雷维尔号”轮船；两天后轮船离港，开启他寻找救国道路的旅程。1975年后，这里成为胡志明博物馆在胡志明市的分馆。',NULL,'2026-11-11 11:43:07','2026-11-11 11:43:08','芽龙港 - 胡志明博物馆','欢迎来到芽龙港，这座位于西贡河畔的历史遗址。工程于1863年3月4日动工，1864年竣工，最初是法国航运公司“帝国邮轮公司”的办事处，后来改称“海运公司”。建筑最引人注目的是屋顶上的琉璃瓦双龙拱月装饰，芽龙港之名也由此而来。1911年6月3日，青年阮必成登上“阿米拉尔·拉图什-特雷维尔号”轮船；两天后，轮船离开港口，开始了他寻找救国道路的漫长旅程。1975年以后，这里成为胡志明博物馆的分馆，珍藏着许多关于胡志明生平与事业的文物。请您放慢脚步，感受这片特殊的历史空间。'),(15,1,'th',NULL,'ท่าเรือญารงตั้งอยู่ริมแม่น้ำไซ่ง่อน เริ่มก่อสร้างเมื่อวันที่ 4 มีนาคม ค.ศ. 1863 แล้วเสร็จในปี ค.ศ. 1864 เดิมเป็นสำนักงานใหญ่ของบริษัทเดินเรือฝรั่งเศส Messageries Impériales ซึ่งต่อมาเปลี่ยนชื่อเป็น Messageries Maritimes หลังคาประดับด้วยกระเบื้องเคลือบรูปมังกรสองตัวหันเข้าหาดวงจันทร์ วันที่ 3 มิถุนายน ค.ศ. 1911 เหงียน ต๊าด ถั่ญ ขึ้นเรือ Amiral Latouche-Tréville และเรือออกจากท่าในอีกสองวันถัดมา ซึ่งเป็นการเริ่มต้นเส้นทางไปแสวงหาหนทางกู้ชาติ หลังปี ค.ศ. 1975 สถานที่แห่งนี้กลายเป็นสาขาของพิพิธภัณฑ์โฮจิมินห์ประจำนครโฮจิมินห์',NULL,'2026-11-11 11:43:07','2026-11-11 11:43:08','ท่าเรือญารง - พิพิธภัณฑ์โฮจิมินห์','ยินดีต้อนรับสู่ท่าเรือญารง แหล่งประวัติศาสตร์ริมฝั่งแม่น้ำไซ่ง่อน การก่อสร้างเริ่มขึ้นเมื่อวันที่ 4 มีนาคม ค.ศ. 1863 และแล้วเสร็จในปี ค.ศ. 1864 เดิมที่นี่เป็นสำนักงานใหญ่ของบริษัทเดินเรือฝรั่งเศส Messageries Impériales ซึ่งต่อมาเปลี่ยนชื่อเป็น Messageries Maritimes จุดเด่นของอาคารคือหลังคากระเบื้องเคลือบที่ประดับด้วยมังกรสองตัวโค้งเข้าหาดวงจันทร์ ซึ่งเป็นที่มาของชื่อญารง ท่าเรือแห่งนี้จารึกไว้ในประวัติศาสตร์ชาติเมื่อวันที่ 3 มิถุนายน ค.ศ. 1911 เมื่อชายหนุ่มเหงียน ต๊าด ถั่ญ ขึ้นเรือ Amiral Latouche-Tréville และอีกสองวันต่อมาเรือก็ออกจากท่า เริ่มต้นการเดินทางอันยาวนานเพื่อแสวงหาหนทางกู้ชาติ หลังปี ค.ศ. 1975 อาคารแห่งนี้กลายเป็นสาขาของพิพิธภัณฑ์โฮจิมินห์และเก็บรักษาโบราณวัตถุล้ำค่ามากมายเกี่ยวกับชีวิตและการงานของท่าน โปรดใช้เวลาสำรวจพื้นที่ประวัติศาสตร์แห่งนี้ตามอัธยาศัย'),(16,1,'hi',NULL,'न्हा रोंग घाट साइगॉन नदी के किनारे स्थित है। इसका निर्माण 4 मार्च 1863 को शुरू हुआ और 1864 में पूरा हुआ। यह फ्रांसीसी शिपिंग कंपनी मेसाजरी इम्पीरियल का मुख्यालय था, जिसका बाद में नाम मेसाजरी मैरीटाइम रखा गया। इसकी छत पर चमकीली मिट्टी की बनी दो ड्रेगन और चंद्रमा की आकृतियाँ सजी हैं। 3 जून 1911 को युवा गुयेन तात थान ने अमीरल लातूश-त्रेविल जहाज पर सवारी की; दो दिन बाद जहाज बंदरगाह से रवाना हुआ और देश को बचाने का रास्ता खोजने की यात्रा शुरू हुई। 1975 के बाद यह भवन हो ची मिन्ह संग्रहालय की शहर शाखा बन गया।',NULL,'2026-11-11 11:43:07','2026-11-11 11:43:08','न्हा रोंग घाट - हो ची मिन्ह संग्रहालय','न्हा रोंग घाट में आपका स्वागत है, जो साइगॉन नदी के किनारे स्थित एक ऐतिहासिक स्थल है। इसका निर्माण 4 मार्च 1863 को शुरू हुआ और 1864 में पूरा हुआ। यह फ्रांसीसी शिपिंग कंपनी मेसाजरी इम्पीरियल का मुख्यालय था, जिसे बाद में मेसाजरी मैरीटाइम कहा गया। भवन की सबसे खास विशेषता उसकी चमकीली मिट्टी की छत है, जिस पर दो ड्रेगन चंद्रमा की ओर झुके हुए दिखाई देते हैं; इसी से इस स्थल का नाम न्हा रोंग पड़ा। 3 जून 1911 को युवा गुयेन तात थान ने अमीरल लातूश-त्रेविल जहाज पर कदम रखा। दो दिन बाद जहाज बंदरगाह से रवाना हुआ और देश को बचाने का रास्ता खोजने की लंबी यात्रा शुरू हुई। 1975 के बाद यह भवन हो ची मिन्ह संग्रहालय की शहर शाखा बन गया, जहाँ उनके जीवन और कार्य से जुड़ी कई बहुमूल्य वस्तुएँ सुरक्षित हैं। कृपया इस विशेष ऐतिहासिक स्थल को देखने के लिए समय निकालें।'),(17,1,'ko',NULL,'냐롱 부두는 사이공 강변에 자리한다. 1863년 3월 4일 착공해 1864년 완공되었으며, 프랑스 해운 회사 메사주리 앵페리알의 본사였다가 이후 메사주리 마리팀으로 이름이 바뀌었다. 지붕에는 유약을 입힌 기와로 두 마리 용이 달을 향해 있는 장식이 있다. 1911년 6월 3일 청년 응우옌 떳 타인이 아미랄 라투슈-트레빌호에 올랐고, 이틀 뒤 배가 출항하며 구국을 위한 길을 찾는 여정이 시작되었다. 1975년 이후 이 건물은 호찌민 박물관의 호찌민시 분관이 되었다.',NULL,'2026-11-11 11:43:07','2026-11-11 11:43:08','냐롱 부두 - 호찌민 박물관','사이공 강변의 역사 유적인 냐롱 부두에 오신 것을 환영합니다. 이 건물은 1863년 3월 4일 착공해 1864년에 완공되었습니다. 처음에는 프랑스 해운 회사 메사주리 앵페리알의 본사였고, 뒤에 메사주리 마리팀으로 이름이 바뀌었습니다. 가장 눈에 띄는 것은 두 마리 용이 달을 향해 굽은 모양을 한 유약 기와 지붕으로, 냐롱이라는 이름도 여기서 비롯되었습니다. 1911년 6월 3일 청년 응우옌 떳 타인이 아미랄 라투슈-트레빌호에 올랐고, 이틀 뒤 배가 출항하면서 조국을 구할 길을 찾는 긴 여정이 시작되었습니다. 1975년 이후 이곳은 호찌민 박물관의 호찌민시 분관이 되어 그의 생애와 업적을 보여 주는 귀중한 유물을 보관하고 있습니다. 잠시 시간을 내어 이 특별한 역사 공간을 둘러보시기 바랍니다.'),(18,1,'ja',NULL,'ニャロン埠頭はサイゴン川のほとりに位置する。1863年3月4日に着工し、1864年に完成した。当初はフランスの海運会社メサジュリー・アンペリアルの本社で、後にメサジュリー・マリティムと改称された。屋根には釉薬を施した瓦で二匹の龍が月を仰ぐ装飾が施されている。1911年6月3日、青年グエン・タット・タインはアミラル・ラトゥーシュ・トレヴィル号に乗り込み、2日後に船は港を出て救国への道を探す旅が始まった。1975年以降、この建物はホーチミン博物館のホーチミン市分館となった。',NULL,'2026-11-11 11:43:07','2026-11-11 11:43:08','ニャロン埠頭 - ホーチミン博物館','サイゴン川のほとりにある歴史的遺産、ニャロン埠頭へようこそ。この建物は1863年3月4日に着工し、1864年に完成しました。当初はフランスの海運会社メサジュリー・アンペリアルの本社で、後にメサジュリー・マリティムと改称されました。最も印象的なのは、二匹の龍が月を仰ぐ釉薬瓦の屋根で、ニャロンという名前もここに由来します。1911年6月3日、青年グエン・タット・タインはアミラル・ラトゥーシュ・トレヴィル号に乗り込みました。2日後に船は港を出航し、祖国を救う道を探す長い旅が始まりました。1975年以降、ここはホーチミン博物館のホーチミン市分館となり、彼の生涯と業績に関する貴重な資料を保存しています。どうぞゆっくりとこの特別な歴史空間をご覧ください。'),(19,2,'zh-CN',NULL,'蒙桥横跨边义运河，连接第一郡和第四郡。桥梁建于1882年，由古斯塔夫·埃菲尔工程师的公司承建，全长128米、宽5.2米，采用优雅的钢拱结构。它最初名为“邮轮公司桥”（Pont des Messageries Maritimes），取代了此前的渡口。2005年，在修建守添隧道期间，桥梁被拆除，后又重建为步行桥。如今，这里是观赏日落和拍照的热门地点。',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:08','蒙桥（Cầu Mống）- 百年人行桥','您眼前是蒙桥，一座横跨边义运河、连接第一郡与第四郡的优雅钢桥。它建于1882年，由古斯塔夫·埃菲尔工程师的公司承建，全长128米，宽5.2米，钢拱结构轻盈优美。大桥最初名为“邮轮公司桥”，取代了从前摆渡乘客的渡口。一个多世纪以来，这座桥见证了城市的许多变迁。2005年，在修建守添隧道期间，桥梁被拆除，后来又重建为步行桥。如今，蒙桥是欣赏运河日落、拍摄西贡美景的理想之地。'),(20,2,'th',NULL,'สะพานม้งข้ามคลองเบ๊นแง เชื่อมระหว่างเขต 1 และเขต 4 สร้างขึ้นในปี ค.ศ. 1882 โดยบริษัทของวิศวกรกุสตาฟ แอฟแฟล มีความยาว 128 เมตร กว้าง 5.2 เมตร โครงสร้างเหล็กรูปโค้งอันงดงาม เดิมมีชื่อว่า Pont des Messageries Maritimes และใช้แทนท่าเรือข้ามฟากเดิม ในปี ค.ศ. 2005 ระหว่างการก่อสร้างอุโมงค์ทู้เทียม สะพานถูกถอดออกแล้วสร้างใหม่เป็นสะพานสำหรับคนเดิน ปัจจุบันเป็นจุดชมพระอาทิตย์ตกและถ่ายภาพยอดนิยม',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:08','สะพานม้ง - สะพานเดินเท้าอายุนับศตวรรษ','เบื้องหน้าคุณคือสะพานม้ง สะพานเหล็กอันงดงามที่ข้ามคลองเบ๊นแง เชื่อมระหว่างเขต 1 กับเขต 4 สะพานสร้างขึ้นในปี ค.ศ. 1882 โดยบริษัทของวิศวกรกุสตาฟ แอฟแฟล มีความยาว 128 เมตร กว้าง 5.2 เมตร โครงสร้างเหล็กโค้งที่เบาและสง่างาม เดิมสะพานมีชื่อว่า Pont des Messageries Maritimes และทำหน้าที่แทนเรือข้ามฟากที่เคยพาผู้โดยสารข้ามคลอง ตลอดกว่าหนึ่งศตวรรษ สะพานแห่งนี้ได้เห็นการเปลี่ยนแปลงมากมายของเมือง ในปี ค.ศ. 2005 สะพานถูกถอดออกระหว่างการก่อสร้างอุโมงค์ทู้เทียม และต่อมาได้รับการสร้างขึ้นใหม่เป็นสะพานเดินเท้า ปัจจุบันสะพานม้งเป็นสถานที่เหมาะสำหรับชมพระอาทิตย์ตกเหนือคลองและเก็บภาพความงามของไซ่ง่อน'),(21,2,'hi',NULL,'मोंग ब्रिज बेन न्घे नहर के ऊपर बना है और जिला 1 को जिला 4 से जोड़ता है। इसे 1882 में इंजीनियर गुस्ताव एफिल की कंपनी ने बनाया था। पुल 128 मीटर लंबा और 5.2 मीटर चौड़ा है तथा इसकी स्टील मेहराबें बहुत सुंदर हैं। पहले इसका नाम पोंट दे मेसाजरी मैरीटाइम था और यह उस नौका-सेवा की जगह बना था जो लोगों को नहर पार कराती थी। 2005 में थू थिएम सुरंग के निर्माण के दौरान पुल को हटाया गया और बाद में इसे पैदल पुल के रूप में फिर से बनाया गया। आज यह सूर्यास्त देखने और तस्वीरें लेने की लोकप्रिय जगह है।',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:08','मोंग ब्रिज - सदी पुराना पैदल पुल','आपके सामने मोंग ब्रिज है, एक सुंदर स्टील पुल जो बेन न्घे नहर पर बना है और जिला 1 को जिला 4 से जोड़ता है। इसे 1882 में इंजीनियर गुस्ताव एफिल की कंपनी ने बनाया था। पुल 128 मीटर लंबा और 5.2 मीटर चौड़ा है, और इसकी स्टील मेहराबें हल्की व सुंदर हैं। पहले इसका नाम पोंट दे मेसाजरी मैरीटाइम था और यह उस नौका सेवा की जगह बना था जो लोगों को नहर के पार ले जाती थी। सौ साल से अधिक समय में इस पुल ने शहर के अनेक बदलाव देखे हैं। 2005 में थू थिएम सुरंग के निर्माण के दौरान इसे हटाया गया और बाद में पैदल पुल के रूप में फिर से बनाया गया। आज मोंग ब्रिज नहर पर सूर्यास्त देखने और साइगॉन की सुंदर तस्वीरें लेने के लिए एक आदर्श स्थान है।'),(22,2,'ko',NULL,'몽 다리는 벤응에 운하를 가로질러 1군과 4군을 연결한다. 1882년 엔지니어 구스타브 에펠의 회사가 건설했으며, 길이 128미터, 너비 5.2미터의 우아한 강철 아치 구조다. 원래 이름은 퐁 데 메사주리 마리팀이었고, 이전에 사람들을 운하 건너로 실어 나르던 나룻배를 대체했다. 2005년 투티엠 터널 공사 중 다리가 해체되었다가 이후 보행자 다리로 다시 세워졌다. 오늘날 이곳은 일몰을 감상하고 사진을 찍는 인기 명소다.',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:08','몽 다리 - 백년의 보행자 다리','여러분 앞에 있는 것은 벤응에 운하를 가로질러 1군과 4군을 잇는 우아한 강철 다리, 몽 다리입니다. 1882년 엔지니어 구스타브 에펠의 회사가 건설했으며, 길이 128미터, 너비 5.2미터의 가볍고 아름다운 강철 아치 구조를 갖추고 있습니다. 원래 이름은 퐁 데 메사주리 마리팀이었고, 사람들을 운하 건너편으로 실어 나르던 나룻배를 대신했습니다. 백 년이 넘는 세월 동안 이 다리는 도시의 많은 변화를 지켜보았습니다. 2005년 투티엠 터널 공사 중 해체되었다가 이후 보행자 다리로 다시 세워졌습니다. 오늘날 몽 다리는 운하 위로 지는 일몰을 감상하고 사이공의 아름다운 순간을 사진으로 남기기에 이상적인 장소입니다.'),(23,2,'ja',NULL,'モン橋はベンゲー運河に架かり、1区と4区を結んでいる。1882年に技術者ギュスターヴ・エッフェルの会社によって建設され、全長128メートル、幅5.2メートルの優雅な鋼鉄アーチ構造を持つ。もともとはポン・デ・メサジュリー・マリティムと呼ばれ、人々を運河の対岸へ運ぶ渡し船の代わりに架けられた。2005年、トゥティエム・トンネルの建設中に橋は解体され、その後歩道橋として再建された。現在は夕日を眺め、写真を撮る人気スポットになっている。',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:08','モン橋 - 百年の歩道橋','目の前に広がるのは、ベンゲー運河に架かり1区と4区を結ぶ優雅な鋼鉄の橋、モン橋です。1882年に技術者ギュスターヴ・エッフェルの会社によって建設され、全長128メートル、幅5.2メートル、軽やかで美しい鋼鉄アーチ構造を持っています。もともとはポン・デ・メサジュリー・マリティムと呼ばれ、人々を運河の対岸へ運んでいた渡し船の代わりに架けられました。一世紀以上にわたり、この橋は街の多くの変化を見守ってきました。2005年、トゥティエム・トンネルの建設中に解体され、その後歩道橋として再建されました。現在、モン橋は運河に沈む夕日を眺め、サイゴンの美しい風景を写真に収めるのに最適な場所です。'),(24,3,'en',NULL,'Khanh Hoi Park stretches along Ben Van Don Street in District 4. Covering about 4.9 hectares, it is the largest park in the district. In 1985 a plan was proposed to expand it to 22.5 hectares, but the plan was never carried out. In 2019 the park was renovated and a fountain was added on an area of about 4,000 square meters. Next to it is the Van Don Sports Center at 120-122 Khanh Hoi Street, covering 10,800 square meters with three swimming pools for local residents.','You are at Khanh Hoi Park, the largest green haven in District 4, offering peaceful open space and vibrant recreation.','2026-11-11 11:43:08','2026-11-11 11:48:34','Khanh Hoi Park & Van Don Sports Center','You are standing in Khanh Hoi Park, the largest green space in District 4, covering nearly five hectares along Ben Van Don Street. In 1985 there was a plan to expand the park to 22.5 hectares, but it was never implemented. In 2019 the park was renovated and a fountain was added on an area of about 4,000 square meters, creating a new landscape highlight for the neighborhood. Behind the park is the Van Don Sports Center at 120 to 122 Khanh Hoi Street, covering 10,800 square meters with three swimming pools. This is where local residents exercise, walk and relax in the early morning or late afternoon. Please take a stroll and enjoy the peaceful rhythm of life beside the canal.'),(25,3,'zh-CN',NULL,'庆会公园沿第四郡云屯街（Bến Vân Đồn）延伸，面积约4.9公顷，是第四郡最大的公园。1985年曾计划将公园扩建至22.5公顷，但该方案未能实施。2019年，公园进行整修，并在约4000平方米的区域内增设喷泉。公园旁是位于庆会街120-122号的云屯体育中心，占地10800平方米，设有三个游泳池，服务当地居民的锻炼与休闲需求。',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:08','庆会公园与云屯体育中心','您现在所在的位置是庆会公园，第四郡最大的绿色空间，面积近五公顷，沿云屯街延伸。1985年这里曾计划扩建至22.5公顷，但方案最终没有实施。2019年，公园经过整修，在约4000平方米的区域内增设了喷泉，为周边环境增添了新的景观亮点。公园后方是云屯体育中心，位于庆会街120至122号，占地10800平方米，拥有三个游泳池。每天清晨或傍晚，当地居民都会来这里锻炼、散步和放松。请随意走走，感受运河边宁静的生活节奏。'),(26,3,'th',NULL,'สวนสาธารณะคั้ญโห่ยทอดยาวเลียบถนนเบ๊นวันดอนในเขต 4 มีพื้นที่ประมาณ 4.9 เฮกตาร์ นับเป็นสวนสาธารณะที่ใหญ่ที่สุดของเขต ในปี ค.ศ. 1985 เคยมีแผนขยายสวนเป็น 22.5 เฮกตาร์ แต่ไม่ได้ดำเนินการ ในปี ค.ศ. 2019 สวนได้รับการปรับปรุงและเพิ่มน้ำพุในพื้นที่ประมาณ 4,000 ตารางเมตร ด้านข้างคือศูนย์กีฬาวันดอน เลขที่ 120-122 ถนนคั้ญโห่ย พื้นที่ 10,800 ตารางเมตร มีสระว่ายน้ำสามสระสำหรับประชาชนในพื้นที่',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:08','สวนสาธารณะคั้ญโห่ยและศูนย์กีฬาวันดอน','คุณกำลังยืนอยู่ในสวนสาธารณะคั้ญโห่ย พื้นที่สีเขียวที่ใหญ่ที่สุดของเขต 4 มีเนื้อที่เกือบห้าเฮกตาร์ทอดยาวเลียบถนนเบ๊นวันดอน ในปี ค.ศ. 1985 เคยมีแผนขยายสวนแห่งนี้เป็น 22.5 เฮกตาร์ แต่แผนดังกล่าวไม่ได้ถูกนำไปปฏิบัติ ในปี ค.ศ. 2019 สวนได้รับการปรับปรุงและเพิ่มน้ำพุในพื้นที่ประมาณ 4,000 ตารางเมตร สร้างจุดเด่นทางภูมิทัศน์ให้กับย่านนี้ ด้านหลังสวนเป็นศูนย์กีฬาวันดอน ตั้งอยู่เลขที่ 120 ถึง 122 ถนนคั้ญโห่ย พื้นที่ 10,800 ตารางเมตร พร้อมสระว่ายน้ำสามสระ นี่คือสถานที่ที่ชาวบ้านออกกำลังกาย เดินเล่น และพักผ่อนในตอนเช้าหรือตอนเย็น โปรดเดินเล่นและสัมผัสจังหวะชีวิตอันสงบเรียบง่ายริมคลองแห่งนี้'),(27,3,'hi',NULL,'खान्ह होई पार्क जिला 4 की बेन वान दोन सड़क के किनारे फैला है। लगभग 4.9 हेक्टेयर में फैला यह जिले का सबसे बड़ा पार्क है। 1985 में इसे 22.5 हेक्टेयर तक बढ़ाने की योजना बनी थी, लेकिन वह लागू नहीं हो सकी। 2019 में पार्क का नवीनीकरण किया गया और लगभग 4,000 वर्ग मीटर के क्षेत्र में फव्वारा जोड़ा गया। इसके पास खान्ह होई सड़क पर 120-122 नंबर पर वान दोन खेल केंद्र है, जो 10,800 वर्ग मीटर में फैला है और तीन स्विमिंग पूल के साथ स्थानीय लोगों की सेवा करता है।',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:08','खान्ह होई पार्क और वान दोन खेल केंद्र','आप खान्ह होई पार्क में खड़े हैं, जो जिला 4 का सबसे बड़ा हरा-भरा क्षेत्र है और बेन वान दोन सड़क के किनारे लगभग पाँच हेक्टेयर में फैला है। 1985 में इस पार्क को 22.5 हेक्टेयर तक बढ़ाने की योजना बनी थी, लेकिन उसे लागू नहीं किया गया। 2019 में पार्क का नवीनीकरण हुआ और लगभग 4,000 वर्ग मीटर के क्षेत्र में फव्वारा जोड़ा गया, जिससे आसपास की सुंदरता में नया आकर्षण जुड़ा। पार्क के पीछे खान्ह होई सड़क पर 120 से 122 नंबर पर वान दोन खेल केंद्र है, जो 10,800 वर्ग मीटर में फैला है और तीन स्विमिंग पूल रखता है। सुबह या शाम के समय स्थानीय लोग यहाँ व्यायाम करने, टहलने और आराम करने आते हैं। कृपया टहलते हुए नहर किनारे की शांत जीवन-लय का आनंद लें।'),(28,3,'ko',NULL,'칸호이 공원은 4군 벤반돈 거리를 따라 펼쳐져 있다. 약 4.9헥타르 규모로 4군에서 가장 큰 공원이다. 1985년에는 공원을 22.5헥타르로 확장하려는 계획이 있었지만 실행되지 않았다. 2019년 공원을 정비하면서 약 4,000제곱미터 규모의 분수를 새로 조성했다. 옆에는 칸호이 거리 120-122번지에 자리한 반돈 체육센터가 있으며, 10,800제곱미터 부지에 세 개의 수영장을 갖추고 주민들의 운동과 여가 공간으로 이용되고 있다.',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:09','칸호이 공원과 반돈 체육센터','지금 서 계신 곳은 4군에서 가장 큰 녹지 공간인 칸호이 공원입니다. 벤반돈 거리를 따라 약 5헥타르에 걸쳐 펼쳐져 있습니다. 1985년에는 이 공원을 22.5헥타르로 확장하려는 계획이 있었지만 실제로 시행되지는 않았습니다. 2019년 공원을 정비하면서 약 4,000제곱미터 규모의 분수를 조성해 주변 경관에 새로운 볼거리를 더했습니다. 공원 뒤편에는 칸호이 거리 120~122번지에 자리한 반돈 체육센터가 있으며, 10,800제곱미터 부지에 세 개의 수영장을 갖추고 있습니다. 이른 아침이나 늦은 오후에는 주민들이 이곳에서 운동하고 산책하며 쉬어 갑니다. 잠시 걸음을 늦추고 운하변의 평온한 생활 리듬을 느껴 보시기 바랍니다.'),(29,3,'ja',NULL,'カインホイ公園は4区のベンヴァンドン通り沿いに広がる。面積約4.9ヘクタールで、4区最大の公園である。1985年には22.5ヘクタールへ拡張する計画が立てられたが、実現しなかった。2019年には公園が整備され、約4,000平方メートルの区域に噴水が設けられた。隣接するカインホイ通り120〜122番地にはヴァンドン体育センターがあり、10,800平方メートルの敷地に3つのプールを備え、地域住民の運動や憩いの場となっている。',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:09','カインホイ公園とヴァンドン体育センター','今お立ちの場所は、4区最大の緑地、カインホイ公園です。ベンヴァンドン通り沿いに約5ヘクタールにわたって広がっています。1985年にはこの公園を22.5ヘクタールに拡張する計画が立てられましたが、実行には移されませんでした。2019年には公園が整備され、約4,000平方メートルの区域に噴水が設けられ、周辺の景観に新たな見どころが加わりました。公園の奥にはカインホイ通り120〜122番地のヴァンドン体育センターがあり、10,800平方メートルの敷地に3つのプールを備えています。早朝や夕方には、地元の人々がここで運動し、散歩し、くつろいでいます。どうぞゆっくり歩きながら、運河沿いの穏やかな暮らしのリズムを感じてください。'),(30,4,'en',NULL,'Vinh Hoi Church is located at 158 Ben Van Don Street, District 4. The parish was established in 1875, with roots in the migration of Catholic faithful between 1859 and 1862. In 1890 the parish was merged into Xom Chieu Parish, then re-established under the name Vinh Hoi in 1945. The church takes Our Lady of the Rosary as its patroness and serves as the spiritual center of the local Catholic community.','Welcome to Vinh Hoi Church, a solemn religious landmark situated along Ben Van Don street dating back to 1875.','2026-11-11 11:43:08','2026-11-11 11:48:34','Vinh Hoi Parish Church','You are arriving at Vinh Hoi Church, one of the oldest parishes in what is now District 4. The church stands at 158 Ben Van Don Street. The parish was established in 1875, with roots in the migration of Catholic faithful between 1859 and 1862. In 1890 the parish was merged into Xom Chieu Parish, and in 1945 it was re-established under the name Vinh Hoi. Our Lady of the Rosary was chosen as its patroness, and her image has accompanied generations of faithful here. The church today is the center of religious life and part of the collective memory of the Catholic community in this area. Please keep a respectful demeanor while visiting.'),(31,4,'zh-CN',NULL,'永汇教堂位于第四郡云屯街158号。教区成立于1875年，其根源可追溯至1859年至1862年间天主教徒的迁徙。1890年，教区并入召庙教区（Xóm Chiếu），1945年以“永汇”之名重新设立。教堂以玫瑰圣母为主保，是当地天主教徒的信仰生活中心。',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:09','永汇教区教堂','您现在来到永汇教堂，这里堪称今日第四郡最古老的教区之一。教堂坐落在云屯街158号。教区成立于1875年，其根源可追溯至1859年至1862年间天主教徒的迁徙。1890年，教区并入召庙教区，1945年又以“永汇”之名重新设立。教堂以玫瑰圣母为主保，圣母的形象陪伴着这里一代又一代的信徒。今天的教堂不仅是宗教生活的中心，也承载着当地天主教团体的共同记忆。参观时请保持庄重。'),(32,4,'th',NULL,'โบสถ์หวิญโห่ยตั้งอยู่เลขที่ 158 ถนนเบ๊นวันดอน เขต 4 เขตแพริชก่อตั้งขึ้นในปี ค.ศ. 1875 โดยมีรากฐานมาจากการอพยพของคริสตชนคาทอลิกในช่วงปี ค.ศ. 1859 ถึง 1862 ในปี ค.ศ. 1890 เขตแพริชถูกผนวกเข้ากับเขตแพริชซ๊อมเจี๊ยว และได้รับการสถาปนาขึ้นใหม่ในชื่อหวิญโห่ยเมื่อปี ค.ศ. 1945 โบสถ์มีพระแม่มารีผู้ศักดิ์สิทธิ์แห่งสายประคำเป็นองค์อุปถัมภ์ และเป็นศูนย์กลางชีวิตทางศาสนาของชุมชนคาทอลิกในพื้นที่',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:09','โบสถ์หวิญโห่ย','คุณกำลังมาถึงโบสถ์หวิญโห่ย หนึ่งในเขตแพริชที่เก่าแก่ที่สุดของพื้นที่ซึ่งปัจจุบันคือเขต 4 โบสถ์ตั้งอยู่เลขที่ 158 ถนนเบ๊นวันดอน เขตแพริชก่อตั้งขึ้นในปี ค.ศ. 1875 โดยมีรากฐานมาจากการอพยพของคริสตชนคาทอลิกในช่วงปี ค.ศ. 1859 ถึง 1862 ในปี ค.ศ. 1890 เขตแพริชถูกผนวกเข้ากับเขตแพริชซ๊อมเจี๊ยว และในปี ค.ศ. 1945 ได้รับการสถาปนาขึ้นใหม่ในชื่อหวิญโห่ย พระแม่มารีผู้ศักดิ์สิทธิ์แห่งสายประคำได้รับเลือกเป็นองค์อุปถัมภ์ และภาพของพระแม่ยังคงอยู่เคียงข้างชีวิตความเชื่อของคริสตชนหลายรุ่นที่นี่ โบสถ์ในปัจจุบันเป็นศูนย์กลางชีวิตทางศาสนาและเป็นส่วนหนึ่งของความทรงจำร่วมของชุมชนคาทอลิกในย่านนี้ โปรดแต่งกายและวางตัวให้เหมาะสมขณะเยี่ยมชม'),(33,4,'hi',NULL,'विन्ह होई चर्च जिला 4 की बेन वान दोन सड़क पर 158 नंबर पर स्थित है। पैरिश की स्थापना 1875 में हुई थी, जिसकी जड़ें 1859 से 1862 के बीच कैथोलिक भक्तों के प्रवास से जुड़ी हैं। 1890 में इस पैरिश को सोम चीउ पैरिश में मिला दिया गया और 1945 में विन्ह होई नाम से फिर से स्थापित किया गया। चर्च की संरक्षिका रोज़री की माता मरियम हैं, और यह स्थानीय कैथोलिक समुदाय का आध्यात्मिक केंद्र है।',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:09','विन्ह होई पैरिश चर्च','आप विन्ह होई चर्च पहुँच रहे हैं, जो आज के जिला 4 के सबसे पुराने पैरिशों में से एक है। चर्च बेन वान दोन सड़क पर 158 नंबर पर स्थित है। पैरिश की स्थापना 1875 में हुई थी, और इसकी जड़ें 1859 से 1862 के बीच कैथोलिक भक्तों के प्रवास से जुड़ी हैं। 1890 में इसे सोम चीउ पैरिश में मिला दिया गया, और 1945 में विन्ह होई नाम से फिर से स्थापित किया गया। रोज़री की माता मरियम को संरक्षिका चुना गया, और उनकी छवि यहाँ की पीढ़ियों की आस्था के साथ जुड़ी रही है। आज यह चर्च धार्मिक जीवन का केंद्र है और इस क्षेत्र के कैथोलिक समुदाय की सामूहिक स्मृति का हिस्सा है। कृपया दर्शन के समय गरिमा और सम्मान बनाए रखें।'),(34,4,'ko',NULL,'빈호이 성당은 4군 벤반돈 거리 158번지에 있다. 본당은 1875년에 설립되었으며, 그 뿌리는 1859년부터 1862년 사이 가톨릭 신자들의 이주로 거슬러 올라간다. 1890년에는 촘찌에우 본당에 합병되었고, 1945년 빈호이란 이름으로 다시 설립되었다. 성당은 묵주 기도의 성모 마리아를 수호성인으로 모시며, 지역 가톨릭 공동체의 신앙 생활 중심 역할을 하고 있다.',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:09','빈호이 성당','지금 도착하신 곳은 오늘날 4군에서 가장 오래된 본당 가운데 하나인 빈호이 성당입니다. 성당은 벤반돈 거리 158번지에 자리하고 있습니다. 본당은 1875년에 설립되었으며, 그 뿌리는 1859년부터 1862년 사이 가톨릭 신자들의 이주로 거슬러 올라갑니다. 1890년에는 촘찌에우 본당에 합병되었고, 1945년 빈호이란 이름으로 다시 설립되었습니다. 묵주 기도의 성모 마리아가 수호성인으로 선택되었고, 그 이미지는 이곳 여러 세대 신자들의 신앙 생활과 함께해 왔습니다. 오늘날 이 성당은 지역 가톨릭 공동체의 신앙 중심이자 공동의 기억의 일부입니다. 방문하실 때는 경건한 태도를 유지해 주시기 바랍니다.'),(35,4,'ja',NULL,'ヴィンホイ教会は4区のベンヴァンドン通り158番地にある。小教区は1875年に設立され、その起源は1859年から1862年にかけてのカトリック信者の移住にさかのぼる。1890年にはソムチエウ小教区に統合され、1945年にヴィンホイの名で再設立された。ロザリオの聖母を守護聖人とし、地域のカトリック共同体の信仰生活の中心となっている。',NULL,'2026-11-11 11:43:08','2026-11-11 11:43:09','ヴィンホイ教会','今、到着されたのは、現在の4区で最も古い小教区のひとつであるヴィンホイ教会です。教会はベンヴァンドン通り158番地にあります。小教区は1875年に設立され、その起源は1859年から1862年にかけてのカトリック信者の移住にさかのぼります。1890年にはソムチエウ小教区に統合され、1945年にヴィンホイの名で再設立されました。ロザリオの聖母が守護聖人として選ばれ、その姿はこの地の幾世代もの信者の信仰とともに歩んできました。現在の教会は地域のカトリック共同体の信仰生活の中心であり、共有の記憶の一部でもあります。見学の際は敬意ある態度でお過ごしください。'),(36,5,'en',NULL,'Vinh Hoi Communal House is located at 240/242 Ben Van Don Street, District 4. The land of Vinh Hoi took shape between about 1818 and 1836, and the communal house was built around 1820. Its current architecture dates from a restoration around 1970. The house preserves a royal edict issued by Emperor Tu Duc in 1895 and is recognized as a city-level architectural and artistic relic, as well as a center of worship and community life for local residents.','Welcome to Vinh Hoi Communal House, preserving spiritual traditions and architectural heritage of the historic riverside community.','2026-11-11 11:43:09','2026-11-11 11:48:34','Vinh Hoi Communal House - Architectural and Artistic Relic','Before you is Vinh Hoi Communal House, a city-level architectural and artistic relic at 240/242 Ben Van Don Street. The land of Vinh Hoi was settled between about 1818 and 1836, and the communal house was built around 1820 as a place of worship and community gathering. Through many changes, its present architecture dates from a restoration around 1970. Notably, the house still preserves a royal edict issued by Emperor Tu Duc in 1895, a precious testimony to the history and beliefs of this land. Every year, traditional ceremonies are held here, helping to preserve cultural identity and strengthen community bonds. Please visit with respect for this sacred space.'),(37,5,'zh-CN',NULL,'永汇亭位于第四郡云屯街240/242号。永汇一带的土地约在1818年至1836年间形成，亭庙约建于1820年。现存建筑约在1970年重修。亭内保存着1895年嗣德帝颁布的敕封，是市级建筑艺术遗迹，也是当地居民祭祀与社区活动的场所。',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:09','永汇亭 - 建筑艺术遗迹','您眼前是永汇亭，一处市级建筑艺术遗迹，位于云屯街240/242号。永汇这片土地约在1818年至1836年间形成聚落，亭庙约建于1820年，用作祭祀和社区活动的场所。历经变迁，现存建筑约在1970年重修。特别的是，亭内至今保存着1895年嗣德帝颁布的敕封，是这片土地历史与信仰的珍贵见证。每年这里都会举行传统仪式，延续文化认同并凝聚社区情感。参观时请尊重这一神圣空间。'),(38,5,'th',NULL,'ศาลเจ้าหวิญโห่ยตั้งอยู่เลขที่ 240/242 ถนนเบ๊นวันดอน เขต 4 พื้นที่หวิญโห่ยก่อตัวขึ้นราวปี ค.ศ. 1818 ถึง 1836 และศาลเจ้าสร้างขึ้นราวปี ค.ศ. 1820 สถาปัตยกรรมปัจจุบันได้รับการบูรณะราวปี ค.ศ. 1970 ศาลเจ้ายังคงเก็บรักษาพระราชโองการที่พระเจ้าตึดึ๊กพระราชทานในปี ค.ศ. 1895 เป็นโบราณสถานศิลปะสถาปัตยกรรมระดับเมือง และเป็นศูนย์กลางการประกอบพิธีกรรมและกิจกรรมชุมชนของชาวบ้านในพื้นที่',NULL,'2026-11-11 11:43:09','2026-11-11 11:44:21','ศาลเจ้าหวิญโห่ย - โบราณสถานศิลปะสถาปัตยกรรม','เบื้องหน้าคุณคือศาลเจ้าหวิญโห่ย โบราณสถานศิลปะสถาปัตยกรรมระดับเมือง ตั้งอยู่เลขที่ 240/242 ถนนเบ๊นวันดอน พื้นที่หวิญโห่ยเริ่มมีการตั้งถิ่นฐานราวปี ค.ศ. 1818 ถึง 1836 และศาลเจ้าสร้างขึ้นราวปี ค.ศ. 1820 เพื่อใช้เป็นสถานที่ประกอบพิธีกรรมและพบปะของชุมชน ผ่านการเปลี่ยนแปลงมากมาย สถาปัตยกรรมปัจจุบันได้รับการบูรณะราวปี ค.ศ. 1970 ที่สำคัญ ศาลเจ้ายังคงเก็บรักษาพระราชโองการที่พระเจ้าตึดึ๊กพระราชทานในปี ค.ศ. 1895 ซึ่งเป็นหลักฐานล้ำค่าด้านประวัติศาสตร์และความเชื่อของผู้คนในดินแดนแห่งนี้ ทุกปีศาลเจ้าจะมีพิธีกรรมตามประเพณี ซึ่งช่วยรักษาอัตลักษณ์ทางวัฒนธรรมและเสริมสร้างความผูกพันในชุมชน โปรดเยี่ยมชมด้วยความเคารพต่อสถานที่ศักดิ์สิทธิ์แห่งนี้'),(39,5,'hi',NULL,'विन्ह होई सामुदायिक मंदिर जिला 4 की बेन वान दोन सड़क पर 240/242 नंबर पर स्थित है। विन्ह होई क्षेत्र लगभग 1818 से 1836 के बीच बसा, और मंदिर लगभग 1820 में बनाया गया। इसकी वर्तमान वास्तुकला लगभग 1970 में हुए जीर्णोद्धार की है। मंदिर में 1895 में सम्राट तू दुक द्वारा दिया गया शाही फरमान सुरक्षित है। यह शहर-स्तरीय वास्तुकला एवं कला स्मारक है और स्थानीय लोगों की पूजा तथा सामुदायिक गतिविधियों का केंद्र है।',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:09','विन्ह होई सामुदायिक मंदिर - वास्तुकला एवं कला स्मारक','आपके सामने विन्ह होई सामुदायिक मंदिर है, जो बेन वान दोन सड़क पर 240/242 नंबर पर स्थित शहर-स्तरीय वास्तुकला एवं कला स्मारक है। विन्ह होई क्षेत्र में लगभग 1818 से 1836 के बीच बस्ती बसी, और मंदिर लगभग 1820 में पूजा तथा सामुदायिक आयोजनों के लिए बनाया गया। कई बदलावों के बीच इसकी वर्तमान वास्तुकला लगभग 1970 में हुए जीर्णोद्धार से है। विशेष रूप से, मंदिर में 1895 में सम्राट तू दुक द्वारा दिया गया शाही फरमान आज भी सुरक्षित है, जो इस भूमि के इतिहास और आस्था का बहुमूल्य प्रमाण है। हर साल यहाँ पारंपरिक अनुष्ठान होते हैं, जो सांस्कृतिक पहचान को बनाए रखने और समुदाय को जोड़ने में मदद करते हैं। कृपया इस पवित्र स्थान का सम्मान करते हुए दर्शन करें।'),(40,5,'ko',NULL,'빈호이 사당은 4군 벤반돈 거리 240/242번지에 있다. 빈호이 지역은 1818년에서 1836년 사이에 형성되었고, 사당은 1820년경 세워졌다. 현재의 건축은 1970년경 보수된 모습이다. 사당에는 1895년 뚜득 황제가 내린 칙명이 보존되어 있으며, 시급 건축 예술 유적으로 지정되어 주민들의 제사와 공동체 활동의 중심 역할을 하고 있다.',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:09','빈호이 사당 - 건축 예술 유적','여러분 앞에 있는 곳은 벤반돈 거리 240/242번지에 자리한 시급 건축 예술 유적, 빈호이 사당입니다. 빈호이 지역에는 1818년부터 1836년 사이에 마을이 형성되었고, 사당은 1820년경 제사와 공동체 모임을 위해 세워졌습니다. 여러 변화를 거치면서 현재의 건축은 1970년경 보수된 모습을 갖추게 되었습니다. 특히 사당에는 1895년 뚜득 황제가 내린 칙명이 지금도 보존되어 있어 이 땅의 역사와 신앙을 보여 주는 귀중한 증거가 됩니다. 해마다 이곳에서는 전통 의례가 열려 문화적 정체성을 지키고 공동체의 유대를 이어 가고 있습니다. 방문하실 때는 신성한 공간에 대한 존중을 지켜 주시기 바랍니다.'),(41,5,'ja',NULL,'ヴィンホイ亭は4区のベンヴァンドン通り240/242番地にある。ヴィンホイの土地は1818年から1836年ごろにかけて形成され、亭は1820年ごろ建てられた。現在の建築は1970年ごろの修復によるものである。亭には1895年に嗣徳帝が下した勅封が保存されており、市級の建築芸術遺跡として、地域住民の祭祀と共同体活動の中心となっている。',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:09','ヴィンホイ亭 - 建築芸術遺跡','目の前にあるのは、ベンヴァンドン通り240/242番地に位置する市級建築芸術遺跡、ヴィンホイ亭です。ヴィンホイの土地には1818年から1836年ごろにかけて集落が形成され、亭は1820年ごろ、祭祀と共同体の集いの場として建てられました。多くの変化を経て、現在の建築は1970年ごろの修復によるものです。特に、亭には1895年に嗣徳帝が下した勅封が今も保存されており、この土地の歴史と信仰を示す貴重な証です。毎年ここでは伝統的な儀式が行われ、文化的アイデンティティの継承と共同体の絆を深めています。見学の際は神聖な空間への敬意を忘れずにお過ごしください。'),(42,6,'zh-CN',NULL,'永庆美食街沿永庆街延伸，从云屯街到 Tôn Đản 街，全长约一公里。这里自20世纪90年代起以螺蛳和海鲜餐馆闻名。2018年3月底，第四郡正式将永庆街打造为夜间美食街。2025年，永庆街被《Time Out》杂志评为“全球最酷街道”第十名。',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:09','永庆海鲜螺蛳美食街','欢迎来到永庆螺蛳街，这是第四郡最著名的美食街。街道全长约一公里，从云屯街一直延伸到 Tôn Đản 街。自20世纪90年代以来，这里的螺蛳和海鲜餐馆逐渐声名远扬，吸引了西贡各地的食客。2018年3月底，第四郡正式将永庆街打造为夜间美食街，改善了照明并整修了公共空间。2025年，永庆街被《Time Out》杂志评为全球最酷街道第十名。在这里，您可以品尝海螺、扇贝、蛤蜊、螃蟹以及各种海鲜佳肴。请挑一家喜欢的餐馆，尽情享受夜晚热闹的气氛。'),(43,6,'th',NULL,'ถนนอาหารหวิญคั้ญทอดยาวไปตามถนนหวิญคั้ญ จากเบ๊นวันดอนถึงเตินด๋าน ยาวประมาณหนึ่งกิโลเมตร พื้นที่นี้เริ่มมีชื่อเสียงจากร้านหอยและอาหารทะเลตั้งแต่ทศวรรษ 1990 ปลายเดือนมีนาคม ค.ศ. 2018 เขต 4 ได้เปิดถนนหวิญคั้ญอย่างเป็นทางการในฐานะถนนอาหารกลางคืน ในปี ค.ศ. 2025 นิตยสาร Time Out จัดอันดับให้หวิญคั้ญอยู่อันดับ 10 ของถนนที่เจ๋งที่สุดในโลก',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:09','ถนนอาหารทะเลหอยหวิญคั้ญ','ยินดีต้อนรับสู่ถนนหอยหวิญคั้ญ ถนนอาหารที่โด่งดังที่สุดของเขต 4 ถนนสายนี้ยาวประมาณหนึ่งกิโลเมตร จากถนนเบ๊นวันดอนไปจนถึงถนนเตินด๋าน ตั้งแต่ทศวรรษ 1990 ร้านหอยและอาหารทะเลที่นี่ค่อย ๆ สร้างชื่อเสียงจนดึงดูดนักชิมจากทั่วไซ่ง่อน ปลายเดือนมีนาคม ค.ศ. 2018 เขต 4 ได้เปิดถนนหวิญคั้ญอย่างเป็นทางการในฐานะถนนอาหารกลางคืน พร้อมปรับปรุงระบบแสงสว่างและพื้นที่สาธารณะ ในปี ค.ศ. 2025 นิตยสาร Time Out จัดอันดับให้ที่นี่อยู่อันดับ 10 ของถนนที่เจ๋งที่สุดในโลก ที่นี่คุณสามารถลิ้มลองหอยทะเล หอยเชลล์ หอยแครง ปู และอาหารทะเลอีกมากมาย เลือกร้านที่ถูกใจแล้วเพลิดเพลินกับบรรยากาศคึกคักยามค่ำคืน'),(44,6,'hi',NULL,'विन्ह खान्ह फूड स्ट्रीट विन्ह खान्ह सड़क के साथ बेन वान दोन से तोन दान तक लगभग एक किलोमीटर लंबी है। यह क्षेत्र 1990 के दशक से घोंघे और समुद्री भोजन के रेस्टोरेंट के लिए प्रसिद्ध होने लगा। मार्च 2018 के अंत में जिला 4 ने इसे आधिकारिक रूप से रात्रि फूड स्ट्रीट के रूप में शुरू किया। 2025 में टाइम आउट पत्रिका ने विन्ह खान्ह को दुनिया की सबसे शानदार सड़कों की सूची में 10वाँ स्थान दिया।',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:09','विन्ह खान्ह सीफूड और घोंघा फूड स्ट्रीट','विन्ह खान्ह घोंघा स्ट्रीट में आपका स्वागत है, जो जिला 4 की सबसे प्रसिद्ध फूड स्ट्रीट है। यह सड़क बेन वान दोन से तोन दान तक लगभग एक किलोमीटर लंबी है। 1990 के दशक से यहाँ के घोंघे और समुद्री भोजन के रेस्टोरेंट धीरे-धीरे प्रसिद्ध होते गए और पूरे साइगॉन से खाने के शौकीनों को आकर्षित करने लगे। मार्च 2018 के अंत में जिला 4 ने विन्ह खान्ह को आधिकारिक रूप से रात्रि फूड स्ट्रीट के रूप में खोला, जिसमें रोशनी और सार्वजनिक स्थान को बेहतर बनाया गया। 2025 में टाइम आउट ने इसे दुनिया की सबसे शानदार सड़कों में 10वाँ स्थान दिया। यहाँ आप समुद्री घोंघे, सीप, क्लैम, केकड़ा और कई अन्य समुद्री व्यंजनों का आनंद ले सकते हैं। अपनी पसंद का रेस्टोरेंट चुनें और रात के जीवंत माहौल का आनंद लें।'),(45,6,'ko',NULL,'빈칸 먹자골목은 빈칸 거리를 따라 벤반돈에서 똔단까지 약 1킬로미터 이어진다. 이 지역은 1990년대부터 달팽이와 해산물 음식점으로 유명해졌다. 2018년 3월 말 4군은 이곳을 공식 야간 먹자골목으로 조성했다. 2025년에는 타임아웃이 선정한 ‘세계에서 가장 멋진 거리’ 10위에 올랐다.',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:10','빈칸 해산물·달팽이 먹자골목','4군에서 가장 유명한 먹자골목인 빈칸 달팽이 거리에 오신 것을 환영합니다. 이 거리는 벤반돈에서 똔단까지 약 1킬로미터 이어집니다. 1990년대부터 이곳의 달팽이와 해산물 음식점들이 차츰 이름을 얻으며 사이공 전역의 미식가들을 끌어들였습니다. 2018년 3월 말 4군은 조명과 공공 공간을 정비해 빈칸을 공식 야간 먹자골목으로 개장했습니다. 2025년에는 타임아웃이 선정한 ‘세계에서 가장 멋진 거리’ 10위에 올랐습니다. 이곳에서는 바다 달팽이, 가리비, 조개, 게를 비롯한 다양한 해산물 요리를 맛볼 수 있습니다. 마음에 드는 음식점을 골라 밤의 활기를 마음껏 즐겨 보세요.'),(46,6,'ja',NULL,'ヴィンカイン通りは、ベンヴァンドンからトンダンまで約1キロメートルにわたって続く。この一帯は1990年代から巻貝や海鮮のレストランで知られるようになった。2018年3月末、4区はここを公式のナイトグルメ街として開業した。2025年には、タイムアウト誌の「世界で最もクールな街路」第10位に選ばれた。',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:10','ヴィンカイン海鮮・巻貝グルメ街','4区で最も有名なグルメ街、ヴィンカイン巻貝通りへようこそ。この通りはベンヴァンドンからトンダンまで約1キロメートル続いています。1990年代から、ここでの巻貝や海鮮のレストランが少しずつ評判を呼び、サイゴン中から食通を惹きつけるようになりました。2018年3月末、4区は照明や公共空間を整備し、ヴィンカインを公式のナイトグルメ街としてオープンしました。2025年には、タイムアウト誌の「世界で最もクールな街路」第10位に選ばれています。ここでは海の巻貝、ホタテ、アサリ、カニなど、さまざまな海鮮料理を楽しめます。お気に入りの店を選んで、夜のにぎわいを存分に味わってください。'),(47,7,'zh-CN',NULL,'召庙市场位于第四郡召庙街200号，因此当地人习惯称之为“200市场”。召庙之名源于嘉隆时期边义运河畔的一个制席村落。市场历经数十年形成，以牛杂、蟹羹、辣螺、蚬米粉和南方糖水等朴实的南方小吃闻名，是当地居民和游客探索西贡街头美食的熟悉去处。',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:10','召庙市场（200市场 - 街头美食天堂）','您即将到达召庙市场，这是第四郡著名的民生市场，人们亲切地称它为“200市场”。这个名字来自它所在的召庙街200号。而“召庙”这一地名更为古老，可追溯至嘉隆时期边义运河畔的制席村落。几十年来，市场逐渐成为周边居民买卖、聚会和品尝美食的熟悉场所。在这里，食客可以找到牛杂、蟹羹、辣螺、蚬米粉以及一碗碗香甜的南方糖水。市场虽然朴素，却充满了西贡的味道与生活气息。请放慢脚步，逛一逛，挑一份自己喜欢的小吃。'),(48,7,'th',NULL,'ตลาดซ๊อมเจี๊ยวตั้งอยู่เลขที่ 200 ถนนซ๊อมเจี๊ยว เขต 4 ชาวบ้านจึงเรียกกันว่า “ตลาด 200” ชื่อซ๊อมเจี๊ยวมีที่มาจากหมู่บ้านทำเสื่อริมคลองเบ๊นแงในสมัยพระเจ้ายาลอง ตลาดแห่งนี้ก่อตัวขึ้นมาหลายทศวรรษและขึ้นชื่อเรื่องอาหารพื้นบ้านภาคใต้ เช่น พะโล้เครื่องในวัว ซุปปู หอยแครงเผ็ด ก๋วยเตี๋ยวหอย และของหวานหลากชนิด เป็นจุดหมายคุ้นเคยของคนในพื้นที่และนักท่องเที่ยวที่อยากสัมผัสอาหารข้างทางของไซ่ง่อน',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:10','ตลาดซ๊อมเจี๊ยว (ตลาด 200 - สวรรค์ของอาหารว่าง)','คุณกำลังจะถึงตลาดซ๊อมเจี๊ยว ตลาดชุมชนชื่อดังของเขต 4 ที่ชาวบ้านเรียกกันอย่างเอ็นดูว่า “ตลาด 200” ชื่อนี้มาจากที่ตั้งเลขที่ 200 ถนนซ๊อมเจี๊ยว ส่วนชื่อซ๊อมเจี๊ยวเองมีที่มาเก่าแก่กว่านั้น เกี่ยวข้องกับหมู่บ้านทำเสื่อริมคลองเบ๊นแงในสมัยพระเจ้ายาลอง ตลอดหลายทศวรรษ ตลาดแห่งนี้กลายเป็นสถานที่ซื้อขาย พบปะ และหาอาหารอร่อยของคนในย่านนี้ ที่นี่นักชิมจะได้พบกับพะโล้เครื่องในวัว ซุปปู หอยแครงเผ็ด ก๋วยเตี๋ยวหอย และของหวานภาคใต้รสหวานหอม ตลาดดูเรียบง่ายแต่เต็มไปด้วยรสชาติและจังหวะชีวิตของไซ่ง่อน โปรดเดินเล่นอย่างสบาย ๆ แล้วเลือกเมนูที่คุณชอบ'),(49,7,'hi',NULL,'सोम चीउ बाज़ार जिला 4 की सोम चीउ सड़क पर 200 नंबर पर स्थित है, इसलिए स्थानीय लोग इसे प्यार से “बाज़ार 200” कहते हैं। सोम चीउ नाम गियालोंग काल में बेन न्घे नहर के किनारे बसे चटाई बनाने वाले गाँव से आया है। बाज़ार कई दशकों में विकसित हुआ और दक्षिणी व्यंजनों के लिए प्रसिद्ध है, जैसे बीफ फा लाऊ, केकड़े का सूप, तीखे घोंघे, क्लैम वाली मी और मीठे दक्षिणी चे। यह स्थानीय लोगों और साइगॉन के स्ट्रीट फूड को जानने आए पर्यटकों के लिए एक जाना-पहचाना पता है।',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:10','सोम चीउ बाज़ार (बाज़ार 200 - स्ट्रीट फूड का स्वर्ग)','आप सोम चीउ बाज़ार पहुँच रहे हैं, जो जिला 4 का एक प्रसिद्ध पड़ोसी बाज़ार है और प्यार से “बाज़ार 200” कहलाता है। यह नाम इसके पते सोम चीउ सड़क 200 नंबर से आया है। सोम चीउ नाम खुद बहुत पुराना है और गियालोंग काल में बेन न्घे नहर के किनारे चटाई बनाने वाले गाँव से जुड़ा है। कई दशकों में यह बाज़ार आसपास के लोगों के खरीद-फरोख्त, मिलने-जुलने और स्वादिष्ट भोजन का जाना-पहचाना ठिकाना बन गया। यहाँ खाने के शौकीन बीफ फा लाऊ, केकड़े का सूप, तीखे घोंघे, क्लैम वाली मी और मीठे दक्षिणी चे का आनंद ले सकते हैं। बाज़ार सादा है, फिर भी साइगॉन के स्वाद और रोज़मर्रा की जीवन-लय से भरा हुआ है। कृपया आराम से घूमें और अपनी पसंद का व्यंजन चुनें।'),(50,7,'ko',NULL,'촘찌에우 시장은 4군 촘찌에우 거리 200번지에 있어 주민들은 정답게 ‘200 시장’이라고 부른다. 촘찌에우라는 이름은 자롱 시대 벤응에 운하변에 있던 돗자리를 만드는 마을에서 유래했다. 시장은 수십 년에 걸쳐 형성되었으며, 소고기 내장 조림인 파라우, 게 수프, 매운 달팽이, 조개 국수, 달콤한 남부식 체 같은 소박한 남부 음식으로 유명하다. 현지 주민과 사이공 길거리 음식을 찾는 여행객에게 익숙한 장소다.',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:10','촘찌에우 시장 (200 시장 - 길거리 음식의 천국)','지금 도착하신 곳은 4군의 유명한 동네 시장인 촘찌에우 시장입니다. 주민들은 정답게 ‘200 시장’이라고 부릅니다. 이 이름은 촘찌에우 거리 200번지라는 주소에서 비롯되었습니다. 촘찌에우라는 지명은 훨씬 오래전 자롱 시대 벤응에 운하변에서 돗자리를 만들던 마을과 이어져 있습니다. 수십 년 동안 이 시장은 주변 사람들이 물건을 사고 만나고 맛있는 음식을 즐기는 익숙한 장소가 되었습니다. 이곳에서는 소고기 내장 조림 파라우, 게 수프, 매운 달팽이, 조개 국수, 달콤한 남부식 체를 맛볼 수 있습니다. 시장은 소박하지만 사이공의 맛과 일상의 리듬이 가득합니다. 천천히 둘러보시며 마음에 드는 음식을 골라 보세요.'),(51,7,'ja',NULL,'ソムチエウ市場は4区のソムチエウ通り200番地にあり、地元の人々は親しみを込めて「200市場」と呼ぶ。ソムチエウという名は、ザーロン帝の時代にベンゲー運河沿いにあった筵づくりの村に由来する。市場は数十年かけて形成され、牛肉のモツ煮込みフォーラウ、カニのスープ、辛い巻貝、アサリ麺、南部の甘いチェなど、素朴な南部料理で知られている。地元住民やサイゴンの屋台グルメを求める旅行者にとって馴染みの場所だ。',NULL,'2026-11-11 11:43:09','2026-11-11 11:43:10','ソムチエウ市場（200市場 - 屋台グルメの天国）','まもなくソムチエウ市場に到着します。4区で有名な地域市場で、人々は親しみを込めて「200市場」と呼んでいます。この名はソムチエウ通り200番地という住所に由来します。ソムチエウという地名自体はもっと古く、ザーロン帝の時代にベンゲー運河沿いで筵を作っていた村にさかのぼります。数十年の間に、この市場は周辺の人々が買い物をし、集い、おいしい料理を楽しむ馴染みの場所となりました。ここでは牛肉のモツ煮込みフォーラウ、カニのスープ、辛い巻貝、アサリ麺、南部の甘いチェなどを味わえます。市場は素朴ですが、サイゴンの味と日常のリズムにあふれています。ゆっくり歩きながら、お気に入りの一品を選んでください。');
/*!40000 ALTER TABLE `poi_translations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pois`
--

DROP TABLE IF EXISTS `pois`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pois` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward_id` bigint DEFAULT NULL,
  `bus_stop_id` bigint DEFAULT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `radius_meters` int NOT NULL DEFAULT '50' COMMENT 'PRD P1: 20m - 300m, mặc định 50m',
  `priority` int NOT NULL DEFAULT '3' COMMENT '1 (thấp nhất) đến 5 (cao nhất)',
  `cooldown_minutes` int DEFAULT NULL COMMENT 'Ghi đè thời gian cooldown riêng (null = 30 phút mặc định)',
  `status` enum('ARCHIVED','DRAFT','PUBLISHED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` bigint NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `previously_published` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pois_code` (`code`),
  KEY `idx_pois_status` (`status`,`is_deleted`),
  KEY `idx_pois_ward` (`ward_id`),
  KEY `idx_pois_bus_stop` (`bus_stop_id`),
  KEY `idx_poi_status` (`status`),
  KEY `idx_poi_version` (`version`),
  KEY `idx_poi_ward` (`ward_id`),
  CONSTRAINT `fk_pois_bus_stop` FOREIGN KEY (`bus_stop_id`) REFERENCES `bus_stops` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pois_ward` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pois`
--

LOCK TABLES `pois` WRITE;
/*!40000 ALTER TABLE `pois` DISABLE KEYS */;
INSERT INTO `pois` VALUES (1,'POI_NHA_RONG','Bảo tàng Hồ Chí Minh - Bến Nhà Rồng',1,2,10.7683,106.7067,60,5,30,'PUBLISHED',9,0,'2026-11-04 14:37:06','2026-11-11 11:43:08',_binary '\0'),(2,'POI_CAU_MONG','Cầu Mống - Cây cầu bộ hành trăm tuổi',1,1,10.7695,106.7042,45,4,30,'PUBLISHED',16,0,'2026-11-04 14:37:06','2026-11-11 11:43:08',_binary '\0'),(3,'POI_CONG_VIEN_KHANH_HOI','Công viên Khánh Hội & Hồ bơi Vân Đồn',1,1,10.765,106.703,70,3,30,'PUBLISHED',23,0,'2026-11-04 14:37:06','2026-11-11 11:43:09',_binary '\0'),(4,'POI_NHA_THO_VINH_HOI','Nhà thờ Vĩnh Hội (Giáo xứ Vĩnh Hội)',2,3,10.7648,106.6998,50,3,30,'PUBLISHED',30,0,'2026-11-04 14:37:06','2026-11-11 11:43:09',_binary '\0'),(5,'POI_DINH_VINH_HOI','Đình Vĩnh Hội - Di tích Kiến trúc Nghệ thuật',2,3,10.7635,106.7012,45,3,30,'PUBLISHED',54,0,'2026-11-04 14:37:06','2026-11-11 13:43:45',_binary ''),(6,'POI_PHO_OC_VINH_KHANH','Phố Ẩm thực Ốc Vĩnh Khánh',2,3,10.7625,106.7015,80,4,30,'PUBLISHED',44,0,'2026-11-04 14:37:06','2026-11-11 11:43:10',_binary '\0'),(7,'POI_CHO_XOM_CHIEU','Chợ Xóm Chiếu - Thiên đường ẩm thực Chợ 200',3,4,10.7619,106.704,50,4,30,'PUBLISHED',51,0,'2026-11-04 14:37:06','2026-11-11 11:43:10',_binary '\0');
/*!40000 ALTER TABLE `pois` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qr_codes`
--

DROP TABLE IF EXISTS `qr_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qr_codes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `poi_id` bigint NOT NULL,
  `bus_stop_id` bigint DEFAULT NULL,
  `label` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên biển báo / Vị trí dán vật lý',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `scan_count` bigint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` bit(1) NOT NULL,
  `created_by` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `version` bigint NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_qrcodes_code` (`code`),
  KEY `idx_qrcodes_poi` (`poi_id`),
  KEY `idx_qrcodes_bus_stop` (`bus_stop_id`),
  KEY `idx_qr_poi` (`poi_id`),
  KEY `idx_qr_stop` (`bus_stop_id`),
  CONSTRAINT `fk_qrcodes_bus_stop` FOREIGN KEY (`bus_stop_id`) REFERENCES `bus_stops` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_qrcodes_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qr_codes`
--

LOCK TABLES `qr_codes` WRITE;
/*!40000 ALTER TABLE `qr_codes` DISABLE KEYS */;
INSERT INTO `qr_codes` VALUES (1,'NR1863BS',1,2,'Biển mã QR Trạm 02: Bến Nhà Rồng',1,128,'2026-11-04 14:37:07',_binary '',NULL,0,'2026-11-11 10:55:28'),(2,'CM1890BG',2,1,'Biển mã QR Trạm 01: Cầu Mống',1,85,'2026-11-04 14:37:07',_binary '',NULL,0,'2026-11-11 10:55:28'),(3,'VH1902CH',4,3,'Biển mã QR Trạm 03: Nhà thờ Vĩnh Hội',1,62,'2026-11-04 14:37:07',_binary '',NULL,0,'2026-11-11 10:55:28'),(4,'VK1990OC',6,3,'Biển mã QR Trạm 03: Phố Ốc Vĩnh Khánh',1,214,'2026-11-04 14:37:07',_binary '',NULL,0,'2026-11-11 10:55:28'),(5,'XC200FOO',7,4,'Biển mã QR Trạm 04: Chợ Xóm Chiếu (Chợ 200)',1,195,'2026-11-04 14:37:07',_binary '',NULL,0,'2026-11-11 10:55:28');
/*!40000 ALTER TABLE `qr_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `is_revoked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_refresh_token` (`token`),
  KEY `idx_refresh_user` (`user_id`),
  CONSTRAINT `fk_refresh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,4,'rt_live_token_dukhach_sample_99a8b7c6d5e4','Chrome on Windows 11 (Desktop PWA)','127.0.0.1','2026-12-04 14:37:56',0,'2026-11-04 14:34:50'),(2,5,'rt_live_token_johndoe_sample_11f2e3d4c5b6','Safari on iPhone 15 Pro (Mobile Web)','127.0.0.1','2026-12-04 14:37:56',0,'2026-11-04 14:34:50');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_settings_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'DATA_VERSION','54','Phiên bản dữ liệu toàn hệ thống phục vụ Delta Sync','2026-11-11 13:43:45'),(2,'GEOFENCE_RADIUS_DEFAULT','50','Bán kính kích hoạt Geofence mặc định (mét)','2026-11-04 14:30:06'),(3,'DEBOUNCE_SECONDS','3','Thời gian ở trong vùng liên tục trước khi kích hoạt (giây)','2026-11-04 14:30:06'),(4,'HYSTERESIS_FACTOR','1.2','Hệ số bán kính khi rời vùng kích hoạt','2026-11-04 14:30:06'),(5,'COOLDOWN_MINUTES','30','Thời gian tối thiểu không phát lặp cùng 1 POI (phút)','2026-11-04 14:30:06'),(6,'GPS_ACCURACY_THRESHOLD','50','Ngưỡng sai số GPS chấp nhận được (mét)','2026-11-04 14:30:06'),(7,'ANALYTICS_RECORD_MOVING_INTERVAL','10','Chu kỳ ghi nhận tọa độ khi di chuyển (giây)','2026-11-04 14:30:06'),(8,'ANALYTICS_RECORD_IDLE_INTERVAL','60','Chu kỳ ghi nhận tọa độ khi đứng yên (giây)','2026-11-04 14:30:06'),(9,'RAW_LOCATION_RETENTION_DAYS','90','Thời hạn lưu trữ dữ liệu tọa độ thô (ngày)','2026-11-04 14:30:06'),(10,'gps_accuracy_threshold_m','50','PRD P5 - discard GPS samples above this accuracy','2026-11-04 16:03:50'),(11,'gps_jump_speed_kmh','120','Discard impossible GPS jumps above this speed','2026-11-04 16:03:50'),(12,'audio_queue_capacity','3','PRD P6 - audio queue capacity','2026-11-04 16:03:50'),(13,'audio_queue_ttl_seconds','60','PRD P7 - queued item time-to-live','2026-11-04 16:03:50'),(14,'min_valid_listen_seconds','5','PRD P8 - minimum listened seconds for a valid play','2026-11-04 16:03:50'),(15,'location_interval_moving_seconds','10','PRD P9 - tracking interval while moving','2026-11-04 16:03:50'),(16,'location_interval_stationary_seconds','60','PRD P9 - tracking interval while stationary','2026-11-04 16:03:50'),(17,'playback_log_retention_months','12','Playback log retention per technical decision 13','2026-11-04 16:03:50'),(18,'approach_margin_m','30','FR-GEO-09 - approach geofence margin','2026-11-04 16:03:50'),(19,'default_language','vi','Base language; cannot be disabled','2026-11-04 16:03:50'),(20,'APPROACH_MARGIN_METERS','30','FR-GEO-09 - approach geofence margin','2026-11-05 12:18:04');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tour_pois`
--

DROP TABLE IF EXISTS `tour_pois`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tour_pois` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tour_id` bigint NOT NULL,
  `poi_id` bigint NOT NULL,
  `order_index` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tour_poi` (`tour_id`,`poi_id`),
  KEY `idx_tour_pois_order` (`tour_id`,`order_index`),
  KEY `idx_tour_poi_order` (`tour_id`,`order_index`),
  KEY `fk_tour_pois_poi` (`poi_id`),
  CONSTRAINT `fk_tour_pois_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_tour_pois_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tour_pois`
--

LOCK TABLES `tour_pois` WRITE;
/*!40000 ALTER TABLE `tour_pois` DISABLE KEYS */;
INSERT INTO `tour_pois` VALUES (1,1,1,1),(2,1,2,2),(3,1,3,3),(4,2,6,1),(5,2,7,2),(6,3,2,1),(7,3,5,2),(8,3,4,3);
/*!40000 ALTER TABLE `tour_pois` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tours`
--

DROP TABLE IF EXISTS `tours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tours` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(250) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover_image_url` varchar(600) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estimated_minutes` int NOT NULL DEFAULT '60',
  `status` enum('ARCHIVED','DRAFT','PUBLISHED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` bigint NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tours_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tours`
--

LOCK TABLES `tours` WRITE;
/*!40000 ALTER TABLE `tours` DISABLE KEYS */;
INSERT INTO `tours` VALUES (1,'TOUR_LICH_SU_Q4','Hành trình Di sản & Lịch sử Quận 4','Khám phá các dấu ấn lịch sử hào hùng gắn liền với Bến Nhà Rồng, Cầu Mống và các di tích thời kỳ khẩn hoang lập ấp.','https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',90,'PUBLISHED',1,0,'2026-11-04 14:34:50','2026-11-04 14:37:56'),(2,'TOUR_AM_THUC_Q4','Thiên đường Ẩm thực Đường phố Đêm','Trải nghiệm ẩm thực đêm sôi động nhất Sài Gòn với phố ốc Vĩnh Khánh và khu ẩm thực Chợ 200 Xóm Chiếu.','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',60,'PUBLISHED',1,0,'2026-11-04 14:34:50','2026-11-04 14:37:56'),(3,'TOUR_KIEN_TRUC_TON_GIAO','Dấu ấn Kiến trúc Cổ kính & Tôn giáo','Hành trình chiêm ngưỡng các thánh đường trăm tuổi và đình thần cổ kính ven dòng kênh Bến Nghé.','https://images.unsplash.com/photo-1548625361-195fe57876a4?auto=format&fit=crop&w=800&q=80',75,'PUBLISHED',1,0,'2026-11-04 14:34:50','2026-11-04 14:37:56');
/*!40000 ALTER TABLE `tours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tracking_sessions`
--

DROP TABLE IF EXISTS `tracking_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tracking_sessions` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  `total_points` int NOT NULL DEFAULT '0',
  `is_anonymized` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tracking_device` (`device_id`,`started_at`),
  KEY `idx_tracking_user` (`user_id`),
  KEY `idx_tracking_started` (`started_at`),
  CONSTRAINT `fk_tracking_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tracking_sessions`
--

LOCK TABLES `tracking_sessions` WRITE;
/*!40000 ALTER TABLE `tracking_sessions` DISABLE KEYS */;
INSERT INTO `tracking_sessions` VALUES ('1','dev-c8a41280-97bf-4e76-a200-fe7445441ca2',4,'2026-11-04 12:34:51','2026-11-04 14:34:51',5,1,'2026-11-10 22:31:37'),('2','dev-77b31190-21ac-4e12-b110-ee88992233aa',5,'2026-11-04 13:34:51','2026-11-04 14:34:51',4,1,'2026-11-10 22:31:37');
/*!40000 ALTER TABLE `tracking_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `translation_logs`
--

DROP TABLE IF EXISTS `translation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `translation_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `device_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `source_language` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_language` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `translated_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `audio_url` varchar(600) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Âm thanh đọc văn bản dịch',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trans_device` (`device_id`,`created_at`),
  KEY `idx_trans_user` (`user_id`),
  CONSTRAINT `fk_trans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `translation_logs`
--

LOCK TABLES `translation_logs` WRITE;
/*!40000 ALTER TABLE `translation_logs` DISABLE KEYS */;
INSERT INTO `translation_logs` VALUES (1,'dev-77b31190-21ac-4e12-b110-ee88992233aa',5,'en','vi','Hello, how much does this bowl of crab soup cost?','Xin chào, tô súp cua này giá bao nhiêu tiền?','audio/trans_1.mp3','2026-11-04 14:14:51'),(2,'dev-77b31190-21ac-4e12-b110-ee88992233aa',5,'vi','en','Dạ ba mươi ngàn một phần có trứng bắc thảo nha em!','It is thirty thousand VND per portion with century egg!','audio/trans_2.mp3','2026-11-04 14:15:51');
/*!40000 ALTER TABLE `translation_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `translations`
--

DROP TABLE IF EXISTS `translations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `translations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `guide_id` bigint DEFAULT NULL,
  `original_text` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_language` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_language` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `translated_text` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `translations`
--

LOCK TABLES `translations` WRITE;
/*!40000 ALTER TABLE `translations` DISABLE KEYS */;
/*!40000 ALTER TABLE `translations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `poi_id` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_poi_fav` (`user_id`,`poi_id`),
  KEY `idx_fav_user` (`user_id`),
  KEY `fk_fav_poi` (`poi_id`),
  CONSTRAINT `fk_fav_poi` FOREIGN KEY (`poi_id`) REFERENCES `pois` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
INSERT INTO `user_favorites` VALUES (1,4,1,'2026-11-04 14:34:50'),(2,4,6,'2026-11-04 14:34:50'),(3,4,7,'2026-11-04 14:34:50'),(4,5,1,'2026-11-04 14:34:50'),(5,5,2,'2026-11-04 14:34:50');
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_social_accounts`
--

DROP TABLE IF EXISTS `user_social_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_social_accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `provider` enum('APPLE','FACEBOOK','GOOGLE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_user_id` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Sub/ID định danh duy nhất từ Google/Apple/Facebook',
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(600) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_user` (`provider`,`provider_user_id`),
  KEY `idx_social_user` (`user_id`),
  CONSTRAINT `fk_social_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_social_accounts`
--

LOCK TABLES `user_social_accounts` WRITE;
/*!40000 ALTER TABLE `user_social_accounts` DISABLE KEYS */;
INSERT INTO `user_social_accounts` VALUES (1,4,'GOOGLE','google-oauth2-10829384756201928374','dukhach@gmail.com','https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80','2026-11-04 14:34:50'),(2,5,'GOOGLE','google-oauth2-99887766554433221100','john.doe@gmail.com','https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80','2026-11-04 14:34:50');
/*!40000 ALTER TABLE `user_social_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mật khẩu băm (null nếu đăng nhập thuần OAuth2 Google/Apple/Facebook)',
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','ANALYST','EDITOR','USER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(600) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `failed_attempts` int NOT NULL DEFAULT '0',
  `locked_until` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `active` bit(1) NOT NULL,
  `failed_login_attempts` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@travelguide.com','$2a$10$VR79tAkz9ScQ8qWGADDWxunQ.7cuMWSRuNQb9JoLjVRUYpBH69F6a','Quản trị viên Hệ thống','ADMIN','https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80','0901234567',1,0,NULL,1,'2026-11-04 14:34:50','2026-11-10 22:30:12',_binary '',0),(2,'editor@travelguide.com','$2a$10$VR79tAkz9ScQ8qWGADDWxunQ.7cuMWSRuNQb9JoLjVRUYpBH69F6a','Nguyễn Biên Tập','EDITOR','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80','0902345678',1,0,NULL,1,'2026-11-04 14:34:50','2026-11-10 22:30:12',_binary '',0),(3,'analyst@travelguide.com','$2a$10$VR79tAkz9ScQ8qWGADDWxunQ.7cuMWSRuNQb9JoLjVRUYpBH69F6a','Trần Thống Kê','ANALYST','https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80','0903456789',1,0,NULL,1,'2026-11-04 14:34:50','2026-11-10 22:30:12',_binary '',0),(4,'dukhach@gmail.com','$2a$10$wE99w/6e78z6tH0L9FwG2eeS84R9qFmYpYpGvTfG7E7/C6Z7Tq0Qy','Lê Du Khách','USER','https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80','0918889999',1,0,NULL,1,'2026-11-04 14:34:50','2026-11-10 22:26:10',_binary '',0),(5,'john.doe@gmail.com','$2a$10$wE99w/6e78z6tH0L9FwG2eeS84R9qFmYpYpGvTfG7E7/C6Z7Tq0Qy','John Doe (Visitor)','USER','https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80','0917778888',1,0,NULL,1,'2026-11-04 14:34:50','2026-11-10 22:26:10',_binary '',0),(6,'admin@example.com','$2a$10$oSkGAPgQbUMh/oRIGyB/ue9rMjF/JNgQyTZDl8treSVnUN/Gz4Wii','System Admin','ADMIN',NULL,NULL,0,0,NULL,1,'2026-11-04 16:03:51','2026-11-10 22:20:39',_binary '',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wards`
--

DROP TABLE IF EXISTS `wards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wards` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Thành phố Hồ Chí Minh',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wards_name` (`name`,`district`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wards`
--

LOCK TABLES `wards` WRITE;
/*!40000 ALTER TABLE `wards` DISABLE KEYS */;
INSERT INTO `wards` VALUES (1,'Khánh Hội','Quận 4','Thành phố Hồ Chí Minh','2026-11-04 14:30:06',''),(2,'Vĩnh Hội','Quận 4','Thành phố Hồ Chí Minh','2026-11-04 14:30:06',''),(3,'Xóm Chiếu','Quận 4','Thành phố Hồ Chí Minh','2026-11-04 14:30:06','');
/*!40000 ALTER TABLE `wards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'multilingual_travel_guide'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-11 17:18:52
