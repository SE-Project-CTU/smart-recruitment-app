using SmartHire.Application;
using SmartHire.Infrastructure;
using SmartHire.Infrastructure.BackgroundJobs;
using SmartHire.Infrastructure.Persistence;
using NLog.Web;
using DotNetEnv;
using SmartHire.Api;
using SmartHire.Api.Factories;
using SmartHire.Api.Middleware;
using SmartHire.Api.OpenApi;
using DependencyInjection = SmartHire.Api.DependencyInjection;

Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

// EF Core, pgvector
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHangfireBackgroundJobs(builder.Configuration);

// Logging
builder.Logging.ClearProviders();
builder.Host.UseNLog();

builder.Services.AddApiServices();
builder.Services.AddAppCors(builder.Configuration);
builder.Services.AddAppOpenApi();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddApplication();

builder.Services.AddScoped<ApiResponseFactory>();

builder.Services.AddJwtBearerAuthentication(builder.Configuration);

builder.Services.AddAppRateLimiter();

var app = builder.Build();

app.UseCors(DependencyInjection.PolicyName);

// ── Use App exception and middleware
app.UseExceptionHandler();
app.UseMiddleware<CorrelationIdMiddleware>();

// ── Khởi tạo Database, Seed dữ liệu và Đăng ký Background Jobs ──
await app.ApplyDatabaseMigrationsAndSeedAsync();
app.UseRecurringBackgroundJobs();

// ── OpenAPI / Swagger UI ──
app.UseAppOpenApi();

// ── Background-job dashboard ──
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.UseBackgroundJobDashboard();

app.MapControllers().RequireAuthorization();
app.MapHub<SmartHire.Api.Hubs.NotificationHub>("/hubs/notifications");

app.Run();
