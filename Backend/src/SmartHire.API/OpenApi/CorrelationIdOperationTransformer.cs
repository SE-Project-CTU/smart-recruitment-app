using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace SmartHire.Api.OpenApi;

public sealed class CorrelationIdOperationTransformer : IOpenApiOperationTransformer
{
    public Task TransformAsync(
        OpenApiOperation operation,
        OpenApiOperationTransformerContext context,
        CancellationToken cancellationToken)
    {
        operation.Parameters ??= new List<IOpenApiParameter>();
        operation.Parameters.Add(new OpenApiParameter
        {
            Name = "X-Correlation-ID",
            In = ParameterLocation.Header,
            Required = true,
            Description = "Correlation ID"
        });

        return Task.CompletedTask;
    }
}
