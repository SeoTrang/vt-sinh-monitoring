<?php
// Cấu hình kết nối Cơ sở dữ liệu
$host = getenv('DB_HOST') ? getenv('DB_HOST') : 'mysql_db';
$user = getenv('DB_USER') ? getenv('DB_USER') : 'root';
$pass = getenv('DB_PASS') ? getenv('DB_PASS') : 'RootPassword123!';
$db   = getenv('DB_NAME') ? getenv('DB_NAME') : 'qlsv_db';

// Cơ chế kết nối an toàn tương thích PHP 8.1+
$conn = null;
$max_retries = 10;
$retry = 0;
while ($retry < $max_retries) {
    try {
        $conn = new mysqli($host, $user, $pass, $db);
        if (!$conn->connect_error) {
            break;
        }
    } catch (Throwable $e) {
        $alt_host = ($host === 'mysql_db') ? 'db' : 'mysql_db';
        try {
            $conn = new mysqli($alt_host, $user, $pass, $db);
            if (!$conn->connect_error) {
                $host = $alt_host;
                break;
            }
        } catch (Throwable $e2) {
            // Chờ MySQL hoàn tất khởi động
        }
    }
    $retry++;
    sleep(1);
}

if (!$conn || $conn->connect_error) {
    die("Kết nối CSDL thất bại: " . ($conn ? $conn->connect_error : "Không thể kết nối đến MySQL"));
}

// Thiết lập mã hóa UTF-8 tiếng Việt
$conn->set_charset("utf8mb4");

// 1. CHỨC NĂNG DELETE (XÓA SINH VIÊN)
if (isset($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $conn->query("DELETE FROM sinhvien WHERE id=$id");
    header("Location: index.php");
    exit();
}

// 2. LẤY THÔNG TIN SINH VIÊN CẦN SỬA (UPDATE PREPARATION)
$edit_sv = null;
if (isset($_GET['edit'])) {
    $id = intval($_GET['edit']);
    $res = $conn->query("SELECT * FROM sinhvien WHERE id=$id");
    if ($res && $res->num_rows > 0) {
        $edit_sv = $res->fetch_assoc();
    }
}

// 3. CHỨC NĂNG CREATE & UPDATE (THÊM MỚI HOẶC CẬP NHẬT)
if (isset($_POST['save'])) {
    $masv = trim($_POST['masv']);
    $hoten = trim($_POST['hoten']);
    $lop = trim($_POST['lop']);
    $diem = floatval($_POST['diem']);
    
    if (isset($_POST['id']) && !empty($_POST['id'])) {
        // Cập nhật (Update)
        $id = intval($_POST['id']);
        $stmt = $conn->prepare("UPDATE sinhvien SET masv=?, hoten=?, lop=?, diem=? WHERE id=?");
        $stmt->bind_param("sssdi", $masv, $hoten, $lop, $diem, $id);
    } else {
        // Thêm mới (Create)
        $stmt = $conn->prepare("INSERT INTO sinhvien (masv, hoten, lop, diem) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssd", $masv, $hoten, $lop, $diem);
    }
    $stmt->execute();
    header("Location: index.php");
    exit();
}

// 4. CHỨC NĂNG READ (LẤY DANH SÁCH SINH VIÊN)
$result = $conn->query("SELECT * FROM sinhvien ORDER BY id DESC");
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hệ thống Quản lý Sinh viên - Vàng Thị Sinh</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; background-color: #f4f6f9; color: #333; }
        .header { background: #007bff; color: white; padding: 15px 20px; border-radius: 6px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header h2 { margin: 0 0 5px 0; }
        .header p { margin: 0; font-size: 14px; opacity: 0.9; }
        .container { display: flex; gap: 30px; flex-wrap: wrap; }
        .form-section { flex: 1; min-width: 320px; }
        .table-section { flex: 2; min-width: 500px; }
        form { background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        form h3 { margin-top: 0; color: #007bff; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
        label { display: block; margin-top: 10px; font-weight: 600; font-size: 14px; color: #495057; }
        input[type="text"], input[type="number"] { width: 100%; padding: 10px; margin: 6px 0 14px; border: 1px solid #ced4da; border-radius: 5px; font-size: 14px; }
        input:focus { border-color: #80bdff; outline: 0; box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25); }
        .btn-submit { background: #28a745; color: white; padding: 10px 18px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; }
        .btn-submit:hover { background: #218838; }
        .btn-cancel { background: #6c757d; color: white; padding: 10px 18px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 14px; margin-left: 8px; }
        .btn-cancel:hover { background: #5a6268; }
        table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        th, td { padding: 12px 15px; border-bottom: 1px solid #dee2e6; text-align: left; }
        th { background-color: #007bff; color: white; font-weight: 600; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; }
        tr:hover { background-color: #f8f9fa; }
        .btn-action { padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 600; display: inline-block; }
        .btn-edit { background: #ffc107; color: #212529; margin-right: 5px; }
        .btn-edit:hover { background: #e0a800; }
        .btn-delete { background: #dc3545; color: white; }
        .btn-delete:hover { background: #c82333; }
        .badge { background: #e7f1ff; color: #007bff; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; }
        .footer { margin-top: 30px; text-align: center; color: #6c757d; font-size: 13px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Hệ Thống Quản Lý Sinh Viên</h2>
        <p>Sinh viên: <strong>Vàng Thị Sinh</strong> | MSSV: <strong>DTC241200007</strong> | Đề tài KTHP</p>
    </div>

    <div class="container">
        <div class="form-section">
            <form method="POST">
                <h3><?= $edit_sv ? "Cập Nhật Thông Tin" : "Thêm Sinh Viên Mới" ?></h3>
                <?php if ($edit_sv): ?>
                    <input type="hidden" name="id" value="<?= $edit_sv['id'] ?>">
                <?php endif; ?>
                
                <label>Mã SV:</label>
                <input type="text" name="masv" value="<?= $edit_sv ? htmlspecialchars($edit_sv['masv']) : '' ?>" placeholder="VD: DTC241200007" required>
                
                <label>Họ và Tên:</label>
                <input type="text" name="hoten" value="<?= $edit_sv ? htmlspecialchars($edit_sv['hoten']) : '' ?>" placeholder="VD: Vàng Thị Sinh" required>
                
                <label>Lớp:</label>
                <input type="text" name="lop" value="<?= $edit_sv ? htmlspecialchars($edit_sv['lop']) : '' ?>" placeholder="VD: CNTT-K23E" required>
                
                <label>Điểm số:</label>
                <input type="number" step="0.1" min="0" max="10" name="diem" value="<?= $edit_sv ? htmlspecialchars($edit_sv['diem']) : '' ?>" placeholder="VD: 9.5" required>
                
                <button type="submit" name="save" class="btn-submit"><?= $edit_sv ? "Lưu Thay Đổi" : "Thêm Sinh Viên" ?></button>
                <?php if ($edit_sv): ?>
                    <a href="index.php" class="btn-cancel">Hủy bỏ</a>
                <?php endif; ?>
            </form>
        </div>

        <div class="table-section">
            <h3 style="margin-top: 0; color: #333;">Danh Sách Sinh Viên</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Mã SV</th>
                        <th>Họ Tên</th>
                        <th>Lớp</th>
                        <th>Điểm</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ($result && $result->num_rows > 0): ?>
                        <?php while($row = $result->fetch_assoc()): ?>
                        <tr>
                            <td><?= $row['id'] ?></td>
                            <td><span class="badge"><?= htmlspecialchars($row['masv']) ?></span></td>
                            <td><strong><?= htmlspecialchars($row['hoten']) ?></strong></td>
                            <td><?= htmlspecialchars($row['lop']) ?></td>
                            <td><strong><?= number_format($row['diem'], 1) ?></strong></td>
                            <td>
                                <a href="index.php?edit=<?= $row['id'] ?>" class="btn-action btn-edit">Sửa</a>
                                <a href="index.php?delete=<?= $row['id'] ?>" class="btn-action btn-delete" onclick="return confirm('Bạn có chắc chắn muốn xóa sinh viên này?')">Xóa</a>
                            </td>
                        </tr>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="6" style="text-align: center; color: #888;">Chưa có dữ liệu sinh viên nào.</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <div class="footer">
        © 2026 Hệ thống Quản lý Sinh viên - Triển khai trên nền tảng Docker Compose, Nginx, MySQL & Monitoring Stack
    </div>
</body>
</html>