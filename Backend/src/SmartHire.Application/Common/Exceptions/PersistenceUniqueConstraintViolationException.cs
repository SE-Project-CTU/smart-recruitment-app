namespace SmartHire.Application.Common.Exceptions;

/// <summary>
/// Indicates that a database unique constraint rejected a persistence operation.
/// </summary>
public sealed class PersistenceUniqueConstraintViolationException(
    string? constraintName,
    Exception innerException)
    : Exception("A database unique constraint was violated.", innerException) {
    public string? ConstraintName { get; } = constraintName;
}
