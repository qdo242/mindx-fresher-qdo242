#!/bin/bash
# Script tự động hóa quy trình CI/CD cơ bản

# 1. Build & Push Image lên Azure
docker build -t quanregistry2026.azurecr.io/backend-api:v3 ./backend
docker push quanregistry2026.azurecr.io/backend-api:v3

docker build -t quanregistry2026.azurecr.io/frontend-app:v2.2 ./frontend
docker push quanregistry2026.azurecr.io/frontend-app:v2.2

# 2. Apply cấu hình K8s (backend)
kubectl apply -f backend/k8s/auth-secret.yaml
kubectl apply -f backend/k8s/deployment.yaml
kubectl apply -f backend/k8s/service.yaml
kubectl apply -f backend/k8s/ingress.yaml

#3. Apply cấu hình K8s (frontend)
kubectl apply -f frontend/k8s/frontend-deployment.yaml

# 3. Làm mới ứng dụng
kubectl rollout restart deployment/backend-api-deployment
kubectl rollout restart deployment/frontend-deployment