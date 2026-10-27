using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Dtos;
using Server.Models;
using Server.Services;

namespace Server.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext context, ITokenService tokenService) : ControllerBase
{
    private static readonly PasswordHasher<User> PasswordHasher = new();

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await context.Users
            .Include(u => u.Site)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        var result = user is null
            ? PasswordVerificationResult.Failed
            : PasswordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (user is null || !user.IsActive || result == PasswordVerificationResult.Failed)
        {
            return Problem(statusCode: StatusCodes.Status401Unauthorized, title: "Credenciales inválidas.");
        }

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = PasswordHasher.HashPassword(user, request.Password);
        }

        user.LastLoginAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        var (token, expiresAt) = tokenService.CreateToken(user);
        return new LoginResponse(token, expiresAt, ToResponse(user));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserResponse>> Me(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var user = await context.Users
            .AsNoTracking()
            .Include(u => u.Site)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive, cancellationToken);

        return user is null ? Unauthorized() : ToResponse(user);
    }

    private static UserResponse ToResponse(User user) =>
        new(user.Id, user.FullName, user.Email, user.Role.ToString(), user.Site?.Name);
}
