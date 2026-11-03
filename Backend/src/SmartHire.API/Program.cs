using SmartHire.Application;
using SmartHire.Infrastructure;
using SmartHire.Infrastructure.BackgroundJobs;
using SmartHire.Infrastructure.Persistence;
using NLog.Web;
using DotNetEnv;
using SmartHire.Api;
using SmartHire.Api.Factories;
using SmartHire.Api.Middleware;
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

builder.Services.AddOpenApi(options => {
    options.AddOperationTransformer((operation, context, cancellationToken) => {
        operation.Parameters ??= new List<Microsoft.OpenApi.IOpenApiParameter>();
        operation.Parameters.Add(new Microsoft.OpenApi.OpenApiParameter {
            Name = "X-Correlation-ID",
            In = Microsoft.OpenApi.ParameterLocation.Header,
            Required = true,
            Description = "Correlation ID (UUID format, ví dụ: 550e8400-e29b-41d4-a716-446655440000)"
        });
        return Task.CompletedTask;
    });
});
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
app.MapOpenApi();
app.UseSwaggerUi(options => { options.DocumentPath = "/openapi/v1.json"; });

// ── Background-job dashboard ──
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.UseBackgroundJobDashboard();

app.MapControllers().RequireAuthorization();
app.MapHub<SmartHire.Api.Hubs.NotificationHub>("/hubs/notifications");

app.Run();