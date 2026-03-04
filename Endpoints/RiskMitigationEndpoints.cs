using FM17.Domain;
using FM17.Services;

namespace FM17.Endpoints;

public static class RiskMitigationEndpoints
{
    public static IEndpointRouteBuilder MapRiskMitigationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/mitigations");

        group.MapGet("/", (IRiskMitigationRepository repository) => Results.Ok(repository.GetAll()));

        group.MapGet("/{id:guid}", (Guid id, IRiskMitigationRepository repository) =>
        {
            var mitigation = repository.GetById(id);
            return mitigation is null ? Results.NotFound() : Results.Ok(mitigation);
        });

        group.MapPost("/", (RiskMitigation mitigation, IRiskMitigationRepository repository) =>
        {
            var created = repository.Add(mitigation);
            return Results.Created($"/api/mitigations/{created.Id}", created);
        });

        group.MapPut("/{id:guid}", (Guid id, RiskMitigation mitigation, IRiskMitigationRepository repository) =>
        {
            var updated = repository.Update(id, mitigation);
            return updated ? Results.NoContent() : Results.NotFound();
        });

        group.MapDelete("/{id:guid}", (Guid id, IRiskMitigationRepository repository) =>
        {
            var deleted = repository.Delete(id);
            return deleted ? Results.NoContent() : Results.NotFound();
        });

        return app;
    }
}
