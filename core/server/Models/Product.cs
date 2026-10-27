namespace Server.Models;

public class Product
{
    public int Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public ProductCategory Category { get; set; }
    public string UnitOfMeasure { get; set; } = "UND";
    public bool IsActive { get; set; } = true;
}
