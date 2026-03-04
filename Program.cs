using FM17.Endpoints;
using FM17.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IRiskMitigationRepository, RiskMitigationRepository>();

var app = builder.Build();

app.UseStaticFiles();

app.MapGet("/health", () => Results.Ok("FM17 running"));

var fm17 = app.MapGroup("/fm17");
fm17.MapGet("/", () => Results.Ok("FM17 API root"));

app.MapRiskMitigationEndpoints();

app.Run();
