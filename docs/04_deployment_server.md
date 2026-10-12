# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN LÊN SERVER / VPS

Tài liệu này hướng dẫn từng bước đưa toàn bộ hệ thống lên máy chủ thực tế (VPS Ubuntu / Debian trên Cloud như AWS, DigitalOcean, Viettel, FPT, CMC, Linode,...).

---

## BƯỚC 1: CHUẨN BỊ MÁY CHỦ & CÀI ĐẶT DOCKER

Kết nối SSH vào máy chủ:
```bash
ssh root@<IP_SERVER>
```

Cập nhật hệ thống và cài đặt Docker + Docker Compose:
```bash
# Cập nhật danh sách gói phần mềm
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
sudo apt install -y docker.io docker-compose-v2

# Khởi chạy và bật Docker tự động chạy khi khởi động máy
sudo systemctl enable --now docker
```

---

## BƯỚC 2: MỞ TƯỜNG LỬA (FIREWALL) TRÊN SERVER

Để truy cập được các dịch vụ từ trình duyệt bên ngoài, cần mở các cổng tương ứng:

### 1. Nếu sử dụng tường lửa UFW (Ubuntu mặc định):
```bash
sudo ufw allow 22/tcp    # Cổng SSH quản trị
sudo ufw allow 80/tcp    # Ứng dụng Quản lý Sinh viên (Nginx)
sudo ufw allow 8080/tcp  # Quản trị CSDL phpMyAdmin
sudo ufw allow 3000/tcp  # Dashboard Grafana
sudo ufw allow 8082/tcp  # cAdvisor (Tùy chọn)
sudo ufw allow 9090/tcp  # Prometheus (Tùy chọn)

# Kích hoạt tường lửa
sudo ufw enable
sudo ufw status
```

### 2. Nếu sử dụng Cloud (AWS, Google Cloud, DigitalOcean, Viettel Cloud...):
Vào trang quản trị Web của nhà cung cấp Cloud $\rightarrow$ mục **Security Groups / Firewall Rules** $\rightarrow$ Thêm Inbound Rules cho phép các cổng:
* `80` (HTTP)
* `8080` (Custom TCP)
* `3000` (Custom TCP)
* `8082` (Custom TCP)
* `9090` (Custom TCP)

---

## BƯỚC 3: SAO CHÉP MÃ NGUỒN VÀ KHỞI CHẠY HỆ THỐNG

### 1. Kéo mã nguồn từ GitHub về Server:
```bash
git clone https://github.com/vangsinh690/DTC241200007.git
cd DTC241200007
```

### 2. Khởi chạy toàn bộ hệ thống bằng Docker Compose:
```bash
docker compose up -d --build
```

### 3. Kiểm tra trạng thái các container:
```bash
docker compose ps
```
Đảm bảo tất cả 7 container (`web_app`, `mysql_db`, `nginx_proxy`, `phpmyadmin_tool`, `prometheus_monitoring`, `cadvisor_collector`, `grafana_dashboard`) đều có trạng thái **Up / Running**.

---

## BƯỚC 4: TRUY CẬP HỆ THỐNG TRÊN TRÌNH DUYỆT

Mở trình duyệt trên máy tính cá nhân và truy cập theo địa chỉ IP của server:

* **Trang web Quản lý Sinh viên:** `http://<IP_SERVER>`
* **Quản lý phpMyAdmin:** `http://<IP_SERVER>:8080` (User: `root`, Pass: `RootPassword123!`, Server: `mysql_db`)
* **Trực quan hóa Grafana:** `http://<IP_SERVER>:3000` (User: `admin`, Pass: `admin`)
* **Kiểm tra Metrics Prometheus:** `http://<IP_SERVER>:9090`
* **Kiểm tra Container cAdvisor:** `http://<IP_SERVER>:8082`

---

## BƯỚC 5: CÁC LỆNH QUẢN TRỊ KHI VẬN HÀNH TRÊN SERVER

* **Xem log của ứng dụng web theo thời gian thực:**
  ```bash
  docker compose logs -f web_app
  ```
* **Khởi động lại một dịch vụ bất kỳ:**
  ```bash
  docker compose restart nginx_proxy
  docker compose restart grafana
  ```
* **Cập nhật code mới nhất từ GitHub:**
  ```bash
  git pull origin main
  docker compose up -d --build web_app
  ```
* **Tạm dừng hệ thống:**
  ```bash
  docker compose down
  ```
