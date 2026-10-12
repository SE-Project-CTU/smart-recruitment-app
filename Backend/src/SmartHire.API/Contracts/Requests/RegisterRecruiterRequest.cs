namespace SmartHire.Api.Contracts.Requests;

public sealed record RegisterRecruiterRequest(
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email format is invalid.")]
    [StringLength(254, ErrorMessage = "Email must not exceed 254 characters.")]
    string Email,
    [RegularExpression(RequestValidationPatterns.VietnamesePhone,
        ErrorMessage = "Phone must be a valid Vietnamese mobile number (0xxxxxxxxx or +84xxxxxxxxx).")]
    string? Phone,
    [Required(ErrorMessage = "Password is required.")]
    [MinLength(8, ErrorMessage = "Password must contain at least 8 characters.")]
    string Password,
    [Required(ErrorMessage = "Full name is required.")]
    [StringLength(100, MinimumLength = 2,
        ErrorMessage = "Full name must contain between 2 and 100 characters.")]
    string FullName
);
