using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Server.Models;

namespace Server.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Site> Sites => Set<Site>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<RemissionGuide> RemissionGuides => Set<RemissionGuide>();
    public DbSet<RemissionGuideItem> RemissionGuideItems => Set<RemissionGuideItem>();
    public DbSet<Dispatch> Dispatches => Set<Dispatch>();
    public DbSet<ContactRequest> ContactRequests => Set<ContactRequest>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<GuideEmail> GuideEmails => Set<GuideEmail>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<decimal>().HavePrecision(18, 2);
        configurationBuilder.Properties<Enum>().HaveConversion<string>().HaveMaxLength(32);
        // SQL Server no guarda el Kind: todas las fechas se almacenan en UTC y se leen como UTC.
        configurationBuilder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
    }

    private sealed class UtcDateTimeConverter() : ValueConverter<DateTime, DateTime>(
        value => value.Kind == DateTimeKind.Utc ? value : value.ToUniversalTime(),
        value => DateTime.SpecifyKind(value, DateTimeKind.Utc));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.FullName).HasMaxLength(120);
            entity.Property(u => u.Email).HasMaxLength(160);
            entity.Property(u => u.PasswordHash).HasMaxLength(256);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasOne(u => u.Site).WithMany().HasForeignKey(u => u.SiteId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity.Ignore(c => c.DisplayName);
            entity.Property(c => c.CompanyName).HasMaxLength(200);
            entity.Property(c => c.LegalName).HasMaxLength(200);
            entity.Property(c => c.Industry).HasMaxLength(250);
            entity.Property(c => c.FirstName).HasMaxLength(100);
            entity.Property(c => c.LastName).HasMaxLength(100);
            entity.Property(c => c.JobTitle).HasMaxLength(100);
            entity.Property(c => c.TaxId).HasMaxLength(11);
            entity.Property(c => c.PhoneNumber).HasMaxLength(30);
            entity.Property(c => c.Email).HasMaxLength(160);
            entity.Property(c => c.Website).HasMaxLength(200);
            entity.Property(c => c.Address).HasMaxLength(250);
            entity.Property(c => c.District).HasMaxLength(100);
            entity.Property(c => c.Province).HasMaxLength(100);
            entity.HasIndex(c => c.TaxId);
            entity.HasIndex(c => c.CompanyName);
        });

        modelBuilder.Entity<Site>(entity =>
        {
            entity.Property(s => s.Code).HasMaxLength(10);
            entity.Property(s => s.Name).HasMaxLength(120);
            entity.Property(s => s.Address).HasMaxLength(250);
            entity.Property(s => s.District).HasMaxLength(100);
            entity.Property(s => s.Province).HasMaxLength(100);
            entity.HasIndex(s => s.Code).IsUnique();
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(p => p.Code).HasMaxLength(20);
            entity.Property(p => p.Name).HasMaxLength(150);
            entity.Property(p => p.Description).HasMaxLength(300);
            entity.Property(p => p.UnitOfMeasure).HasMaxLength(10);
            entity.HasIndex(p => p.Code).IsUnique();
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.Property(v => v.Plate).HasMaxLength(10);
            entity.Property(v => v.Brand).HasMaxLength(60);
            entity.Property(v => v.Model).HasMaxLength(60);
            entity.HasIndex(v => v.Plate).IsUnique();
        });

        modelBuilder.Entity<Driver>(entity =>
        {
            entity.Property(d => d.FullName).HasMaxLength(120);
            entity.Property(d => d.DocumentNumber).HasMaxLength(12);
            entity.Property(d => d.LicenseNumber).HasMaxLength(20);
            entity.Property(d => d.PhoneNumber).HasMaxLength(20);
            entity.HasIndex(d => d.DocumentNumber).IsUnique();
        });

        modelBuilder.Entity<RemissionGuide>(entity =>
        {
            entity.Ignore(g => g.FullNumber);
            entity.Property(g => g.Series).HasMaxLength(4);
            entity.Property(g => g.DeliveryAddress).HasMaxLength(250);
            entity.Property(g => g.Notes).HasMaxLength(500);
            entity.HasIndex(g => new { g.Series, g.Number }).IsUnique();
            entity.HasIndex(g => g.Status);
            entity.HasOne(g => g.OriginSite).WithMany().HasForeignKey(g => g.OriginSiteId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(g => g.Client).WithMany().HasForeignKey(g => g.ClientId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(g => g.CreatedBy).WithMany().HasForeignKey(g => g.CreatedById).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(g => g.Dispatch).WithMany(d => d.Guides).HasForeignKey(g => g.DispatchId).OnDelete(DeleteBehavior.SetNull);
            entity.HasMany(g => g.Items).WithOne(i => i.RemissionGuide).HasForeignKey(i => i.RemissionGuideId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RemissionGuideItem>(entity =>
        {
            entity.Property(i => i.Description).HasMaxLength(250);
            entity.Property(i => i.UnitOfMeasure).HasMaxLength(10);
            entity.Property(i => i.Quantity).HasPrecision(18, 3);
            entity.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Dispatch>(entity =>
        {
            entity.Property(d => d.Code).HasMaxLength(20);
            entity.Property(d => d.Notes).HasMaxLength(500);
            entity.HasIndex(d => d.Code).IsUnique();
            entity.HasIndex(d => d.Status);
            entity.HasOne(d => d.Site).WithMany().HasForeignKey(d => d.SiteId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.Vehicle).WithMany().HasForeignKey(d => d.VehicleId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.Driver).WithMany().HasForeignKey(d => d.DriverId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(d => d.CreatedBy).WithMany().HasForeignKey(d => d.CreatedById).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ContactRequest>(entity =>
        {
            entity.Property(c => c.FullName).HasMaxLength(120);
            entity.Property(c => c.Company).HasMaxLength(150);
            entity.Property(c => c.Email).HasMaxLength(160);
            entity.Property(c => c.PhoneNumber).HasMaxLength(20);
            entity.Property(c => c.Message).HasMaxLength(1000);
        });

        modelBuilder.Entity<BlogPost>(entity =>
        {
            entity.Property(p => p.Title).HasMaxLength(200);
            entity.Property(p => p.Slug).HasMaxLength(220);
            entity.Property(p => p.Summary).HasMaxLength(400);
            entity.Property(p => p.Category).HasMaxLength(50);
            entity.Property(p => p.CoverArt).HasMaxLength(20);
            entity.Property(p => p.ExternalUrl).HasMaxLength(400);
            entity.HasIndex(p => p.Slug).IsUnique();
            entity.HasIndex(p => new { p.IsPublished, p.PublishedAt });
            entity.HasOne(p => p.Author).WithMany().HasForeignKey(p => p.AuthorId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<GuideEmail>(entity =>
        {
            entity.Property(e => e.To).HasMaxLength(320);
            entity.Property(e => e.Cc).HasMaxLength(320);
            entity.Property(e => e.Subject).HasMaxLength(200);
            entity.Property(e => e.InvoiceFileName).HasMaxLength(200);
            entity.Property(e => e.Error).HasMaxLength(500);
            entity.HasIndex(e => e.RemissionGuideId);
            entity.HasOne(e => e.RemissionGuide).WithMany().HasForeignKey(e => e.RemissionGuideId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.SentBy).WithMany().HasForeignKey(e => e.SentById).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
