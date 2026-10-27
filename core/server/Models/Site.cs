namespace Server.Models;

public class Site
{
    public int Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public SiteType Type { get; set; }
    public required string Address { get; set; }
    public required string District { get; set; }
    public required string Province { get; set; }
    public bool IsActive { get; set; } = true;
}
