using FM17.Domain;

namespace FM17.Services;

public class RiskMitigationRepository : IRiskMitigationRepository
{
    private readonly List<RiskMitigation> _mitigations = [];

    public IReadOnlyCollection<RiskMitigation> GetAll() => _mitigations.AsReadOnly();

    public RiskMitigation? GetById(Guid id) => _mitigations.FirstOrDefault(m => m.Id == id);

    public RiskMitigation Add(RiskMitigation mitigation)
    {
        var timestamp = DateTime.UtcNow;

        mitigation.Id = mitigation.Id == Guid.Empty ? Guid.NewGuid() : mitigation.Id;
        mitigation.CreatedAt = mitigation.CreatedAt == default ? timestamp : mitigation.CreatedAt;
        mitigation.UpdatedAt = timestamp;

        _mitigations.Add(mitigation);
        return mitigation;
    }

    public bool Update(Guid id, RiskMitigation mitigation)
    {
        var existing = GetById(id);
        if (existing is null)
        {
            return false;
        }

        existing.RiskSourceId = mitigation.RiskSourceId;
        existing.Title = mitigation.Title;
        existing.Description = mitigation.Description;
        existing.SeverityLevel = mitigation.SeverityLevel;
        existing.MitigationOwner = mitigation.MitigationOwner;
        existing.DueDate = mitigation.DueDate;
        existing.Status = mitigation.Status;
        existing.UpdatedAt = DateTime.UtcNow;

        return true;
    }

    public bool Delete(Guid id)
    {
        var existing = GetById(id);
        if (existing is null)
        {
            return false;
        }

        _mitigations.Remove(existing);
        return true;
    }
}
