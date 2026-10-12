using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Formatters;
using SmartHire.Api.Contracts.Errors;
using SmartHire.Api.Middleware;
using SmartHire.Application.Common.Errors;

namespace SmartHire.Api.Factories;

public static class ApiModelStateResponseFactory
{
    public static IActionResult Create(ActionContext actionContext)
    {
        var details = new List<AppErrorDetail>();
        var hasBodyParsingError = false;
        var missingBody = actionContext.HttpContext.Request.ContentLength == 0;

        foreach (var entry in actionContext.ModelState)
        {
            foreach (var modelError in entry.Value.Errors)
            {
                var jsonException = FindJsonException(modelError.Exception);
                var isParsingError = jsonException is not null ||
                                    HasInputFormatterException(modelError.Exception);
                hasBodyParsingError |= isParsingError;

                var field = GetFieldName(entry.Key, jsonException?.Path);
                var isMissingBodyError = isParsingError &&
                                         (missingBody || IsMissingBodyMessage(modelError.ErrorMessage));
                var isUnknownField = isParsingError &&
                                     field != "body" &&
                                     !HasRequestProperty(actionContext, field);

                var reason = isMissingBodyError
                    ? ValidationReasons.Required
                    : isUnknownField
                        ? ValidationReasons.NotAllowed
                        : isParsingError
                            ? ValidationReasons.InvalidFormat
                            : GetValidationReason(actionContext, entry.Key, modelError);

                var message = isMissingBodyError
                    ? "Request body is required."
                    : isUnknownField
                        ? $"Field '{field}' is not allowed in this request."
                        : isParsingError
                            ? field == "body"
                                ? "Request body contains malformed JSON or has an invalid structure."
                                : $"Value for '{field}' is missing or has an invalid format."
                            : modelError.ErrorMessage;

                details.Add(new AppErrorDetail(field, reason, message));
            }
        }

        if (details.Count == 0)
        {
            details.Add(new AppErrorDetail(
                "body",
                ValidationReasons.InvalidFormat,
                "Request body is invalid."));
        }

        var correlationId =
            actionContext.HttpContext.Items[CorrelationIdMiddleware.ItemKey]?.ToString()
            ?? Guid.NewGuid().ToString("D");

        var error = new ApiError(
            CommonErrorCodes.InvalidRequestBody,
            hasBodyParsingError
                ? missingBody
                    ? "Request body is required."
                    : "Request body could not be parsed."
                : "Request body contains invalid fields.",
            details);

        var statusCode = hasBodyParsingError
            ? StatusCodes.Status400BadRequest
            : StatusCodes.Status422UnprocessableEntity;

        return new ObjectResult(new ApiErrorResponse(error, correlationId))
        {
            StatusCode = statusCode
        };
    }

    private static string GetFieldName(string modelStateKey, string? jsonPath)
    {
        var path = !string.IsNullOrWhiteSpace(jsonPath) ? jsonPath : modelStateKey;
        if (string.IsNullOrWhiteSpace(path) || path is "$" or "request" or "body")
        {
            return "body";
        }

        path = path.TrimStart('$', '.');
        if (path.StartsWith("request.", StringComparison.OrdinalIgnoreCase))
        {
            path = path["request.".Length..];
        }

        return string.Join('.', path.Split('.').Select(segment =>
            segment.Length == 0 || segment[0] == '['
                ? segment
                : char.ToLowerInvariant(segment[0]) + segment[1..]));
    }

    private static string GetValidationReason(
        ActionContext actionContext,
        string modelStateKey,
        ModelError modelError)
    {
        var attribute = FindMatchingAttribute(actionContext, modelStateKey, modelError.ErrorMessage);

        return attribute switch
        {
            RequiredAttribute => ValidationReasons.Required,
            StringLengthAttribute stringLength => GetStringLengthReason(
                actionContext.ModelState[modelStateKey]?.AttemptedValue,
                stringLength),
            MinLengthAttribute => ValidationReasons.MinLength,
            MaxLengthAttribute => ValidationReasons.MaxLength,
            _ => ValidationReasons.InvalidFormat
        };
    }

    private static string GetStringLengthReason(string? value, StringLengthAttribute attribute) =>
        value is not null && value.Trim().Length < attribute.MinimumLength
            ? ValidationReasons.MinLength
            : ValidationReasons.MaxLength;

    private static ValidationAttribute? FindMatchingAttribute(
        ActionContext actionContext,
        string modelStateKey,
        string errorMessage)
    {
        var (parameterType, propertyName) = GetBodyProperty(actionContext, modelStateKey);
        if (parameterType is null || propertyName is null)
        {
            return null;
        }

        var metadataProvider = actionContext.HttpContext.RequestServices
            .GetRequiredService<IModelMetadataProvider>();
        var property = metadataProvider.GetMetadataForType(parameterType).Properties
            .FirstOrDefault(metadata => string.Equals(
                metadata.PropertyName,
                propertyName,
                StringComparison.OrdinalIgnoreCase));

        return property?.ValidatorMetadata
            .OfType<ValidationAttribute>()
            .FirstOrDefault(attribute => string.Equals(
                attribute.FormatErrorMessage(property.GetDisplayName()),
                errorMessage,
                StringComparison.Ordinal));
    }

    private static (Type? ParameterType, string? PropertyName) GetBodyProperty(
        ActionContext actionContext,
        string modelStateKey)
    {
        var parameter = actionContext.ActionDescriptor.Parameters.FirstOrDefault(candidate =>
            candidate.BindingInfo?.BindingSource == BindingSource.Body)
            ?? actionContext.ActionDescriptor.Parameters.FirstOrDefault(candidate =>
                candidate.ParameterType.IsClass && candidate.ParameterType != typeof(string));

        if (parameter is null)
        {
            return (null, null);
        }

        var field = GetFieldName(modelStateKey, null);
        var propertyName = field.Split('.').LastOrDefault();
        return (parameter.ParameterType, propertyName == "body" ? null : propertyName);
    }

    private static bool HasRequestProperty(ActionContext actionContext, string field)
    {
        var parameter = actionContext.ActionDescriptor.Parameters.FirstOrDefault(candidate =>
            candidate.BindingInfo?.BindingSource == BindingSource.Body)
            ?? actionContext.ActionDescriptor.Parameters.FirstOrDefault(candidate =>
                candidate.ParameterType.IsClass && candidate.ParameterType != typeof(string));

        if (parameter is null)
        {
            return false;
        }

        var propertyName = field.Split('.').LastOrDefault();
        return parameter.ParameterType.GetProperties().Any(property =>
            string.Equals(property.Name, propertyName, StringComparison.OrdinalIgnoreCase));
    }

    private static JsonException? FindJsonException(Exception? exception)
    {
        while (exception is not null)
        {
            if (exception is JsonException jsonException)
            {
                return jsonException;
            }

            exception = exception.InnerException;
        }

        return null;
    }

    private static bool HasInputFormatterException(Exception? exception)
    {
        while (exception is not null)
        {
            if (exception is InputFormatterException)
            {
                return true;
            }

            exception = exception.InnerException;
        }

        return false;
    }

    private static bool IsMissingBodyMessage(string? message) =>
        message?.Contains("non-empty request body is required", StringComparison.OrdinalIgnoreCase) == true;
}
