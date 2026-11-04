using NSwag.AspNetCore;

namespace SmartHire.Api.OpenApi;

public static class OpenApiExtensions
{
    public static IServiceCollection AddAppOpenApi(this IServiceCollection services)
    {
        services.AddOpenApi(options =>
        {
            options.AddOperationTransformer<CorrelationIdOperationTransformer>();
        });

        return services;
    }

    public static WebApplication UseAppOpenApi(this WebApplication app)
    {
        app.MapOpenApi();
        app.UseSwaggerUi(options =>
        {
            options.DocumentPath = "/openapi/v1.json";
        });

        return app;
    }
}
