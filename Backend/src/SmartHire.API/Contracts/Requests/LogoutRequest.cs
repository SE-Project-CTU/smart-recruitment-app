using System.ComponentModel.DataAnnotations;

namespace SmartHire.Api.Contracts.Requests;

public sealed record LogoutRequest(
    [MinLength(1, ErrorMessage = "Refresh token must not be empty when provided.")]
    string? RefreshToken = null,
    bool AllSessions = false
);
