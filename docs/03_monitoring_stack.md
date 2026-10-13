# HƯỚNG DẪN HỆ THỐNG GIÁM SÁT TOÀN DIỆN (PROMETHEUS + NODE EXPORTER + PROCESS EXPORTER + CADVISOR + GRAFANA)

---

## 1. TỔNG QUAN KIẾN TRÚC GIÁM SÁT ĐA TẦNG
Hệ thống giám sát được xây dựng theo mô hình **Toàn diện (Full-stack Observability)** từ tầng Máy chủ (Host OS), Tầng Tiến trình (Process) đến Tầng Ứng dụng Container (Docker):

1. **Node Exporter (`cổng 9100`):** Đo đạc phần cứng máy chủ vật lý / OS (CPU cores, RAM khả dụng, phân vùng Disk `/`, `/boot`..., trạng thái Server UP/DOWN).
2. **Process Exporter (`cổng 9256`):** Quét `/proc` của hệ điều hành, phân tích Top tiến trình (Processes) tiêu thụ nhiều CPU và RAM nhất (`mysqld`, `node`, `nginx`, `grafana`...).
3. **cAdvisor (`cổng 8082`):** Thu thập số liệu hiệu năng chi tiết của các Docker Container ứng dụng (`web_app`, `mysql_db`, `nginx_proxy`...).
4. **Loki (`cổng 3100`) & Promtail:** Hệ thống gom và lưu trữ nhật ký Log hệ thống thời gian thực (Log aggregation & streaming).
5. **Prometheus Server (`cổng 9090`):** Máy chủ lưu trữ Time-Series Database (TSDB), định kỳ mỗi 5 giây thu thập dữ liệu (scrape) từ các exporter.
6. **Grafana (`cổng 3000`):** Nền tảng trực quan hóa số liệu và log thành Dashboard giám sát chuẩn Enterprise thời gian thực.

---

## 2. HƯỚNG DẪN KIỂM TRA PROMETHEUS TARGETS (CỔNG 9090)
* **Đường dẫn:** [http://localhost:9090](http://localhost:9090)
* **Kiểm tra trạng thái thu thập số liệu (Targets):**
  * Vào menu trên cùng: **Status** $\rightarrow$ **Targets** (hoặc truy cập [http://localhost:9090/targets](http://localhost:9090/targets)).
  * Phải có đủ 4 mục trạng thái **UP** màu xanh lá:
    1. `node-exporter` (cổng 9100)
    2. `process-exporter` (cổng 9256)
    3. `cadvisor` (cổng 8080)
    4. `prometheus` (cổng 9090)

---

## 3. HƯỚNG DẪN SỬ DỤNG GRAFANA DASHBOARD (CỔNG 3000)
* **Đường dẫn:** [http://localhost:3000](http://localhost:3000)
* **Tài khoản:** `admin` | **Mật khẩu:** `admin`

### 3.1. Mở Dashboard đã được tự động khởi tạo:
1. Ở cột menu màu đen bên trái, bấm vào biểu tượng 4 ô vuông **Dashboards**.
2. Mở thư mục **Monitoring** $\rightarrow$ Chọn Dashboard:
   **"Giám Sát Hệ Thống Server & Docker Containers - DTC241200007"**.

### 3.2. Cấu trúc các khu vực trên Dashboard:
* **Hàng 1: Thẻ thống kê tổng quan (Stat Cards):**
  * **Server UP:** Số lượng máy chủ / node đang online.
  * **Server DOWN:** Số lượng máy chủ đang gặp sự cố / offline.
  * **CPU TB:** Tỷ lệ % CPU sử dụng trung bình của toàn bộ máy chủ.
  * **RAM TB:** Tỷ lệ % RAM tiêu thụ trung bình.
  * **Disk cao nhất:** Tỷ lệ % dung lượng phân vùng ổ cứng đang đầy nhất (cảnh báo sớm tràn đĩa).
  * **Containers UP:** Số lượng Docker Container thực tế đang chạy trong hệ thống.
* **Hàng 2: Hiệu năng phần cứng máy chủ theo Server:**
  * **CPU % theo server:** Biểu đồ đường tải CPU của từng máy chủ, kèm bảng Legend (Last, Max).
  * **RAM % theo server:** Biểu đồ đường dung lượng RAM tiêu thụ của từng server.
  * **Disk % theo mountpoint:** Dung lượng chiếm dụng của từng phân vùng (`/`, `/mnt/...`).
* **Hàng 3: Chi tiết tiến trình hệ thống (Top Process Monitoring):**
  * **Top process CPU:** Biểu đồ Top tiến trình ngốn nhiều CPU nhất (`grafana`, `node`, `mysqld`...).
  * **Top process RAM:** Biểu đồ Top tiến trình chiếm nhiều RAM nhất (`mysqld`, `grafana`...).
* **Hàng 4: Chi tiết hiệu năng từng Container ứng dụng:**
  * **CPU Usage theo Container (%):** % CPU từng container (`web_app`, `mysql_db`, `nginx_proxy`...).
  * **RAM Usage theo Container:** Bộ nhớ RAM tiêu thụ của từng container.
  * **Lưu lượng Mạng Containers (RX / TX):** Băng thông mạng vào/ra của các dịch vụ.

> *Dashboard được thiết lập chế độ tự động làm mới (**Auto Refresh 5s**), hiển thị thời gian thực.*
