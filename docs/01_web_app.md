# HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG QUẢN LÝ SINH VIÊN

---

## 1. GIỚI THIỆU ỨNG DỤNG
* **Ngôn ngữ & Nền tảng:** Node.js (Express.js Framework)
* **Hệ quản trị CSDL:** MySQL 8.0 (kết nối qua thư viện `mysql2/promise`)
* **Reverse Proxy:** Nginx Alpine (Bảo vệ an toàn bằng Security Headers)
* **Giao diện:** Bootstrap 5, Responsive trên cả máy tính và điện thoại, hỗ trợ chuẩn tiếng Việt UTF-8.
* **Đường dẫn truy cập:** [http://localhost](http://localhost) (hoặc `http://<IP_SERVER>` trên máy chủ).

---

## 2. CÁC CHỨC NĂNG CHÍNH VÀ CÁCH THAO TÁC

### 2.1. Thêm Sinh viên Mới (Create)
1. Tại phần **"Thêm Sinh viên Mới"** ở cột bên trái:
   * **Mã sinh viên (MSSV):** Nhập mã sinh viên (Ví dụ: `DTC241200008`). *Lưu ý: Mã sinh viên là duy nhất trong hệ thống.*
   * **Họ và tên:** Nhập tên đầy đủ có dấu (Ví dụ: `Nguyễn Văn Bình`).
   * **Lớp học:** Nhập tên lớp (Ví dụ: `CNTT-K23E`).
   * **Điểm số:** Nhập điểm từ `0` đến `10` (Ví dụ: `8.5`).
2. Bấm nút **"Thêm sinh viên"**.
3. Thông báo màu xanh hiển thị xác nhận thêm thành công và sinh viên mới sẽ xuất hiện ngay trên đầu danh sách.

### 2.2. Xem Danh sách & Thống kê Tự động (Read)
* **Bảng thống kê nhanh:**
  * **Tổng số sinh viên:** Đếm tổng số bản ghi sinh viên hiện có.
  * **Điểm trung bình:** Tính điểm trung bình cộng của toàn bộ sinh viên.
  * **Điểm cao nhất:** Điểm số cao nhất hiện tại.
* **Tự động Xếp loại:**
  * Điểm $\ge 8.5$: Huy hiệu **Xuất sắc** (Xanh lá).
  * $8.0 \le$ Điểm $< 8.5$: Huy hiệu **Giỏi** (Xanh dương).
  * $6.5 \le$ Điểm $< 8.0$: Huy hiệu **Khá** (Xanh lơ).
  * $5.0 \le$ Điểm $< 6.5$: Huy hiệu **Trung bình** (Vàng).
  * Điểm $< 5.0$: Huy hiệu **Yếu** (Đỏ).

### 2.3. Tìm kiếm Sinh viên (Search)
* Tại ô tìm kiếm ở góc trên bảng danh sách:
  * Nhập tên sinh viên hoặc MSSV hoặc tên lớp.
  * Bấm nút kính lúp (hoặc ấn `Enter`).
  * Hệ thống sẽ lọc ra các sinh viên thỏa mãn điều kiện. Bấm nút `X` để xóa tìm kiếm và quay về danh sách đầy đủ.

### 2.4. Cập nhật Thông tin Sinh viên (Update)
1. Trong cột **"Thao tác"**, bấm vào biểu tượng chiếc bút màu vàng **Sửa**.
2. Form bên trái sẽ chuyển sang chế độ **"Cập nhật Sinh viên"** và tự động điền thông tin cũ của sinh viên đó.
3. Thay đổi Họ tên, Lớp hoặc Điểm số rồi bấm **"Lưu thay đổi"**.

### 2.5. Xóa Sinh viên (Delete)
1. Bấm vào biểu tượng thùng rác màu đỏ **Xóa** tại dòng sinh viên muốn xóa.
2. Trình duyệt hiển thị hộp thoại xác nhận: *"Bạn có chắc chắn muốn xóa sinh viên [Tên] không?"*.
3. Bấm **OK** để xóa.

---

## 3. KIỂM TRA SỨC KHỎE ỨNG DỤNG (HEALTH CHECK)
Ứng dụng cung cấp sẵn API kiểm tra trạng thái hoạt động:
* **URL:** `http://localhost/health`
* **Kết quả trả về:**
```json
{
  "status": "OK",
  "runtime": "Node.js",
  "timestamp": "2026-10-12T14:40:00.000Z"
}
```
