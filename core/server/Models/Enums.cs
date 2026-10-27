namespace Server.Models;

public enum UserRole
{
    Admin,
    Supervisor,
    Operator
}

public enum ProductCategory
{
    Glass,
    Aluminum,
    Decorative
}

public enum SiteType
{
    Headquarters,
    Sales,
    ProcessingPlant
}

public enum TransferReason
{
    Sale,
    TransferBetweenSites,
    Return,
    Other
}

public enum RemissionGuideStatus
{
    Draft,
    Issued,
    InTransit,
    Delivered,
    Cancelled
}

public enum DispatchStatus
{
    Scheduled,
    Loading,
    InTransit,
    Completed,
    Cancelled
}
