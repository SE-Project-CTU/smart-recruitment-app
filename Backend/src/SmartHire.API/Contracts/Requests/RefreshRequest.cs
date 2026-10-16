namespace SmartHire.Api.Contracts.Requests;

public sealed record RefreshRequest(
    [Required(ErrorMessage = "Refresh token is required.")]
    [MinLength(1, ErrorMessage = "Refresh token must not be empty.")]
    string RefreshToken
);
