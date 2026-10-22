using Microsoft.EntityFrameworkCore;
using SmartHire.Application;
using SmartHire.Infrastructure;
using SmartHire.Infrastructure.BackgroundJobs;
using SmartHire.Infrastructure.Persistence;
using SmartHire.Infrastructure.Seeding;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Features.JobPostings.Jobs.ExpireOverdueJobPostings;
using NLog.Web;
using DotNetEnv;
using SmartHire.Api;
using SmartHire.Api.Factories;
using SmartHire.Api.Middleware;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using DependencyInjection = SmartHire.Api.DependencyInjection;

Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

// Đăng ký Infrastructure (EF Core, pgvector)
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHangfireBackgroundJobs(builder.Configuration);

// Cấu hình Logging
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

builder.Services.AddRateLimiter(options => {
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("media-upload", httpContext => {
        var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? httpContext.User.FindFirst("sub")?.Value
                     ?? httpContext.Connection.RemoteIpAddress?.ToString()
                     ?? "anonymous";

        return RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: userId,
            factory: _ => new FixedWindowRateLimiterOptions {
                PermitLimit = 20,
                Window = TimeSpan.FromHours(1),
                QueueLimit = 0
            });
    });
});

var app = builder.Build();

app.UseCors(DependencyInjection.PolicyName);

// ── Use App exception and middleware
app.UseExceptionHandler();
app.UseMiddleware<CorrelationIdMiddleware>();

// ── Auto-migrate: áp dụng tất cả migration pending khi khởi động ──
using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<SmartHireDbContext>();
    db.Database.Migrate();

    var adminAccountSeeder = scope.ServiceProvider.GetRequiredService<AdminAccountSeeder>();
    await adminAccountSeeder.SeedAsync();

    var jobScheduler = scope.ServiceProvider.GetRequiredService<IBackgroundJobScheduler>();
    jobScheduler.AddOrUpdateRecurring<ExpireOverdueJobPostingsJob, ExpireOverdueJobPostingsJobArgs>(
        "expire-overdue-job-postings",
        new ExpireOverdueJobPostingsJobArgs(),
        new RecurringSchedule(
            RecurringScheduleKind.Daily,
            TimeOfDay: new TimeOnly(0, 5),
            TimeZoneId: "Asia/Ho_Chi_Minh")
    );
}

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
