# HỆ THỐNG QUẢN LÝ SINH VIÊN (DTC241200007)

## THÔNG TIN SINH VIÊN & ĐỀ TÀI
- **Họ và tên:** Vàng Thị Sinh
- **Mã số sinh viên (MSSV):** DTC241200007
- **Lớp:** CNTT-K23E
- **Đề tài:** Hệ thống Quản lý Sinh viên (CRUD Web + MySQL + Nginx Proxy + Monitoring Stack)

---

## KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống được đóng gói và vận hành hoàn toàn trên nền tảng Docker Compose, bao gồm các thành phần sau:

1. **Nginx Reverse Proxy (`nginx_proxy`)**: Đứng ở cổng `80`, tiếp nhận request từ người dùng, thực hiện Hardening Security Headers (`X-Frame-Options`, `X-XSS-Protection`, `X-Content-Type-Options`) và chuyển tiếp tới `web_app`.
2. **Web Application (`web_app`)**: Ứng dụng Web Node.js (Express.js) kết nối CSDL MySQL, xử lý các thao tác CRUD sinh viên.
3. **Database Server (`mysql_db`)**: Hệ quản trị CSDL MySQL 8.0, tự động khởi tạo database `qlsv_db` và bảng `sinhvien` qua script `init.sql`.
4. **Database Admin Tool (`phpmyadmin_tool`)**: Công cụ quản trị CSDL phpMyAdmin trực quan qua giao diện web tại cổng `8080`.
5. **Hệ thống giám sát (Monitoring Stack)**:
   - **cAdvisor (`cadvisor_collector`)**: Thu thập số liệu hiệu năng tài nguyên container (CPU, RAM, Network, Disk) tại cổng `8082`.
   - **Prometheus (`prometheus_monitoring`)**: Thu thập và lưu trữ time-series metrics tại cổng `9090`.
   - **Grafana (`grafana_dashboard`)**: Trực quan hóa số liệu giám sát hệ thống với Dashboard tại cổng `3000`.

---

## DANH SÁCH DỊCH VỤ & CỔNG TRUY CẬP (PORTS)

| Tên Dịch Vụ | Tên Container | Cổng Trên Host | Mô Tả Chức Năng | Đường Dẫn Truy Cập |
| :--- | :--- | :--- | :--- | :--- |
| **Nginx Proxy** | `nginx_proxy` | `80` | Điểm vào chính của ứng dụng web | [http://localhost](http://localhost) |
| **phpMyAdmin** | `phpmyadmin_tool` | `8080` | Quản trị CSDL MySQL trực quan | [http://localhost:8080](http://localhost:8080) |
| **cAdvisor** | `cadvisor_collector` | `8082` | Thu thập metrics tài nguyên container | [http://localhost:8082](http://localhost:8082) |
| **Prometheus** | `prometheus_monitoring` | `9090` | Máy chủ giám sát và lưu metrics | [http://localhost:9090](http://localhost:9090) |
| **Grafana** | `grafana_dashboard` | `3000` | Dashboard trực quan hóa số liệu | [http://localhost:3000](http://localhost:3000) |

> 📐 **Giải thích cơ chế hoạt động & kiến trúc hệ thống:** Xem file [**ARCHITECTURE.md**](./ARCHITECTURE.md).  
> 📌 **Bảng tra cứu đường dẫn & cổng trên Server:** Xem file [**ENDPOINTS.md**](./ENDPOINTS.md).  
> 📖 **Tài liệu hướng dẫn chi tiết từng dịch vụ:** Xem thư mục [**docs/**](./docs/README.md).

---

## HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY (DEPLOYMENT GUIDE)

### 1. Khởi chạy toàn bộ hệ thống
Tại thư mục gốc của dự án, mở terminal và thực hiện:
```bash
sudo docker compose up -d --build
```
*(Nếu sử dụng phiên bản Docker Compose cũ hơn, dùng lệnh `sudo docker-compose up -d --build`)*

### 2. Kiểm tra trạng thái các Container
```bash
sudo docker ps
```
Đảm bảo tất cả 7 container đều ở trạng thái `Up`.

### 3. Kiểm tra log hoạt động của các dịch vụ
```bash
sudo docker compose logs -f
```

### 4. Dừng hệ thống khi không sử dụng
```bash
sudo docker compose down
```
*(Nếu muốn xóa cả volume dữ liệu MySQL: `sudo docker compose down -v`)*

---

## THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP MẶC ĐỊNH
- **MySQL Root:**
  - Host: `mysql_db` (hoặc `db`)
  - Username: `root`
  - Password: `RootPassword123!`
  - Database: `qlsv_db`
- **phpMyAdmin:**
  - Server: `mysql_db`
  - Username: `root`
  - Password: `RootPassword123!`
- **Grafana:**
  - Username: `admin`
  - Password: `admin` (yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên)
