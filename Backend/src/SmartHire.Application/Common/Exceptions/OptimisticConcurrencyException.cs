namespace SmartHire.Application.Common.Exceptions;

public sealed class OptimisticConcurrencyException(Exception innerException)
    : Exception("A concurrent update changed the record.", innerException);
