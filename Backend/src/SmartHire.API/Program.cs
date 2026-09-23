using SmartHire.Infrastructure;
using NLog.Web;
using Hangfire;
using Hangfire.PostgreSql;
var builder = WebApplication.CreateBuilder(args);
// Đăng ký Infrastructure
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
// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUi(options =>
    {
        options.DocumentPath = "/openapi/v1.json";
    });
    app.UseHangfireDashboard("/hangfire");
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
