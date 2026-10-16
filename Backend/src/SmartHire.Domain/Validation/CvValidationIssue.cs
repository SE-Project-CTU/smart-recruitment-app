namespace SmartHire.Domain.Validation;

public enum CvValidationFailure {
    Required,
    MaxLength,
    InvalidFormat
}

public sealed record CvValidationIssue(
    string Field,
    CvValidationFailure Failure,
    string Message
);
