# GIẢI THÍCH KIẾN TRÚC & CƠ CHẾ HOẠT ĐỘNG CỦA HỆ THỐNG

> **Dự án KTHP:** Hệ thống Quản lý Sinh viên & Giám sát Docker Containers  
> **Sinh viên thực hiện:** Vàng Thị Sinh  
> **MSSV:** DTC241200007 | **Lớp:** CNTT-K23E  

---

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)

Hệ thống được thiết kế theo mô hình **Đa tầng (Multi-tier Architecture)** và đóng gói hoàn chỉnh bằng **Docker Compose**. Dự án chia thành 2 khối chức năng chính:

1. **Khối Ứng dụng & Dữ liệu (Application & Database Stack):** Xử lý nghiệp vụ quản lý sinh viên (CRUD), định tuyến proxy an toàn và lưu trữ CSDL.
2. **Khối Giám sát & Quản trị (Observability & Monitoring Stack):** Thu thập số liệu hiệu năng tài nguyên container (CPU, RAM, Network) và trực quan hóa theo thời gian thực.

---

## 2. SƠ ĐỒ KIẾN TRÚC TỔNG THỂ (ARCHITECTURE DIAGRAM)

```mermaid
flowchart TD
    User[" Người Dùng / Trình Duyệt"]
    Admin[" Quản Trị Viên"]

    subgraph HostPorts [" Các Cổng Mở Ra Máy Chủ (Host Ports)"]
        P80["Port 80 (HTTP)"]
        P8080["Port 8080 (phpMyAdmin)"]
        P3000["Port 3000 (Grafana)"]
        P8082["Port 8082 (cAdvisor)"]
        P9090["Port 9090 (Prometheus)"]
    end

    subgraph DockerNet [" Mạng Nội Bộ Docker (app-net)"]
        direction TB

        subgraph AppStack [" Khối Ứng Dụng"]
            Nginx["1. Nginx Reverse Proxy\n(nginx_proxy)\n- Hardening Headers\n- Chuyển tiếp cổng 80 -> 3000"]
            NodeApp["2. Web App Node.js\n(web_app - Express.js)\n- Xử lý CRUD Sinh viên\n- Tự động xếp loại, thống kê\n- API /health"]
            MySQL["3. MySQL Server 8.0\n(mysql_db)\n- Database: qlsv_db\n- Bảng: sinhvien\n- Volume: db_data"]
            PMA["4. phpMyAdmin\n(phpmyadmin_tool)\n- Quản trị CSDL giao diện Web"]
        end

        subgraph MonitorStack [" Khối Giám Sát (Monitoring Stack)"]
            cAdv["5. cAdvisor\n(cadvisor_collector)\n- Đọc Docker Engine & cgroups\n- Đo CPU, RAM, Network"]
            Prom["6. Prometheus\n(prometheus_monitoring)\n- TSDB lưu trữ metrics\n- Scrape mỗi 5 giây"]
            Graf["7. Grafana\n(grafana_dashboard)\n- Provisioning tự động\n- Trực quan hóa Dashboard"]
        end
    end

    %% Luồng người dùng
    User -->|Truy cập Website| P80 --> Nginx
    Nginx -->|Reverse Proxy| NodeApp
    NodeApp -->|Truy vấn SQL (mysql2)| MySQL

    %% Luồng quản trị CSDL
    Admin -->|Quản trị CSDL| P8080 --> PMA
    PMA -->|Kết nối quản trị| MySQL

    %% Luồng giám sát
    cAdv -.->|Đọc tài nguyên| AppStack
    Prom -->|Kéo metrics (Scrape 5s)| cAdv
    Graf -->|Truy vấn số liệu| Prom
    Admin -->|Xem Dashboard| P3000 --> Graf
    Admin -.->|Xem Metrics thô| P9090 --> Prom
    Admin -.->|Xem cAdvisor thô| P8082 --> cAdv
```

---

## 3. VAI TRÒ & CHỨC NĂNG CỦA TỪNG THÀNH PHẦN

### 3.1. Nginx Reverse Proxy (`nginx_proxy`)
* **Hình ảnh Docker:** `nginx:alpine` (gọn nhẹ, tối ưu bảo mật).
* **Cổng:** Lắng nghe ở cổng `80` trên máy chủ (cổng web mặc định).
* **Chức năng chính:**
  1. **Định tuyến (Routing):** Đóng vai trò là "người bảo vệ cửa ngõ", tiếp nhận mọi yêu cầu từ người dùng tại cổng `80` và chuyển tiếp ngầm đến cổng `3000` của ứng dụng Node.js (`web_app`).
  2. **Tăng cường bảo mật (Security Hardening):** Tự động thêm các HTTP Security Headers theo yêu cầu đề bài:
     * `X-Frame-Options: SAMEORIGIN` $\rightarrow$ Chống tấn công Clickjacking.
     * `X-XSS-Protection: 1; mode=block` $\rightarrow$ Ngăn chặn tấn công Cross-Site Scripting (XSS).
     * `X-Content-Type-Options: nosniff` $\rightarrow$ Ngăn chặn tấn công MIME-type sniffing.
     * `Referrer-Policy: no-referrer-when-downgrade` $\rightarrow$ Bảo vệ quyền riêng tư liên kết.

---

### 3.2. Web Application Backend (`web_app`)
* **Nền tảng:** Node.js (v20 Alpine) sử dụng Framework **Express.js**.
* **Cổng nội bộ:** `3000` (Không mở trực tiếp ra bên ngoài, chỉ Nginx mới kết nối được).
* **Chức năng chính:**
  1. **CRUD Quản lý Sinh viên:**
     * `GET /`: Hiển thị danh sách sinh viên, form thêm mới/chỉnh sửa, hỗ trợ tìm kiếm theo từ khóa.
     * `POST /add`: Tiếp nhận dữ liệu, kiểm tra trùng lặp Mã SV và lưu vào MySQL.
     * `POST /edit/:id`: Cập nhật thông tin sinh viên đã tồn tại.
     * `GET /delete/:id`: Xóa sinh viên khỏi cơ sở dữ liệu.
  2. **Thống kê & Xếp loại tự động:** Tính toán sĩ số, điểm trung bình, điểm cao nhất và tự động phân loại học lực (Xuất sắc, Giỏi, Khá, Trung bình, Yếu).
  3. **Cơ chế Tự phục hồi kết nối (Auto-reconnect with Retry):** Khi khởi động cùng lúc trong Docker Compose, MySQL thường mất 10–15s để sẵn sàng. Ứng dụng Node.js có vòng lặp thử lại thông minh (Retry loop), giúp ứng dụng không bị crash khi đợi MySQL khởi động.
  4. **Health Check API:** Đường dẫn `/health` trả về định dạng JSON báo cáo tình trạng sống của container.

---

### 3.3. Database Server (`mysql_db`)
* **Hình ảnh Docker:** `mysql:8.0`.
* **Cổng nội bộ:** `3306` (Chỉ mở trong mạng `app-net`, đóng hoàn toàn với bên ngoài để bảo vệ dữ liệu).
* **Chức năng chính:**
  1. **Lưu trữ dữ liệu:** Lưu trữ database `qlsv_db` và bảng `sinhvien` với cấu trúc `id`, `masv`, `hoten`, `lop`, `diem`.
  2. **Tự động khởi tạo dữ liệu:** Thông qua volume `./app/init.sql:/docker-entrypoint-initdb.d/init.sql`, MySQL tự động tạo bảng và nạp sẵn dữ liệu mẫu của sinh viên Vàng Thị Sinh (DTC241200007) ngay trong lần khởi động đầu tiên.
  3. **Bảo toàn dữ liệu (Persistence):** Dữ liệu được lưu trong Docker Named Volume `db_data`, đảm bảo không bị mất dữ liệu khi restart hay rebuild container.

---

### 3.4. Database Admin Tool (`phpmyadmin_tool`)
* **Hình ảnh Docker:** `phpmyadmin/phpmyadmin`.
* **Cổng:** Lắng nghe ở cổng `8080`.
* **Chức năng chính:**
  * Cung cấp giao diện trực quan trên nền web để xem bảng, kiểm tra dữ liệu, viết câu lệnh SQL, xuất/nhập file `.sql` mà không cần cài đặt phần mềm quản trị CSDL trên máy cá nhân.

---

### 3.5. cAdvisor Collector (`cadvisor_collector`)
* **Hình ảnh Docker:** `gcr.io/cadvisor/cadvisor:v0.47.0`.
* **Cổng:** `8082` (Map từ 8080 trong container).
* **Chức năng chính:**
  * Gắn kết trực tiếp vào Docker socket (`/var/run/docker.sock`) và nhân Linux cgroups (`/sys/fs/cgroup`).
  * Liên tục đo lường mức độ tiêu thụ tài nguyên thực tế của từng container:
    * Phần trăm vi xử lý (CPU Usage).
    * Bộ nhớ RAM thực tế và giới hạn RAM (Memory Usage).
    * Băng thông mạng tải về/gửi đi (Network I/O RX/TX).
  * Chuyển đổi và xuất dữ liệu ra định dạng Prometheus Metrics chuẩn tại endpoint `/metrics`.

---

### 3.6. Prometheus Server (`prometheus_monitoring`)
* **Hình ảnh Docker:** `prom/prometheus:latest`.
* **Cổng:** `9090`.
* **Chức năng chính:**
  1. **Cơ chế Kéo dữ liệu (Pull / Scrape):** Theo chu kỳ được cấu hình trong `prometheus.yml` (mặc định mỗi 5 giây), Prometheus chủ động gửi HTTP request đến `cadvisor:8080/metrics` để thu thập dữ liệu mới nhất.
  2. **Time-Series Database (TSDB):** Lưu trữ các số liệu theo dòng thời gian, đánh chỉ mục theo nhãn (labels).
  3. **Công cụ truy vấn PromQL:** Cho phép tính toán các hàm thống kê phức tạp (tính tỷ lệ tải `rate()`, tổng `sum()`, nhóm theo nhãn `by (...)`).

---

### 3.7. Grafana Dashboard (`grafana_dashboard`)
* **Hình ảnh Docker:** `grafana/grafana:latest`.
* **Cổng:** `3000`.
* **Chức năng chính:**
  1. **Tự động cấu hình (Provisioning):** 
     * Tự động liên kết Data Source `Prometheus` thông qua file `grafana/provisioning/datasources/datasource.yml`.
     * Tự động nạp sẵn Dashboard `Giám Sát Hệ Thống Docker Containers - DTC241200007` qua file `grafana/provisioning/dashboards/docker_overview.json`.
  2. **Trực quan hóa:** Hiển thị số liệu trực quan bằng các widget đa dạng (Stat cards tổng quan, Biểu đồ đường Timeseries mượt mà, phân loại màu sắc cảnh báo theo ngưỡng tải).
  3. **Làm mới tự động (Auto-refresh):** Cập nhật dữ liệu mới mỗi 5 giây giúp quản trị viên theo dõi tải hệ thống tức thì.

---

## 4. CÁC LUỒNG HOẠT ĐỘNG THỰC TẾ (WORKFLOWS)

### 🔁 Luồng 1: Người dùng thao tác thêm sinh viên mới
1. Người dùng mở trình duyệt vào [http://localhost](http://localhost) (cổng 80).
2. **Nginx** nhận HTTP request, thêm các Header bảo mật và chuyển tiếp đến **Web App (Node.js)** trên cổng 3000.
3. Người dùng nhập thông tin và bấm **"Thêm sinh viên"** $\rightarrow$ Request `POST /add` được gửi đi.
4. **Web App** kiểm tra dữ liệu, tạo câu lệnh SQL `INSERT INTO sinhvien...` và gửi đến **MySQL** (cổng 3306) qua kết nối connection pool.
5. **MySQL** ghi dữ liệu vào disk (`db_data`), trả về kết quả thành công cho Web App.
6. **Web App** render lại trang danh sách kèm thông báo màu xanh và gửi phản hồi HTML về cho người dùng qua Nginx.

---

### 📊 Luồng 2: Hệ thống tự động giám sát tài nguyên
1. Container `web_app` và `mysql_db` xử lý dữ liệu, làm phát sinh mức tiêu thụ CPU, RAM và lưu lượng mạng Network.
2. **cAdvisor** đọc trạng thái từ `/var/run/docker.sock` và `/sys/fs/cgroup`, ghi nhận các thông số này.
3. Đúng chu kỳ 5 giây, **Prometheus** gửi request đến cAdvisor để lấy metrics mới nhất và lưu trữ vào cơ sở dữ liệu chuỗi thời gian.
4. Trên trình duyệt, **Grafana** (cổng 3000) tự động gửi câu hỏi truy vấn PromQL đến Prometheus:
   * *"Tính tổng RAM tiêu thụ hiện tại?"*
   * *"Tính phần trăm CPU của từng container trong 1 phút qua?"*
5. **Prometheus** tính toán và trả về kết quả. **Grafana** vẽ các đường biểu đồ di chuyển sống động trên màn hình Dashboard.

---

## 5. TÍNH NĂNG KỸ THUẬT NỔI BẬT ĐẠT CHUẨN ĐỒ ÁN

| Tiêu chuẩn kỹ thuật | Giải pháp triển khai trong dự án |
| :--- | :--- |
| **Độc lập nền tảng (Portability)** | Toàn bộ ứng dụng chạy trong Container, chạy nhất quán trên cả Windows, macOS và Linux Server. |
| **Cô lập mạng (Network Isolation)** | MySQL và Web App chỉ giao tiếp trong mạng nội bộ Docker `app-net`, database không bị lộ cổng ra ngoài Internet. |
| **Bảo mật Web (Hardening)** | Nginx áp dụng 4 lớp Security Headers chuẩn OWASP chống Clickjacking, XSS, Sniffing. |
| **Khả năng quan sát (Observability)** | Stack Prometheus + cAdvisor + Grafana đạt chuẩn kiến trúc giám sát của các hệ thống doanh nghiệp lớn. |
| **Triển khai tự động (Zero-configuration)** | Grafana và MySQL đều tự động khởi tạo cấu hình và dữ liệu mẫu (Provisioning), chỉ cần 1 câu lệnh `docker compose up -d` là chạy hoàn chỉnh toàn bộ hệ thống. |
