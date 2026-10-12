# HƯỚNG DẪN HỆ THỐNG GIÁM SÁT (PROMETHEUS + CADVISOR + GRAFANA)

---

## 1. TỔNG QUAN KIẾN TRÚC GIÁM SÁT
Hệ thống giám sát bao gồm 3 thành phần liên kết chặt chẽ với nhau:
1. **cAdvisor (`cổng 8082`):** Trực tiếp đọc số liệu phần cứng từ Docker daemon (CPU, RAM, Network, Disk).
2. **Prometheus (`cổng 9090`):** Máy chủ lưu trữ Time-Series Database (TSDB), định kỳ mỗi 5 giây gửi request kéo số liệu (scrape) từ cAdvisor.
3. **Grafana (`cổng 3000`):** Nền tảng trực quan hóa số liệu thành các biểu đồ và bảng điều khiển (Dashboard) trực quan.

---

## 2. HƯỚNG DẪN SỬ DỤNG CADVISOR (CỔNG 8082)
* **Đường dẫn:** [http://localhost:8082](http://localhost:8082)
* **Cách sử dụng:**
  * Bấm vào liên kết **Docker Containers** trên trang chủ.
  * Chọn từng container cụ thể (`web_app`, `mysql_db`, `nginx_proxy`,...).
  * Giao diện cAdvisor sẽ hiển thị biểu đồ CPU, RAM, Network Traffic ngay lập tức của riêng container đó.

---

## 3. HƯỚNG DẪN SỬ DỤNG PROMETHEUS (CỔNG 9090)
* **Đường dẫn:** [http://localhost:9090](http://localhost:9090)
* **Kiểm tra trạng thái thu thập số liệu (Targets):**
  * Vào menu trên cùng: **Status** $\rightarrow$ **Targets** (hoặc truy cập [http://localhost:9090/targets](http://localhost:9090/targets)).
  * Kiểm tra mục `cadvisor`: Phải có trạng thái **UP** màu xanh lá.
* **Truy vấn số liệu nhanh (Graph / Table):**
  * Quay lại trang chủ Prometheus, nhập câu lệnh PromQL mẫu vào thanh tìm kiếm:
    * Kiểm tra tổng RAM đang dùng: `sum(container_memory_usage_bytes)`
    * Kiểm tra CPU: `sum(rate(container_cpu_usage_seconds_total[1m])) * 100`
  * Bấm **Execute** và chuyển sang tab **Graph** để xem biểu đồ đường.

---

## 4. HƯỚNG DẪN SỬ DỤNG GRAFANA DASHBOARD (CỔNG 3000)
* **Đường dẫn:** [http://localhost:3000](http://localhost:3000)
* **Đăng nhập mặc định:**
  * **Tài khoản:** `admin`
  * **Mật khẩu:** `admin` *(Nếu hệ thống hỏi đổi mật khẩu, bạn có thể bấm **Skip** hoặc đặt mật khẩu mới)*.

### 4.1. Mở Dashboard đã được cấu hình tự động:
1. Ở cột menu màu đen bên trái, bấm vào biểu tượng 4 ô vuông **Dashboards**.
2. Mở thư mục **Monitoring** $\rightarrow$ Chọn Dashboard:
   **"Giám Sát Hệ Thống Docker Containers - DTC241200007"**.

### 4.2. Ý nghĩa các biểu đồ trên Dashboard:
* **Hàng 1: Thống kê tổng quan:**
  * **Tổng số Containers đang chạy:** Hiển thị số lượng container/services đang hoạt động.
  * **Tổng dung lượng RAM sử dụng:** Tổng RAM hệ thống tiêu thụ (tính theo GB).
  * **Tổng tải CPU (%):** Tổng phần trăm CPU sử dụng hiện tại.
* **Hàng 2: Chi tiết hiệu năng theo từng thành phần:**
  * **CPU Usage (%):** Biểu đồ đường thể hiện mức độ chiếm CPU của từng container (`web_app`, `mysql_db`, `nginx_proxy`...).
  * **RAM Usage:** Biểu đồ đường thể hiện mức độ chiếm dụng bộ nhớ RAM của từng container.
* **Hàng 3: Lưu lượng mạng (Network Traffic):**
  * **Lưu lượng Mạng Nhận (RX):** Băng thông dữ liệu tải vào qua card mạng (Bps / KBps).
  * **Lưu lượng Mạng Gửi (TX):** Băng thông dữ liệu gửi đi (Bps / KBps).

> *Dashboard được thiết lập chế độ tự động làm mới (**Auto Refresh 5s**), mọi thao tác gửi request lên web đều sẽ làm biểu đồ nhảy số thời gian thực.*
