# Thiết lập Môi trường (Setup Guide)

Tài liệu mô tả các công cụ và quy trình cần thiết để khởi chạy dự án cục bộ và chuẩn bị cho triển khai.

## 1. Yêu cầu hệ thống (Prerequisites)
- **Node.js**: Môi trường thực thi cho Backend và Frontend.
- **Docker & Docker Desktop**: Công cụ đóng gói ứng dụng thành container.
- **Azure CLI**: Giao diện dòng lệnh để quản lý tài nguyên Cloud Azure.
- **kubectl**: Công cụ điều phối Cluster Kubernetes.

## 2. Cấu hình Biến môi trường (Environment Variables)
Ứng dụng yêu cầu các biến sau để hoạt động (được lưu trong file `.env` hoặc Kubernetes Secrets):
- `CLIENT_ID`: Mã định danh ứng dụng trên MindX ID.
- `CLIENT_SECRET`: Mã bảo mật ứng dụng (được mã hóa Base64 trong K8s).
- `OIDC_ISSUER`: URL nhà cung cấp danh tính (`https://id-dev.mindx.edu.vn`).
- `SESSION_SECRET`: Chuỗi ký số cho Session.

## 3. Quy trình khởi tạo
1. **Đăng nhập Cloud**: Thực hiện `az login` và `az acr login --name quanregistry2026`.
2. **Cài đặt thư viện**: Chạy `npm install` tại cả hai thư mục `backend` và `frontend`.
3. **Build Image**: Sử dụng Docker để build image với tag version (ví dụ: `v2`).