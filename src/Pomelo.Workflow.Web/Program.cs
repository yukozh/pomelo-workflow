// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Converters;
using Pomelo.Vue.Middleware;
using Pomelo.Workflow;
using Pomelo.Workflow.Storage;
using Pomelo.Workflow.Web.Models;

// Configure Service Collection
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
        options.SerializerSettings.DateFormatString = "yyyy'-'MM'-'dd'T'HH':'mm':'ssZ";
        options.SerializerSettings.Converters.Add(new StringEnumConverter());
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        options.SerializerSettings.Formatting = Newtonsoft.Json.Formatting.Indented;
    })
    .AddControllersAsServices();

builder.Services.AddDbContext<WfContext>(x =>
{
    var connStr = "Server=localhost;Uid=root;Pwd=123456;Database=wf-test";
    x.UseMySql(connStr, ServerVersion.AutoDetect(connStr), opt =>
    {
        opt.UseNewtonsoftJson();
    });
});

builder.Services.AddDbWorkflowStorageProvider<WfContext>();
builder.Services.AddWorkflowManager();

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
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllerRoute("default", "{controller=Home}/{action=Index}");
});
app.UsePomeloVueMiddleware(x =>
{
    x.AssetsVersion = "20230119";
    x.MappingPomeloVueJs = false;
    x.MappingBase = "/assets/js/pomelo-vue/";
});
using var scope = app.Services.CreateScope();
await scope.ServiceProvider.GetRequiredService<WfContext>().Database.EnsureCreatedAsync();

app.Run();
