using Microsoft.EntityFrameworkCore;
using SmartHire.Application;
using SmartHire.Infrastructure;
using SmartHire.Infrastructure.Persistence;
using NLog.Web;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.PostgreSql;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using SmartHire.Api;
using SmartHire.Api.Contracts.Errors;
using SmartHire.Api.Factories;
using SmartHire.Api.Middleware;
using SmartHire.Application.Common.Errors;

var builder = WebApplication.CreateBuilder(args);

// Đăng ký Infrastructure (EF Core, pgvector)
builder.Services.AddInfrastructure(builder.Configuration);

// Cấu hình Logging
builder.Logging.ClearProviders();
builder.Host.UseNLog();

// Đăng ký Hangfire
var hangfireConnection =
    builder.Configuration.GetConnectionString("HangfireConnection")
    ?? throw new InvalidOperationException(
        "Connection string 'HangfireConnection' was not configured.");

builder.Services.AddHangfire(configuration =>
    configuration.UsePostgreSqlStorage(options =>
        options.UseNpgsqlConnection(hangfireConnection)));

builder.Services.AddHangfireServer();

builder.Services.AddApiServices();

builder.Services.AddOpenApi();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddApplication();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ApiResponseFactory>();

builder.Services.AddJwtBearerAuthentication(builder.Configuration);

var app = builder.Build();

// ── Use App exception and middleware
app.UseExceptionHandler();
app.UseMiddleware<CorrelationIdMiddleware>();

// ── Auto-migrate: áp dụng tất cả migration pending khi khởi động ──
using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<SmartHireDbContext>();
    db.Database.Migrate();
}

// ── OpenAPI / Swagger UI ──
app.MapOpenApi();
app.UseSwaggerUi(options => { options.DocumentPath = "/openapi/v1.json"; });

// ── Hangfire Dashboard ──
app.UseHangfireDashboard("/hangfire", new DashboardOptions {
    Authorization = Array.Empty<IDashboardAuthorizationFilter>()
});

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers().RequireAuthorization();

app.Run();