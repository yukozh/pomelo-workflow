using Pomelo.Vue.Middleware;

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

app.UseRouting();

app.UseAuthorization();

app.UsePomeloVueMiddleware(x =>
{
    x.AssetsVersion = "20230102";
    x.MappingPomeloVueJs = false;
    x.MappingBase = "/assets/js/pomelo-vue/";
});

app.Run();
