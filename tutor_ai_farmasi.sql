-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 24 Nov 2025 pada 07.45
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tutor_ai_farmasi`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `chat_history`
--

CREATE TABLE `chat_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_id` bigint(20) DEFAULT NULL,
  `role` enum('user','assistant','system') DEFAULT NULL,
  `message` text NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `chat_history`
--

INSERT INTO `chat_history` (`id`, `user_id`, `session_id`, `role`, `message`, `timestamp`) VALUES
(1, 5, NULL, 'user', 'apa itu titrasi?', '2025-11-20 15:49:40'),
(2, 5, NULL, 'user', 'apa itu titrasi?', '2025-11-20 15:49:53'),
(3, 6, NULL, 'user', 'apa itu titrasi?', '2025-11-20 16:11:17'),
(4, 6, NULL, 'user', 'apa itu titrasi?', '2025-11-20 16:11:38'),
(5, 6, NULL, 'user', 'apa itu titrasi?', '2025-11-20 16:13:23'),
(6, 6, NULL, 'user', 'apa itu titrasi?', '2025-11-20 16:16:23'),
(7, 6, NULL, 'assistant', 'Titrasi, juga dikenal sebagai titrimetri atau analisis volumetri, adalah metode analisis kimia kuantitatif yang digunakan untuk menentukan konsentrasi suatu analit (zat yang akan dianalisis). Proses ini melibatkan penambahan larutan standar (titran) yang konsentrasi dan volumenya diketahui ke dalam larutan analit hingga terjadi reaksi stoikiometri sempurna, yang disebut titik ekuivalen. Volume titran yang dibutuhkan untuk bereaksi sempurna dengan analit disebut volume titrasi, dan dari informasi ini, kita dapat menghitung konsentrasi analit.', '2025-11-20 16:16:23'),
(8, 6, NULL, 'user', 'Titrasi dikatakan selesai ketika selesai terjadi reaksi stoikiometri, atau disebut dengan', '2025-11-20 16:27:05'),
(9, 6, NULL, 'assistant', 'Titrasi dikatakan selesai ketika tercapai titik ekivalen, yaitu titik di mana reaksi penetralan telah sempurna secara stoikiometri. Pada titik ini, titrasi harus dihentikan dan biasanya ditandai dengan perubahan warna indikator.', '2025-11-20 16:27:05'),
(10, 6, NULL, 'user', 'apa itu titrasi?', '2025-11-20 16:53:28'),
(11, 6, NULL, 'assistant', 'Titrasi, juga dikenal sebagai titrimetri atau analisis volumetri, adalah metode analisis kimia kuantitatif yang digunakan untuk menentukan konsentrasi suatu analit (zat yang akan dianalisis). Proses ini melibatkan penambahan larutan standar (titran) yang konsentrasi dan volumenya diketahui ke dalam larutan analit hingga terjadi reaksi stoikiometri sempurna, yang disebut titik ekuivalen. Volume titran yang dibutuhkan untuk mencapai titik ekuivalen ini digunakan untuk menghitung konsentrasi analit.', '2025-11-20 16:53:28'),
(12, 6, NULL, 'user', 'tadi aku nanya apa ya?', '2025-11-20 16:53:37'),
(13, 6, NULL, 'assistant', 'Maaf, saya tidak dapat mengingat pertanyaan Anda sebelumnya. Jika Anda memiliki pertanyaan tentang titrasi langsung, titrasi kembali, titrasi bebas air, atau topik lain yang tercakup dalam materi ini, silakan berikan pertanyaan Anda. Saya akan berusaha menjawabnya berdasarkan informasi yang tersedia.', '2025-11-20 16:53:37'),
(14, 5, 1763649855331, '', 'Session baru dibuat', '2025-11-20 21:44:15'),
(15, 5, NULL, 'user', '1763649855331', '2025-11-20 21:44:26'),
(16, 5, NULL, 'assistant', '1763649855331', '2025-11-20 21:44:26'),
(17, 5, 1763650355290, '', 'Session baru dibuat', '2025-11-20 21:52:35'),
(18, 5, NULL, 'user', '1763650355290', '2025-11-20 21:53:14'),
(19, 5, NULL, 'assistant', '1763650355290', '2025-11-20 21:53:14'),
(20, 5, 1763650994687, '', 'Session baru dibuat', '2025-11-20 22:03:14'),
(21, 5, NULL, 'user', '1763650994687', '2025-11-20 22:03:34'),
(22, 5, NULL, 'assistant', '1763650994687', '2025-11-20 22:03:34'),
(23, 5, 1763698004066, '', 'Session baru dibuat', '2025-11-21 11:06:44'),
(24, 5, 1763698558493, '', 'Session baru dibuat', '2025-11-21 11:15:58'),
(25, 5, NULL, 'user', '1763698558493', '2025-11-21 11:16:06'),
(26, 5, NULL, 'assistant', '1763698558493', '2025-11-21 11:16:06'),
(27, 5, 1763701105240, '', 'Session baru dibuat', '2025-11-21 11:58:25'),
(28, 5, 1763701197205, '', 'Session baru dibuat', '2025-11-21 11:59:57'),
(29, 5, 1763701305103, '', 'Session baru dibuat', '2025-11-21 12:01:45'),
(30, 5, 1763701436793, '', 'Session baru dibuat', '2025-11-21 12:03:56'),
(31, 5, 1763702084044, '', 'Session baru dibuat', '2025-11-21 12:14:44'),
(32, 5, 1763702084044, 'user', 'apa itu titrasi?', '2025-11-21 12:14:48'),
(33, 5, 1763702084044, 'assistant', 'Titrasi, atau juga dikenal sebagai titrimetri dan analisis volumetri, adalah metode analisis kimia kuantitatif yang digunakan untuk menentukan konsentrasi suatu analit (zat yang akan dianalisis). Proses ini melibatkan penambahan larutan standar (titran) yang konsentrasi dan volumenya diketahui ke dalam analit hingga terjadi reaksi stoikiometri sempurna, yang disebut titik ekuivalen. Volume titran yang diperlukan untuk mencapai titik ekuivalen ini digunakan untuk menghitung konsentrasi analit.\n\nKata \"titrasi\" sendiri berasal dari bahasa Perancis \"titrer\", yang merujuk pada penentuan proporsi emas atau perak dalam koin atau logam mulia lainnya.', '2025-11-21 12:14:48'),
(34, 5, 1763702113317, '', 'Session baru dibuat', '2025-11-21 12:15:13'),
(35, 5, 1763702113317, 'user', 'apa itu titrasi?', '2025-11-21 12:17:05'),
(36, 5, 1763702113317, 'assistant', 'Titrasi, juga dikenal sebagai titrimetri atau analisis volumetri, adalah metode analisis kimia kuantitatif yang digunakan untuk menentukan konsentrasi suatu analit (zat yang akan dianalisis). Proses ini melibatkan penambahan titran (larutan standar dengan konsentrasi yang diketahui) ke dalam analit sampai reaksi stoikiometri sempurna tercapai, yang disebut sebagai titik ekuivalen. Volume titran yang digunakan untuk mencapai titik ekuivalen ini kemudian digunakan untuk menghitung konsentrasi analit.', '2025-11-21 12:17:05'),
(37, 5, 1763702708056, '', 'Session baru dibuat', '2025-11-21 12:25:08'),
(38, 5, 1763702708056, 'user', 'apa itu titrasi?', '2025-11-21 12:25:16'),
(39, 5, 1763702708056, 'assistant', 'Titrasi, juga dikenal sebagai titrimetri atau analisis volumetri, adalah metode analisis kimia kuantitatif yang digunakan untuk menentukan konsentrasi suatu analit (zat yang akan dianalisis).\n\nDalam proses titrasi, suatu reagen yang disebut titran (larutan standar dengan konsentrasi yang diketahui) direaksikan dengan analit (larutan yang konsentrasinya ingin ditentukan) hingga terjadi reaksi stoikiometri yang sempurna, yang disebut titik ekuivalen. Volume titran yang dibutuhkan untuk mencapai titik ekuivalen ini kemudian digunakan untuk menghitung konsentrasi analit.', '2025-11-21 12:25:16'),
(40, 5, 1763702708056, 'user', 'Dalam titrasi, titran ditempatkan dalam wadah/ alat gelas  kimia apa?', '2025-11-21 12:26:04'),
(41, 5, 1763702708056, 'assistant', 'Larutan titran biasanya ditempatkan di dalam buret selama proses titrasi. Buret memungkinkan penambahan titran secara perlahan dan terkontrol ke dalam larutan analit.', '2025-11-21 12:26:04'),
(42, 5, 1763703123777, '', 'Session baru dibuat', '2025-11-21 12:32:03'),
(43, 5, 1763703123777, 'user', 'apa itu titrasi?', '2025-11-21 12:32:11'),
(44, 5, 1763703123777, 'assistant', 'Titrasi, yang juga dikenal sebagai titrimetri atau analisis volumetri, adalah metode analisis kimia kuantitatif yang digunakan untuk menentukan konsentrasi suatu analit (zat yang akan dianalisis). Dalam proses ini, sebuah reagen yang disebut titran, dengan konsentrasi dan volume yang diketahui, direaksikan dengan analit hingga mencapai titik stoikiometri sempurna atau titik ekuivalen. Volume titran yang dibutuhkan untuk bereaksi sempurna dengan analit disebut volume titrasi, dan dari data ini, konsentrasi analit dapat ditentukan.', '2025-11-21 12:32:11'),
(45, 5, 1763703123777, 'user', 'Dalam titrasi, titran ditempatkan dalam wadah/ alat gelas  kimia apa?', '2025-11-21 12:32:32'),
(46, 5, 1763703123777, 'assistant', 'Larutan titran biasanya ditempatkan di dalam buret selama proses titrasi. Buret memungkinkan penambahan titran secara perlahan dan terkontrol ke dalam larutan analit.', '2025-11-21 12:32:32'),
(47, 5, 1763703344301, '', 'Session baru dibuat', '2025-11-21 12:35:44'),
(48, 5, 1763703478938, '', 'Session baru dibuat', '2025-11-21 12:37:58'),
(49, 5, 1763703478938, 'user', 'apa itu titrasi?', '2025-11-21 12:38:06'),
(50, 5, 1763649855331, 'user', 'apa itu titrasi?', '2025-11-21 12:39:55'),
(51, 5, 1763649855331, 'assistant', 'Titrasi, juga dikenal sebagai titrimetri atau analisis volumetri, adalah metode analisis kimia kuantitatif yang digunakan untuk menentukan konsentrasi suatu analit (zat yang akan dianalisis). Proses ini dilakukan dengan mereaksikan analit dengan reagen yang disebut titran, yang memiliki konsentrasi dan volume yang diketahui, hingga mencapai titik ekuivalen. Volume titran yang digunakan untuk bereaksi sempurna dengan analit disebut volume titrasi.', '2025-11-21 12:39:55'),
(52, 6, 1763704144238, '', 'Session baru dibuat', '2025-11-21 12:49:04'),
(53, 6, 1763704144238, 'user', '8. Indikator apa yang digunakan dalam titrasi metode Mohr? ', '2025-11-21 12:49:17'),
(54, 6, 1763704144238, 'assistant', 'Dalam titrasi metode Mohr, indikator yang digunakan adalah kalium kromat (CrO₄²⁻). Indikator ini akan bereaksi dengan ion perak (Ag⁺) membentuk endapan merah bata dari perak kromat (Ag₂CrO₄), yang menandakan titik akhir titrasi.', '2025-11-21 12:49:17'),
(55, 6, 1763704171947, '', 'Session baru dibuat', '2025-11-21 12:49:31'),
(56, 6, 1763704171947, 'user', 'Pada titrasi iodometri, iodium diubah menjadi apa melalui reaksi apa ?', '2025-11-21 12:49:44'),
(57, 6, 1763704171947, 'assistant', 'Dalam titrasi iodometri, iodium akan direduksi menjadi iodida melalui reaksi reduksi-oksidasi (redoks).', '2025-11-21 12:49:44'),
(58, 6, 1763704171947, 'user', 'Pada titrasi redoks, nilai senyawa yang memiliki potensial reduksi yang lebih tinggi dari senyawa lainnya, memiliki peran sebagai agen', '2025-11-21 12:50:55'),
(59, 6, 1763704171947, 'assistant', 'Dalam titrasi redoks, senyawa yang memiliki potensial reduksi lebih tinggi berperan sebagai agen pengoksidasi kuat karena cenderung lebih mudah menerima elektron dari senyawa lain yang memiliki potensial reduksi lebih rendah.', '2025-11-21 12:50:55'),
(60, 6, 1763704794272, 'system', 'Session baru dibuat', '2025-11-21 12:59:54'),
(61, 6, 1763704794272, 'user', 'Pada titrasi pengendapan, nilai KSP yang rendah menandakan senyawa tersebut', '2025-11-21 13:00:04'),
(62, 6, 1763704794272, 'assistant', 'Pada titrasi pengendapan, nilai Ksp yang rendah menandakan bahwa senyawa tersebut mudah mengendap atau sukar larut.', '2025-11-21 13:00:04'),
(63, 6, 1763704794272, 'user', 'Pada titrasi redoks, nilai senyawa yang memiliki potensial reduksi yang lebih tinggi dari senyawa lainnya, memiliki peran sebagai agen', '2025-11-21 13:00:31'),
(64, 6, 1763704794272, 'assistant', 'Senyawa dengan potensial reduksi yang lebih tinggi dalam titrasi redoks berperan sebagai agen pengoksidasi kuat, karena cenderung lebih mudah menerima elektron dari senyawa lain yang memiliki potensial reduksi lebih rendah.', '2025-11-21 13:00:31'),
(65, 6, 1763705304241, 'system', 'Session baru dibuat', '2025-11-21 13:08:24'),
(66, 6, 1763705304241, 'user', 'Apa standar primer atau larutan baku yang digunakan dalam standarisasi NaOH?', '2025-11-21 13:08:39'),
(67, 6, 1763705304241, 'assistant', 'Standar primer yang umum digunakan dalam standarisasi NaOH adalah kalium biftalat (KHP). KHP mudah didapatkan, stabil, memiliki kemurnian tinggi, dan tidak higroskopis, sehingga ideal untuk standarisasi larutan basa seperti NaOH.', '2025-11-21 13:08:39'),
(68, 6, 1763704144238, 'user', 'apa itu titrasi?', '2025-11-24 12:56:35'),
(69, 6, 1763704144238, 'assistant', 'Titrasi, juga dikenal sebagai titrimetri atau analisis volumetri, adalah metode analisis kimia kuantitatif yang digunakan untuk menentukan konsentrasi suatu analit (zat yang akan dianalisis). Proses ini melibatkan penambahan larutan standar (titran) yang konsentrasi dan volumenya diketahui ke dalam larutan analit sampai reaksi stoikiometri sempurna tercapai, yang disebut titik ekuivalen. Volume titran yang digunakan untuk bereaksi sempurna dengan analit disebut volume titrasi.', '2025-11-24 12:56:35'),
(70, 6, 1763705304241, 'user', 'apa itu titrasi?', '2025-11-24 12:56:57'),
(71, 6, 1763705304241, 'assistant', 'Titrasi, juga dikenal sebagai titrimetri atau analisis volumetri, adalah metode analisis kimia kuantitatif di laboratorium untuk menentukan konsentrasi suatu analit (zat yang akan dianalisis). Proses ini melibatkan reaksi antara analit dengan reagen yang disebut titran, yang merupakan larutan standar dengan konsentrasi dan volume yang diketahui. Volume titran yang bereaksi dengan analit disebut volume titrasi.', '2025-11-24 12:56:57'),
(72, 6, 1763964212722, 'system', 'Session baru dibuat', '2025-11-24 13:03:32'),
(73, 6, 1763964212722, 'user', 'apa itu titrasi?', '2025-11-24 13:03:42'),
(74, 6, 1763964212722, 'assistant', 'Titrasi, juga dikenal sebagai titrimetri atau analisis volumetri, adalah metode analisis kimia kuantitatif yang digunakan untuk menentukan konsentrasi suatu analit (zat yang akan dianalisis). Proses ini melibatkan penambahan larutan standar (titran) yang konsentrasi dan volumenya diketahui ke dalam larutan analit hingga terjadi reaksi stoikiometri sempurna, yang disebut titik ekuivalen. Volume titran yang digunakan untuk bereaksi sempurna dengan analit disebut volume titrasi.\n\nSecara sederhana, titrasi adalah cara untuk mencari tahu berapa banyak zat tertentu yang ada dalam suatu larutan dengan mereaksikannya dengan zat lain yang sudah diketahui konsentrasinya.', '2025-11-24 13:03:42'),
(75, 6, 1763964673542, 'system', 'Session baru dibuat', '2025-11-24 13:11:13'),
(76, 6, 1763964673542, 'user', 'Apa standar primer atau larutan baku yang digunakan dalam standarisasi NaOH?', '2025-11-24 13:11:38'),
(77, 6, 1763964673542, 'assistant', 'Standar primer yang umum digunakan dalam standarisasi larutan NaOH (natrium hidroksida) adalah kalium biftalat atau kalium hidrogen ftalat (KHP). KHP mudah didapatkan, stabil, memiliki kemurnian tinggi, dan tidak higroskopis, sehingga ideal untuk standarisasi larutan basa seperti NaOH.', '2025-11-24 13:11:38'),
(78, 6, 1763964723035, 'system', 'Session baru dibuat', '2025-11-24 13:12:03'),
(79, 6, 1763964723035, 'user', 'Titrasi dikatakan selesai ketika selesai terjadi reaksi stoikiometri, atau disebut dengan', '2025-11-24 13:12:15'),
(80, 6, 1763964723035, 'assistant', 'Titrasi dikatakan selesai ketika reaksi penetralan tepat tercapai, yang disebut dengan titik ekivalen. Pada titik ini, titrasi harus dihentikan dan dapat diamati dari perubahan warna indikator.', '2025-11-24 13:12:15'),
(81, 6, 1763964723035, 'user', 'apa itu titrasi?', '2025-11-24 13:13:18'),
(82, 6, 1763964723035, 'assistant', 'Titrasi, juga dikenal sebagai titrimetri atau analisis volumetri, adalah metode analisis kimia kuantitatif di laboratorium. Metode ini digunakan untuk menentukan konsentrasi suatu analit (zat yang akan dianalisis) dengan mereaksikan dengan titran (larutan standar) yang konsentrasi dan volumenya diketahui secara tepat. Proses titrasi dilakukan hingga mencapai titik ekuivalen, yaitu titik di mana reaksi antara titran dan analit berlangsung sempurna.\n\nSecara umum, titrasi bertujuan untuk menentukan konsentrasi suatu zat dalam larutan secara akurat melalui reaksi kimia yang terukur dan terkendali.', '2025-11-24 13:13:18'),
(83, 6, 1763965245075, 'system', 'Session baru dibuat', '2025-11-24 13:20:45'),
(84, 6, 1763965247272, 'system', 'Session baru dibuat', '2025-11-24 13:20:47'),
(85, 6, 1763965253341, 'system', 'Session baru dibuat', '2025-11-24 13:20:53'),
(86, 6, 1763965253989, 'system', 'Session baru dibuat', '2025-11-24 13:20:53'),
(87, 6, 1763965254180, 'system', 'Session baru dibuat', '2025-11-24 13:20:54'),
(88, 6, 1763965254366, 'system', 'Session baru dibuat', '2025-11-24 13:20:54'),
(89, 6, 1763965254536, 'system', 'Session baru dibuat', '2025-11-24 13:20:54'),
(90, 6, 1763965254699, 'system', 'Session baru dibuat', '2025-11-24 13:20:54'),
(91, 6, 1763965254844, 'system', 'Session baru dibuat', '2025-11-24 13:20:54'),
(92, 6, 1763965255000, 'system', 'Session baru dibuat', '2025-11-24 13:20:55'),
(93, 6, 1763965255144, 'system', 'Session baru dibuat', '2025-11-24 13:20:55'),
(94, 6, 1763965255322, 'system', 'Session baru dibuat', '2025-11-24 13:20:55'),
(95, 6, 1763965266073, 'system', 'Session baru dibuat', '2025-11-24 13:21:06'),
(96, 6, 1763965328169, 'system', 'Session baru dibuat', '2025-11-24 13:22:08'),
(97, 6, 1763965328590, 'system', 'Session baru dibuat', '2025-11-24 13:22:08'),
(98, 6, 1763965328807, 'system', 'Session baru dibuat', '2025-11-24 13:22:08'),
(99, 6, 1763965336509, 'system', 'Session baru dibuat', '2025-11-24 13:22:16'),
(100, 6, 1763965336721, 'system', 'Session baru dibuat', '2025-11-24 13:22:16');

-- --------------------------------------------------------

--
-- Struktur dari tabel `materials`
--

CREATE TABLE `materials` (
  `material_id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `user_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `uploaded_At` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `materials`
--

INSERT INTO `materials` (`material_id`, `title`, `user_id`, `file_path`, `uploaded_At`) VALUES
(1, 'Test', 4, '/uploads/materials/1763087087299.pdf', '2025-11-14 02:24:47'),
(2, 'test2', 4, '/uploads/materials/1763087315242.pdf', '2025-11-14 02:28:35'),
(3, 'Contoh', 4, '/uploads/materials/1763098100338.pdf', '2025-11-14 05:28:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `samples`
--

CREATE TABLE `samples` (
  `sample_id` int(11) NOT NULL,
  `sample_name` varchar(100) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `test_date` date NOT NULL,
  `metal_type` enum('Fe','Cu') NOT NULL,
  `concentration` decimal(10,4) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `samples`
--

INSERT INTO `samples` (`sample_id`, `sample_name`, `user_id`, `test_date`, `metal_type`, `concentration`, `image_path`) VALUES
(2, 'S001', 1, '2025-11-03', 'Fe', 0.1230, '/uploads/samples/1762141380862.jpg'),
(3, 'S002', 1, '2025-11-03', 'Fe', 0.7180, '/uploads/samples/1762142130482.png'),
(4, 'S003', 1, '2025-11-02', 'Cu', 1.2680, '/uploads/samples/1762142246306.jpg'),
(5, 's004', 1, '2025-10-31', 'Cu', 1.0310, '/uploads/samples/1762144349290.png'),
(6, 'Sample', 1, '2025-11-14', 'Fe', 0.7010, '/uploads/samples/1763097990347.png'),
(7, 'lagi', 1, '2025-11-24', 'Fe', 0.3890, '/uploads/samples/1763962669291.jpg'),
(8, 'lagi', 1, '2025-11-24', 'Fe', 0.3890, '/uploads/samples/1763962716393.jpg'),
(9, 'lagi', 1, '2025-11-24', 'Fe', 0.3890, '/uploads/samples/1763962720530.jpg');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'admin', '$2b$10$CPezUV.B7N0ElI1csBfGBeCXJbjgGX3uLpmPOirHhVu4t8VWk.eA2', 'admin', '2025-11-03 03:42:44'),
(2, 'userpersatu', '$2b$10$8CWRlEMgZUhF38sXwIPhQev0AUjyouvLj9JThN8z8kBpsJPTK9o5S', '', '2025-11-10 03:11:26'),
(3, 'admin2', '$2b$10$CPezUV.B7N0ElI1csBfGBeCXJbjgGX3uLpmPOirHhVu4t8VWk.eA2', 'admin', '2025-11-13 07:39:18'),
(4, 'Aji', '$2b$10$O4CaoLoqLupWgyH0jc98RuV0vLwjnRoKuqky1BAGNSgYJ0EChqzTK', 'admin', '2025-11-13 07:44:00'),
(5, 'ica', '$2b$10$UlNST17gbOPmPxLaf3txsOV8Up0OET.tNhZCyRgojN2wtcofaRe9S', '', '2025-11-13 07:51:32'),
(6, 'aifa', '$2b$10$9oL6g2FHwAJuIeJ9wrws7OnAOMEaVDjRCOqHdqR3rtP3QokCq80aa', '', '2025-11-14 05:23:57');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `chat_history`
--
ALTER TABLE `chat_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user` (`user_id`);

--
-- Indeks untuk tabel `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`material_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `samples`
--
ALTER TABLE `samples`
  ADD PRIMARY KEY (`sample_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `chat_history`
--
ALTER TABLE `chat_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT untuk tabel `materials`
--
ALTER TABLE `materials`
  MODIFY `material_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `samples`
--
ALTER TABLE `samples`
  MODIFY `sample_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `chat_history`
--
ALTER TABLE `chat_history`
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `materials_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Ketidakleluasaan untuk tabel `samples`
--
ALTER TABLE `samples`
  ADD CONSTRAINT `samples_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
