-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- 主機： db
-- 產生時間： 2021 年 10 月 06 日 03:17
-- 伺服器版本： 10.4.11-MariaDB-1:10.4.11+maria~bionic
-- PHP 版本： 7.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `on_duty`
--

-- --------------------------------------------------------

--
-- 資料表結構 `group_member`
--

CREATE TABLE `group_member` (
  `id` int(11) NOT NULL,
  `name` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `group_member`
--

INSERT INTO `group_member` (`id`, `name`) VALUES
(1, 'user1');
(2, 'user2'),
(3, 'user3'),
(4, 'user4'),
(5, 'user5'),

-- --------------------------------------------------------

--
-- 資料表結構 `onduty`
--

CREATE TABLE `onduty` (
  `onduty_date` date NOT NULL,
  `nameID` int(11) NOT NULL,
  `isMaintain` tinyint(1) NOT NULL DEFAULT 0,
  `maintain_afternoon` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `group_member`
--
ALTER TABLE `group_member`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

--
-- 資料表索引 `onduty`
--
ALTER TABLE `onduty`
  ADD PRIMARY KEY (`onduty_date`),
  ADD KEY `nameID` (`nameID`),
  ADD KEY `member_id` (`maintain_afternoon`);

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `onduty`
--
ALTER TABLE `onduty`
  ADD CONSTRAINT `afternoon_member_id` FOREIGN KEY (`nameID`) REFERENCES `group_member` (`id`),
  ADD CONSTRAINT `member_id` FOREIGN KEY (`maintain_afternoon`) REFERENCES `group_member` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
