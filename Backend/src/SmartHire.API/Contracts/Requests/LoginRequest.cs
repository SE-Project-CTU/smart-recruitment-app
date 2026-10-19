namespace SmartHire.Api.Contracts.Requests;

public sealed record LoginRequest(
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email format is invalid.")]
    [StringLength(254, ErrorMessage = "Email must not exceed 254 characters.")]
    string Email,
    [Required(ErrorMessage = "Password is required.")]
    string Password
);
