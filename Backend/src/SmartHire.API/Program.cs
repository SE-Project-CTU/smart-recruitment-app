using SmartHire.Infrastructure;
using NLog.Web;
var builder = WebApplication.CreateBuilder(args);
// Đăng ký Infrastructure
builder.Services.AddInfrastructure(builder.Configuration);

// Cấu hình Logging
builder.Logging.ClearProviders();
builder.Host.UseNLog();
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
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
