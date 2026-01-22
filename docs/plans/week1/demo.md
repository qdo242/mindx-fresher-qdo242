# MindX Onboarding - Week 1: Fullstack App Deployment on Azure AKS
# Kiểm thử Dự án (Demo Guide)

Tài liệu này hướng dẫn cách truy cập và kiểm tra các tính năng kỹ thuật của dự án.

## 1. Truy cập sản phẩm
- **Địa chỉ:** `https://135.171.144.185.nip.io`.
- **Thông tin tài khoản test**:
    - email: intern@mindx.com.vn
    - password: mindx1234



## 2. Các bước kiểm thử tính năng (User Flow)
1. **Trang chủ**: Khi chưa đăng nhập, hệ thống hiển thị nút **"Đăng nhập với MindX ID"**.
2. **Xác thực**: Bấm vào nút đăng nhập, hệ thống chuyển hướng sang `https://id-dev.mindx.edu.vn`.
3. **Kết quả**: Sau khi đăng nhập thành công, trang web sẽ hiển thị **Tên người dùng** lấy từ Claims của Token (Phần ID định danh đã được ẩn để đảm bảo thẩm mỹ theo yêu cầu).
4. **Đăng xuất**: Bấm nút **"Đăng xuất"**, hệ thống xóa Session và quay lại trạng thái chưa đăng nhập ban đầu.

## 3. Kiểm tra hạ tầng kỹ thuật (Technical Verification)

- kubectl get pods (Trạng thái pods)
- kubectl describe ingress main-ingress (Kiểm tra định tuyến Ingress & Path Rewrite)
- kubectl get endpoints backend-api-service ( Kiểm tra dịch vụ)
- kubectl get certificate backend-app-tls (Trạng thái chứng chỉ Let's Encrypt)
- curl https://135.171.144.185.nip.io/api/health (Kiểm tra endpoint)
