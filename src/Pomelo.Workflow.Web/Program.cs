// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Converters;
using Pomelo.Vue.Middleware;
using Pomelo.Workflow;
using Pomelo.Workflow.Models.ViewModels;
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
    var connStr = builder.Configuration["Database"];
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
var db = scope.ServiceProvider.GetRequiredService<WfContext>();
var wf = scope.ServiceProvider.GetRequiredService<WorkflowManager>();
if (await db.Database.EnsureCreatedAsync())
{
    await wf.CreateWorkflowAsync(new CreateWorkflowRequest { Name = "Test Workflow", Description = "Description" });
}

app.Run();
