using System.ComponentModel.DataAnnotations;

namespace Server.Dtos;

public record LoginRequest(
    [Required, EmailAddress, MaxLength(160)] string Email,
    [Required, MinLength(8), MaxLength(128)] string Password);

public record UserResponse(int Id, string FullName, string Email, string Role, string? SiteName);

public record LoginResponse(string Token, DateTime ExpiresAt, UserResponse User);
