# MindX Onboarding - Week 1: Fullstack App Deployment on Azure AKS

Dự án này là bài tập tuần đầu tiên trong chương trình Onboarding, tập trung vào việc thiết lập và triển khai một ứng dụng Fullstack (Node.js & React) lên hạ tầng Cloud sử dụng Azure Kubernetes Service (AKS).

## Thông tin cá nhân
- **Họ và tên:** Đỗ Anh Quân.

## Thông tin dự án 
- **Link Live:** [https://135.171.144.185.nip.io](https://135.171.144.185.nip.io).

## Cấu trúc dự án
- `/frontend`: Mã nguồn ứng dụng React (Vite + TypeScript).
- `/backend`: Mã nguồn Node.js Express API.
- `/backend/k8s`: Chứa các file cấu hình Kubernetes (Deployment, Service, Ingress, Secret).
- `/frontend/k8s` : Chứa file cấu hình Kubernetes (frontend-development)
- `/docs/plans/week-1`: Tài liệu chi tiết về hệ thống.
- `deploy.sh`: Script tự động hóa quy trình Build và Deploy.

## 🚀 Công nghệ sử dụng
- **Cloud:** Azure AKS, Azure Container Registry (ACR).
- **DevOps:** Docker, Kubernetes, Nginx Ingress, Cert-manager.
- **Auth:** OpenID Connect (OIDC) tích hợp MindX ID.

## 📖 Tài liệu chi tiết Tuần 1
1. [Hướng dẫn Setup môi trường](./docs/plans/week1/setup.md).
2. [Chi tiết luồng xác thực Auth Flow](./docs/plans/week1/authflow.md).
3. [Hướng dẫn triển khai Deployment](./docs/plans/week1/deployment.md).
4. [Hướng dẫn kiểm thử Demo](./docs/plans/week1/demo.md).


## MindX Onboarding - Week 2: Observability & Monitoring

Mục tiêu của tuần này là thiết lập hệ thống quan sát toàn diện (Full-stack Observability), cho phép theo dõi hiệu năng, chẩn đoán lỗi tầng sâu và phân tích hành vi người dùng trên nền tảng Cloud.

## Công nghệ sử dụng 
* **APM & Logging**: Azure Application Insights (tích hợp SDK Node.js).
* **Alerting**: Azure Monitor Alerts (Email notification for incidents).
* **Product Analytics**: Google Analytics 4 (GA4) cho Frontend React.

## 📝 Tài liệu chi tiết Tuần 2
1. [Tổng quan hệ thống giám sát](./docs/plans/week2/overview.md)
2. [Hướng dẫn cấu hình và Setup](./docs/plans/week2/setup.md)
3. [Định nghĩa chỉ số và Dashboard](./docs/plans/week2/metrics.md)
4. [Tích hợp Google Analytics 4](./docs/plans/week2/ga4.md)
5. [Báo cáo Demo Nghiệm thu](./docs/plans/week2/demo.md)