# DANH SÁCH ĐƯỜNG DẪN & CỔNG DỊCH VỤ (SERVICE ENDPOINTS)

> **Dự án:** Hệ thống Quản lý Sinh viên & Giám sát Docker Containers  
> **Sinh viên thực hiện:** Vàng Thị Sinh  
> **MSSV:** DTC241200007 | **Lớp:** CNTT-K23E  

---

## 1. BẢNG TỔNG HỢP CÁC ĐƯỜNG DẪN DỊCH VỤ

Khi hệ thống được khởi chạy qua Docker Compose, các dịch vụ sẽ lắng nghe trên các cổng tương ứng:

| Dịch Vụ | Tên Container | Cổng Host | Đường Dẫn Localhost | Đường Dẫn Trên Server Thực Tế | Tài Khoản Đăng Nhập |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Ứng dụng Quản lý Sinh viên** | `nginx_proxy` & `web_app` | **`80`** | [http://localhost](http://localhost) | `http://<IP_SERVER>` | *Không cần đăng nhập* |
| **phpMyAdmin** | `phpmyadmin_tool` | **`8080`** | [http://localhost:8080](http://localhost:8080) | `http://<IP_SERVER>:8080` | **Server:** `mysql_db`<br>**User:** `root`<br>**Password:** `RootPassword123!` |
| **Grafana Dashboard** | `grafana_dashboard` | **`3000`** | [http://localhost:3000](http://localhost:3000) | `http://<IP_SERVER>:3000` | **User:** `admin`<br>**Password:** `admin` |
| **cAdvisor Metrics** | `cadvisor_collector` | **`8082`** | [http://localhost:8082](http://localhost:8082) | `http://<IP_SERVER>:8082` | *Không cần đăng nhập* |
| **Prometheus Server** | `prometheus_monitoring` | **`9090`** | [http://localhost:9090](http://localhost:9090) | `http://<IP_SERVER>:9090` | *Không cần đăng nhập* |
| **MySQL Database** | `mysql_db` | `3306` *(nội bộ)* | *Chỉ kết nối nội bộ trong Docker* | *Chỉ kết nối nội bộ trong Docker* | **Database:** `qlsv_db`<br>**User:** `root`<br>**Password:** `RootPassword123!` |
| **Node.js Web App** | `web_app` | `3000` *(nội bộ)* | *Được Nginx Reverse Proxy bảo vệ* | *Được Nginx Reverse Proxy bảo vệ* | *Health check:* `http://localhost/health` |

> *Ghi chú: Thay `<IP_SERVER>` bằng địa chỉ IP Public hoặc tên miền (Domain) của máy chủ khi bạn triển khai trên Cloud/VPS.*

---

## 2. SƠ ĐỒ ĐỊNH TUYẾN MẠNG & CỔNG (NETWORK ROUTING)

```
[ NGƯỜI DÙNG / TRÌNH DUYỆT ]
      │
      ├── Cổng 80   ────────► [ Nginx Reverse Proxy ] ──(nội bộ: 3000)──► [ Web App Node.js ] ──► [ MySQL: 3306 ]
      │
      ├── Cổng 8080 ────────► [ phpMyAdmin ] ──────────(nội bộ: 3306)──► [ MySQL: 3306 ]
      │
      ├── Cổng 3000 ────────► [ Grafana Dashboard ] ───(nội bộ: 9090)──► [ Prometheus ]
      │                                                                        │
      ├── Cổng 9090 ────────► [ Prometheus Server ]  ◄──(nội bộ: 8080)── [ cAdvisor ]
      │                                                                        │
      └── Cổng 8082 ────────► [ cAdvisor UI ] ────────────────────────► [ Thu thập Docker Engine ]
```

---

## 3. CÁC ĐƯỜNG DẪN ĐẶC BIỆT & KIỂM TRA SỨC KHỎE (HEALTH CHECKS)

* **Kiểm tra Node.js Health API:**
  * URL: [http://localhost/health](http://localhost/health)
  * Trả về JSON: `{"status":"OK","runtime":"Node.js","timestamp":"..."}`
* **Kiểm tra Prometheus Targets:**
  * URL: [http://localhost:9090/targets](http://localhost:9090/targets)
  * Trạng thái mục `cadvisor` phải hiển thị **UP** (màu xanh).
* **Truy cập Dashboard Grafana:**
  * URL trực tiếp: [http://localhost:3000/dashboards](http://localhost:3000/dashboards)
  * Thư mục: **Monitoring** $\rightarrow$ Dashboard: **"Giám Sát Hệ Thống Docker Containers - DTC241200007"**.

---

## 4. LỆNH KIỂM TRA NHANH TRẠNG THÁI CÁC CỔNG

Trên terminal máy chủ hoặc máy local:
```bash
# Kiểm tra danh sách container và cổng đang mở
docker compose ps

# Kiểm tra phản hồi cổng 80 (Nginx -> Node.js)
curl -I http://localhost

# Kiểm tra phản hồi cổng 3000 (Grafana)
curl -I http://localhost:3000/api/health
```
