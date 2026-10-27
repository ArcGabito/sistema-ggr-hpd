namespace Server.Models;

public class RemissionGuideItem
{
    public int Id { get; set; }
    public int RemissionGuideId { get; set; }
    public RemissionGuide? RemissionGuide { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public required string Description { get; set; }
    public decimal Quantity { get; set; }
    public required string UnitOfMeasure { get; set; }
    public decimal WeightKg { get; set; }
}
