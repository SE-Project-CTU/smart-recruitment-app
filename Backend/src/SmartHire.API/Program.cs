using Microsoft.EntityFrameworkCore;
using SmartHire.Application;
using SmartHire.Infrastructure;
using SmartHire.Infrastructure.Persistence;
using NLog.Web;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.PostgreSql;
using DotNetEnv;
using SmartHire.Api;
using SmartHire.Api.Factories;
using SmartHire.Api.Middleware;
using DependencyInjection = SmartHire.Api.DependencyInjection;

Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

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

var app = builder.Build();

app.UseCors(DependencyInjection.PolicyName);

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