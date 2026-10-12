using System.ComponentModel.DataAnnotations;

namespace SmartHire.Api.Contracts.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
public sealed class NotEmptyGuidAttribute : ValidationAttribute
{
    public override bool IsValid(object? value) =>
        value is null || value is Guid id && id != Guid.Empty;
}
