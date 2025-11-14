-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 14 Nov 2025 pada 05.23
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
(2, 'test2', 4, '/uploads/materials/1763087315242.pdf', '2025-11-14 02:28:35');

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
(5, 's004', 1, '2025-10-31', 'Cu', 1.0310, '/uploads/samples/1762144349290.png');

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
(5, 'ica', '$2b$10$UlNST17gbOPmPxLaf3txsOV8Up0OET.tNhZCyRgojN2wtcofaRe9S', '', '2025-11-13 07:51:32');

--
-- Indexes for dumped tables
--

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
-- AUTO_INCREMENT untuk tabel `materials`
--
ALTER TABLE `materials`
  MODIFY `material_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `samples`
--
ALTER TABLE `samples`
  MODIFY `sample_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

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
