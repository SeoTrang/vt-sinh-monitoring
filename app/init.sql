-- Khởi tạo Cơ sở dữ liệu và Bảng sinh viên
CREATE DATABASE IF NOT EXISTS qlsv_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qlsv_db;

CREATE TABLE IF NOT EXISTS sinhvien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    masv VARCHAR(50) NOT NULL UNIQUE,
    hoten VARCHAR(100) NOT NULL,
    lop VARCHAR(50) NOT NULL,
    diem DECIMAL(4, 2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu ban đầu
INSERT INTO sinhvien (masv, hoten, lop, diem) VALUES
('DTC241200007', 'Vàng Thị Sinh', 'CNTT-K23E', 9.5),
('DTC241200001', 'Nguyễn Văn An', 'CNTT-K23E', 8.5),
('DTC241200002', 'Trần Thị Mai', 'CNTT-K23A', 8.0),
('DTC241200003', 'Lê Hoàng Nam', 'CNTT-K23B', 7.5)
ON DUPLICATE KEY UPDATE masv=VALUES(masv);
