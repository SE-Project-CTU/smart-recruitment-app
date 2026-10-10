using System.ComponentModel.DataAnnotations;
using System.Text;

namespace SmartHire.Infrastructure.Security.Validation;

/// <summary>
/// Validates a string's encoded UTF-8 byte count rather than its character count.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class MinimumUtf8ByteLengthAttribute : ValidationAttribute
{
    public MinimumUtf8ByteLengthAttribute(int minimumBytes)
    {
        if (minimumBytes < 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(minimumBytes),
                "Minimum byte count cannot be negative.");
        }

        MinimumBytes = minimumBytes;
    }

    public int MinimumBytes { get; }

    public override bool IsValid(object? value)
    {
        // RequiredAttribute is responsible for null values.
        if (value is null)
        {
            return true;
        }

        return value is string text && Encoding.UTF8.GetByteCount(text) >= MinimumBytes;
    }

    public override string FormatErrorMessage(string name) =>
        $"{name} must contain at least {MinimumBytes} UTF-8 bytes.";
}
