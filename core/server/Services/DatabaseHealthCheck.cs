using Microsoft.Extensions.Diagnostics.HealthChecks;
using Server.Data;

namespace Server.Services;

/// <summary>
/// Comprueba la conexión a la base. Además la despierta: Azure SQL serverless se pausa tras un
/// tiempo sin uso y se reanuda con la primera conexión.
/// </summary>
public class DatabaseHealthCheck(AppDbContext context) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext healthContext, CancellationToken cancellationToken = default) =>
        await context.Database.CanConnectAsync(cancellationToken)
            ? HealthCheckResult.Healthy()
            : HealthCheckResult.Unhealthy("La base de datos no responde.");
}
