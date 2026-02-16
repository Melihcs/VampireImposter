using VampireImposter.Api.Application;
using VampireImposter.Api.Application.Security;
using VampireImposter.Storage;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IPlayerStore, InMemoryPlayerStore>();
builder.Services.AddSingleton<IGameStore, InMemoryGameStore>();
builder.Services.AddSingleton<IGameOrchestrator, GameOrchestrator>();
builder.Services
    .AddOptions<PasscodeSecurityOptions>()
    .Bind(builder.Configuration.GetSection(PasscodeSecurityOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddSingleton<IGamePasscodeService, Pbkdf2GamePasscodeService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
