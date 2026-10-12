const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình CSDL từ biến môi trường
const DB_CONFIG = {
    host: process.env.DB_HOST || 'mysql_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || 'RootPassword123!',
    database: process.env.DB_NAME || 'qlsv_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
};

// Middleware xử lý dữ liệu form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let pool = null;

// Hàm khởi tạo kết nối CSDL có cơ chế thử lại (Retry)
async function initDatabase() {
    const maxRetries = 15;
    for (let i = 1; i <= maxRetries; i++) {
        try {
            console.log(`[DB] Đang thử kết nối MySQL (${i}/${maxRetries}) tại host: ${DB_CONFIG.host}...`);
            pool = mysql.createPool(DB_CONFIG);
            
            // Thử một truy vấn đơn giản để kiểm tra kết nối
            const [rows] = await pool.query('SELECT 1');
            console.log('[DB] Kết nối CSDL MySQL thành công!');
            
            // Đảm bảo bảng sinh viên tồn tại
            await pool.query(`
                CREATE TABLE IF NOT EXISTS sinhvien (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    masv VARCHAR(50) NOT NULL UNIQUE,
                    hoten VARCHAR(100) NOT NULL,
                    lop VARCHAR(50) NOT NULL,
                    diem DECIMAL(4, 2) NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `);
            return;
        } catch (err) {
            console.error(`[DB] Thất bại lần ${i}: ${err.message}`);
            if (i < maxRetries) {
                // Thử đổi host giữa mysql_db và db nếu cần
                if (DB_CONFIG.host === 'mysql_db') {
                    DB_CONFIG.host = 'db';
                } else if (DB_CONFIG.host === 'db') {
                    DB_CONFIG.host = '127.0.0.1';
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    console.error('[DB] Không thể kết nối MySQL sau nhiều lần thử!');
}

// Xếp loại học lực theo điểm
function getRankBadge(diem) {
    const d = parseFloat(diem);
    if (d >= 8.5) return '<span class="badge bg-success">Xuất sắc</span>';
    if (d >= 8.0) return '<span class="badge bg-primary">Giỏi</span>';
    if (d >= 6.5) return '<span class="badge bg-info text-dark">Khá</span>';
    if (d >= 5.0) return '<span class="badge bg-warning text-dark">Trung bình</span>';
    return '<span class="badge bg-danger">Yếu</span>';
}

// Render giao diện HTML chính
function renderPage({ sinhviens, editStudent = null, message = null, error = null, searchQuery = '' }) {
    const total = sinhviens.length;
    const avgScore = total > 0 
        ? (sinhviens.reduce((sum, sv) => sum + parseFloat(sv.diem), 0) / total).toFixed(2) 
        : '0.00';
    const maxScore = total > 0 
        ? Math.max(...sinhviens.map(sv => parseFloat(sv.diem))).toFixed(2) 
        : '0.00';

    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý Sinh viên - DTC241200007</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .navbar-brand { font-weight: 700; letter-spacing: 0.5px; }
        .card { border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .table-responsive { border-radius: 10px; overflow: hidden; }
        .stat-card { border-left: 5px solid; }
        .stat-primary { border-color: #0d6efd; }
        .stat-success { border-color: #198754; }
        .stat-warning { border-color: #ffc107; }
        .btn-action { margin: 0 2px; }
    </style>
</head>
<body>

    <!-- Header / Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div class="container">
            <a class="navbar-brand" href="/">
                <i class="fa-solid fa-graduation-cap me-2"></i>HỆ THỐNG QUẢN LÝ SINH VIÊN
            </a>
            <span class="navbar-text text-white">
                <i class="fa-solid fa-user-check me-1"></i> <strong>Vàng Thị Sinh</strong> (MSSV: <strong>DTC241200007</strong> - K23E)
            </span>
        </div>
    </nav>

    <div class="container my-4">

        <!-- Thông báo Alert -->
        ${message ? `<div class="alert alert-success alert-dismissible fade show" role="alert"><i class="fa-solid fa-circle-check me-2"></i>${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>` : ''}
        ${error ? `<div class="alert alert-danger alert-dismissible fade show" role="alert"><i class="fa-solid fa-triangle-exclamation me-2"></i>${error}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>` : ''}

        <!-- Thẻ thống kê (Stats Cards) -->
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="card p-3 stat-card stat-primary">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="text-muted small">Tổng số sinh viên</div>
                            <div class="fs-3 fw-bold text-primary">${total}</div>
                        </div>
                        <i class="fa-solid fa-users fa-2x text-primary opacity-50"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-3 stat-card stat-success">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="text-muted small">Điểm trung bình</div>
                            <div class="fs-3 fw-bold text-success">${avgScore}</div>
                        </div>
                        <i class="fa-solid fa-chart-line fa-2x text-success opacity-50"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-3 stat-card stat-warning">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="text-muted small">Điểm cao nhất</div>
                            <div class="fs-3 fw-bold text-warning">${maxScore}</div>
                        </div>
                        <i class="fa-solid fa-trophy fa-2x text-warning opacity-50"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <!-- Form Thêm mới / Cập nhật -->
            <div class="col-lg-4">
                <div class="card p-4">
                    <h5 class="card-title fw-bold text-primary mb-3">
                        <i class="fa-solid ${editStudent ? 'fa-pen-to-square' : 'fa-user-plus'} me-2"></i>
                        ${editStudent ? 'Cập nhật Sinh viên' : 'Thêm Sinh viên Mới'}
                    </h5>
                    
                    <form action="${editStudent ? `/edit/${editStudent.id}` : '/add'}" method="POST">
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Mã sinh viên (MSSV)</label>
                            <input type="text" class="form-control" name="masv" required 
                                value="${editStudent ? editStudent.masv : ''}" 
                                placeholder="Ví dụ: DTC241200007"
                                ${editStudent ? 'readonly' : ''}>
                            ${editStudent ? '<small class="text-muted">Mã sinh viên là duy nhất và không thể sửa.</small>' : ''}
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold">Họ và tên</label>
                            <input type="text" class="form-control" name="hoten" required 
                                value="${editStudent ? editStudent.hoten : ''}" 
                                placeholder="Ví dụ: Vàng Thị Sinh">
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold">Lớp học</label>
                            <input type="text" class="form-control" name="lop" required 
                                value="${editStudent ? editStudent.lop : ''}" 
                                placeholder="Ví dụ: CNTT-K23E">
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold">Điểm số (0 - 10)</label>
                            <input type="number" step="0.1" min="0" max="10" class="form-control" name="diem" required 
                                value="${editStudent ? editStudent.diem : ''}" 
                                placeholder="Ví dụ: 9.5">
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" class="btn ${editStudent ? 'btn-warning text-dark' : 'btn-primary'} fw-semibold">
                                <i class="fa-solid ${editStudent ? 'fa-check' : 'fa-plus'} me-1"></i>
                                ${editStudent ? 'Lưu thay đổi' : 'Thêm sinh viên'}
                            </button>
                            ${editStudent ? '<a href="/" class="btn btn-outline-secondary">Hủy bỏ</a>' : ''}
                        </div>
                    </form>
                </div>
            </div>

            <!-- Bảng Danh sách Sinh viên -->
            <div class="col-lg-8">
                <div class="card p-4">
                    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                        <h5 class="card-title fw-bold text-secondary mb-0">
                            <i class="fa-solid fa-list-check me-2"></i>Danh sách Sinh viên
                        </h5>
                        <!-- Ô tìm kiếm -->
                        <form action="/" method="GET" class="d-flex" style="max-width: 280px;">
                            <input type="text" name="q" class="form-control form-control-sm me-2" placeholder="Tìm tên hoặc MSSV..." value="${searchQuery}">
                            <button type="submit" class="btn btn-sm btn-outline-primary"><i class="fa-solid fa-search"></i></button>
                            ${searchQuery ? '<a href="/" class="btn btn-sm btn-outline-secondary ms-1"><i class="fa-solid fa-xmark"></i></a>' : ''}
                        </form>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-hover table-striped align-middle text-center mb-0">
                            <thead class="table-primary">
                                <tr>
                                    <th>STT</th>
                                    <th>Mã SV</th>
                                    <th class="text-start">Họ và tên</th>
                                    <th>Lớp</th>
                                    <th>Điểm</th>
                                    <th>Xếp loại</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sinhviens.length === 0 ? `
                                    <tr>
                                        <td colspan="7" class="py-4 text-muted">
                                            <i class="fa-solid fa-folder-open fa-2x mb-2 d-block"></i>
                                            ${searchQuery ? 'Không tìm thấy sinh viên phù hợp!' : 'Chưa có sinh viên nào trong danh sách.'}
                                        </td>
                                    </tr>
                                ` : sinhviens.map((sv, index) => `
                                    <tr>
                                        <td><strong>${index + 1}</strong></td>
                                        <td><span class="badge bg-light text-dark border font-monospace">${sv.masv}</span></td>
                                        <td class="text-start fw-semibold">${sv.hoten}</td>
                                        <td><span class="badge bg-secondary-subtle text-secondary-emphasis">${sv.lop}</span></td>
                                        <td><strong class="text-primary">${parseFloat(sv.diem).toFixed(1)}</strong></td>
                                        <td>${getRankBadge(sv.diem)}</td>
                                        <td>
                                            <a href="/?edit=${sv.id}" class="btn btn-sm btn-outline-warning btn-action" title="Sửa thông tin">
                                                <i class="fa-solid fa-pen"></i>
                                            </a>
                                            <a href="/delete/${sv.id}" class="btn btn-sm btn-outline-danger btn-action" 
                                               onclick="return confirm('Bạn có chắc chắn muốn xóa sinh viên ${sv.hoten} (${sv.masv}) không?');" 
                                               title="Xóa sinh viên">
                                                <i class="fa-solid fa-trash"></i>
                                            </a>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="text-center text-muted mt-5 py-3 border-top">
            <small>Dự án KTHP: Hệ thống Quản lý Sinh viên | Phát triển bằng <strong>Node.js (Express)</strong> & <strong>MySQL</strong> | Nginx Proxy Hardened</small>
        </footer>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

// --- CÁC ROUTE XỬ LÝ (CRUD) ---

// 1. READ: Lấy danh sách sinh viên & Hiển thị giao diện
app.get('/', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).send('<h2>Hệ thống CSDL đang khởi động, vui lòng tải lại trang sau giây lát...</h2>');
        }

        const searchQuery = req.query.q ? req.query.q.trim() : '';
        let querySql = 'SELECT * FROM sinhvien';
        let queryParams = [];

        if (searchQuery) {
            querySql += ' WHERE masv LIKE ? OR hoten LIKE ? OR lop LIKE ?';
            const term = `%${searchQuery}%`;
            queryParams = [term, term, term];
        }

        querySql += ' ORDER BY id DESC';
        const [sinhviens] = await pool.query(querySql, queryParams);

        // Kiểm tra xem người dùng có bấm Sửa hay không
        let editStudent = null;
        if (req.query.edit) {
            const editId = parseInt(req.query.edit, 10);
            const [rows] = await pool.query('SELECT * FROM sinhvien WHERE id = ?', [editId]);
            if (rows.length > 0) {
                editStudent = rows[0];
            }
        }

        res.send(renderPage({
            sinhviens,
            editStudent,
            message: req.query.msg || null,
            error: req.query.err || null,
            searchQuery
        }));
    } catch (err) {
        console.error('[Error GET /]:', err);
        res.status(500).send('Lỗi máy chủ: ' + err.message);
    }
});

// 2. CREATE: Thêm sinh viên mới
app.post('/add', async (req, res) => {
    const { masv, hoten, lop, diem } = req.body;
    try {
        if (!masv || !hoten || !lop || diem === undefined) {
            return res.redirect('/?err=' + encodeURIComponent('Vui lòng điền đầy đủ thông tin sinh viên!'));
        }

        await pool.query(
            'INSERT INTO sinhvien (masv, hoten, lop, diem) VALUES (?, ?, ?, ?)',
            [masv.trim(), hoten.trim(), lop.trim(), parseFloat(diem)]
        );

        res.redirect('/?msg=' + encodeURIComponent(`Thêm sinh viên ${hoten} (${masv}) thành công!`));
    } catch (err) {
        console.error('[Error POST /add]:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.redirect('/?err=' + encodeURIComponent(`Mã sinh viên "${masv}" đã tồn tại trên hệ thống!`));
        }
        res.redirect('/?err=' + encodeURIComponent('Lỗi khi thêm sinh viên: ' + err.message));
    }
});

// 3. UPDATE: Cập nhật thông tin sinh viên
app.post('/edit/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { hoten, lop, diem } = req.body;
    try {
        await pool.query(
            'UPDATE sinhvien SET hoten = ?, lop = ?, diem = ? WHERE id = ?',
            [hoten.trim(), lop.trim(), parseFloat(diem), id]
        );
        res.redirect('/?msg=' + encodeURIComponent(`Cập nhật thông tin sinh viên thành công!`));
    } catch (err) {
        console.error('[Error POST /edit]:', err);
        res.redirect('/?err=' + encodeURIComponent('Lỗi khi cập nhật sinh viên: ' + err.message));
    }
});

// 4. DELETE: Xóa sinh viên
app.get('/delete/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        await pool.query('DELETE FROM sinhvien WHERE id = ?', [id]);
        res.redirect('/?msg=' + encodeURIComponent('Xóa sinh viên thành công!'));
    } catch (err) {
        console.error('[Error GET /delete]:', err);
        res.redirect('/?err=' + encodeURIComponent('Lỗi khi xóa sinh viên: ' + err.message));
    }
});

// Route kiểm tra sức khỏe hệ thống (Health check)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', runtime: 'Node.js', timestamp: new Date() });
});

// Khởi chạy server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`[App] Quản lý Sinh viên (Node.js) đang chạy tại http://localhost:${PORT}`);
    });
});
