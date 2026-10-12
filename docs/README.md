# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ THỐNG (SYSTEM DOCUMENTATION)

> **Dự án KTHP:** Hệ thống Quản lý Sinh viên & Giám sát Docker Containers  
> **Sinh viên:** Vàng Thị Sinh | **MSSV:** DTC241200007 | **Lớp:** CNTT-K23E  

---

## 📚 MỤC LỤC TÀI LIỆU

Thư mục `docs/` chứa toàn bộ tài liệu hướng dẫn chi tiết về cách sử dụng, quản trị và triển khai từng thành phần trong hệ thống:

| STT | Tài liệu | Mô tả nội dung |
| :-: | :--- | :--- |
| **00** | [**ARCHITECTURE.md**](../ARCHITECTURE.md) | **Giải thích Kiến trúc & Cơ chế hoạt động:** Sơ đồ luồng dữ liệu, vai trò chi tiết của 7 container trong hệ thống. |
| **01** | [**01_web_app.md**](./01_web_app.md) | **Hướng dẫn sử dụng Ứng dụng Web Quản lý Sinh viên:** Thêm mới, xem danh sách, xếp loại học lực, chỉnh sửa, xóa và tìm kiếm sinh viên. |
| **02** | [**02_phpmyadmin.md**](./02_phpmyadmin.md) | **Hướng dẫn Quản trị CSDL qua phpMyAdmin:** Đăng nhập, xem bảng `sinhvien`, truy vấn SQL, backup và export dữ liệu. |
| **03** | [**03_monitoring_stack.md**](./03_monitoring_stack.md) | **Hướng dẫn Hệ thống Giám sát:** Đọc số liệu cAdvisor, kiểm tra Prometheus Targets và sử dụng Dashboard Grafana chuyên nghiệp. |
| **04** | [**04_deployment_server.md**](./04_deployment_server.md) | **Hướng dẫn Triển khai lên Cloud / VPS:** Cài đặt Docker, mở cổng tường lửa Firewall (UFW), clone repo và vận hành trên server. |

---

## ⚡ BẢNG TRA CỨU ĐƯỜNG DẪN NHANH

Xem chi tiết tất cả các cổng và đường dẫn truy cập tại file: [**ENDPOINTS.md**](../ENDPOINTS.md).
