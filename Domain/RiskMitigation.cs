namespace FM17.Domain;

public class RiskMitigation
{
    public Guid Id { get; set; }
    public string RiskSourceId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SeverityLevel { get; set; }
    public string MitigationOwner { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public RiskMitigationStatus Status { get; set; } = RiskMitigationStatus.Open;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
