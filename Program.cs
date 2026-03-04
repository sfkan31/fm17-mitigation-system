var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// Enable static file hosting (wwwroot)
app.UseStaticFiles();

// Health check endpoint
app.MapGet("/health", () => Results.Ok("FM17 running"));

// Route boundary for FM17
var fm17 = app.MapGroup("/fm17");

fm17.MapGet("/", () => Results.Ok("FM17 API root"));

app.Run();
