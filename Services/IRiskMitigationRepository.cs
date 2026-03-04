using FM17.Domain;

namespace FM17.Services;

public interface IRiskMitigationRepository
{
    IReadOnlyCollection<RiskMitigation> GetAll();
    RiskMitigation? GetById(Guid id);
    RiskMitigation Add(RiskMitigation mitigation);
    bool Update(Guid id, RiskMitigation mitigation);
    bool Delete(Guid id);
}
