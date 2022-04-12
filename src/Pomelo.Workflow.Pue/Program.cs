using Pomelo.Workflow.Pue;

// Configure Service Collection
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();

// Configure Application
var app = builder.Build();
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UsePueMiddleware();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
