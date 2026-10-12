# HƯỚNG DẪN QUẢN TRỊ CSDL QUA PHPMYADMIN

---

## 1. THÔNG TIN TRUY CẬP
* **Đường dẫn Web:** [http://localhost:8080](http://localhost:8080) (hoặc `http://<IP_SERVER>:8080`)
* **Hệ thống Server MySQL:** `mysql_db` (hoặc `db`)
* **Tên đăng nhập (Username):** `root`
* **Mật khẩu (Password):** `RootPassword123!`

---

## 2. CÁC THAO TÁC CƠ BẢN

### 2.1. Xem Cơ sở Dữ liệu và Bảng Sinh viên
1. Sau khi đăng nhập thành công, nhìn vào thanh điều hướng bên trái.
2. Bấm chọn database **`qlsv_db`**.
3. Bấm vào bảng **`sinhvien`**.
4. Bạn sẽ thấy danh sách toàn bộ các trường thông tin:
   * `id`: Khóa chính tự tăng (INT, Primary Key).
   * `masv`: Mã số sinh viên (VARCHAR(50), Unique).
   * `hoten`: Họ và tên sinh viên (VARCHAR(100)).
   * `lop`: Lớp sinh hoạt (VARCHAR(50)).
   * `diem`: Điểm tổng kết (DECIMAL(4,2)).

### 2.2. Kiểm tra Đồng bộ Dữ liệu với Web App
* Khi bạn thêm, sửa hoặc xóa 1 sinh viên trên giao diện website [http://localhost](http://localhost), hãy quay lại trang phpMyAdmin và bấm nút **Browse (Duyệt)** trên bảng `sinhvien`.
* Dữ liệu mới sẽ hiển thị ngay lập tức, chứng minh Web App Node.js kết nối và ghi dữ liệu thành công vào MySQL.

### 2.3. Chạy truy vấn SQL trực tiếp
1. Bấm vào tab **SQL** ở thanh trên cùng.
2. Nhập câu lệnh truy vấn mẫu:
```sql
-- Lấy danh sách sinh viên có điểm từ 8.0 trở lên
SELECT * FROM sinhvien WHERE diem >= 8.0 ORDER BY diem DESC;
```
3. Bấm **Go (Thực hiện)** để xem kết quả.

### 2.4. Sao lưu (Export) & Khôi phục (Import) Dữ liệu
* **Sao lưu (Export):**
  1. Chọn database `qlsv_db` $\rightarrow$ Chọn tab **Export (Xuất)**.
  2. Để định dạng mặc định là **SQL** $\rightarrow$ Bấm **Export**. File `.sql` sẽ được tải về máy.
* **Khôi phục (Import):**
  1. Chọn tab **Import (Nhập)** $\rightarrow$ Chọn file SQL từ máy tính $\rightarrow$ Bấm **Import**.
