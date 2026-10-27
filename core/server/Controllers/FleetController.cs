using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Dtos;
using Server.Models;

namespace Server.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public class FleetController(AppDbContext context) : ControllerBase
{
    [HttpGet("vehicles")]
    public async Task<IReadOnlyList<VehicleResponse>> GetVehicles(CancellationToken cancellationToken) =>
        (await context.Vehicles.AsNoTracking().OrderBy(v => v.Plate).ToListAsync(cancellationToken))
            .Select(v => v.ToResponse()).ToList();

    [HttpPost("vehicles")]
    [Authorize(Roles = "Admin,Supervisor")]
    public async Task<ActionResult<VehicleResponse>> CreateVehicle(CreateVehicleRequest request, CancellationToken cancellationToken)
    {
        var plate = request.Plate.Trim().ToUpperInvariant();
        if (await context.Vehicles.AnyAsync(v => v.Plate == plate, cancellationToken))
        {
            return Problem(statusCode: StatusCodes.Status409Conflict, title: "Ya existe un vehículo con esa placa.");
        }

        var vehicle = new Vehicle { Plate = plate, Brand = request.Brand.Trim(), Model = request.Model.Trim(), CapacityKg = request.CapacityKg };
        context.Vehicles.Add(vehicle);
        await context.SaveChangesAsync(cancellationToken);
        return Created($"/api/vehicles/{vehicle.Id}", vehicle.ToResponse());
    }

    [HttpGet("drivers")]
    public async Task<IReadOnlyList<DriverResponse>> GetDrivers(CancellationToken cancellationToken) =>
        (await context.Drivers.AsNoTracking().OrderBy(d => d.FullName).ToListAsync(cancellationToken))
            .Select(d => d.ToResponse()).ToList();

    [HttpPost("drivers")]
    [Authorize(Roles = "Admin,Supervisor")]
    public async Task<ActionResult<DriverResponse>> CreateDriver(CreateDriverRequest request, CancellationToken cancellationToken)
    {
        if (await context.Drivers.AnyAsync(d => d.DocumentNumber == request.DocumentNumber, cancellationToken))
        {
            return Problem(statusCode: StatusCodes.Status409Conflict, title: "Ya existe un conductor con ese DNI.");
        }

        var driver = new Driver
        {
            FullName = request.FullName.Trim(),
            DocumentNumber = request.DocumentNumber,
            LicenseNumber = request.LicenseNumber.Trim().ToUpperInvariant(),
            PhoneNumber = request.PhoneNumber
        };
        context.Drivers.Add(driver);
        await context.SaveChangesAsync(cancellationToken);
        return Created($"/api/drivers/{driver.Id}", driver.ToResponse());
    }
}
