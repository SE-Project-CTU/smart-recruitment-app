# syntax=docker/dockerfile:1

# ==========================================
# STAGE 1: RESTORE & BUILD
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# SmartHire.slnx nằm ở gốc context (Backend/)
COPY SmartHire.slnx ./

# Copy từng .csproj riêng để tận dụng Docker layer cache cho bước restore
COPY src/SmartHire.API/SmartHire.Api.csproj                         src/SmartHire.API/
COPY src/SmartHire.Application/SmartHire.Application.csproj         src/SmartHire.Application/
COPY src/SmartHire.Domain/SmartHire.Domain.csproj                   src/SmartHire.Domain/
COPY src/SmartHire.Infrastructure/SmartHire.Infrastructure.csproj   src/SmartHire.Infrastructure/

RUN dotnet restore SmartHire.slnx

# Chỉ copy thư mục src/ (bỏ qua dotnet-tools.json, .env, v.v. ở Backend root)
COPY src/ src/
RUN dotnet publish src/SmartHire.API/SmartHire.Api.csproj \
    --no-restore \
    -c Release \
    -o /app/publish

# ==========================================
# STAGE 2: RUNTIME (image nhỏ hơn, không có SDK)
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

# ASP.NET Core lắng nghe HTTP trên 8080 trong container (không cần HTTPS vì
# reverse proxy / Docker network xử lý TLS ở tầng ngoài)
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "SmartHire.Api.dll"]
