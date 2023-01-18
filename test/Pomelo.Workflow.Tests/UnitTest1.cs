using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Pomelo.Workflow.Storage;

namespace Pomelo.Workflow.Tests
{
    public class UnitTest1
    {
        [Fact]
        public async Task Test1()
        {
            // Arrange
            var collection = new ServiceCollection();
            collection.AddDbContext<WfContext>(x => 
            {
                var connStr = "Server=localhost;Uid=root;Pwd=123456;Database=wf-test";
                x.UseMySql(connStr, ServerVersion.AutoDetect(connStr), opt => 
                {
                    opt.UseNewtonsoftJson();
                });
            });
            collection.AddDbWorkflowStorageProvider<WfContext>();
            collection.AddWorkflowManager();
            var services = collection.BuildServiceProvider();

            // Act
            var db = services.GetRequiredService<WfContext>();
            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();
            var wf = services.GetRequiredService<WorkflowManager>();
            var wfId = await wf.CreateWorkflowAsync(new Models.ViewModels.CreateWorkflowRequest 
            {
                Name = "Test",
                Description = "Test workflow"
            }, true);
            var newInstanceResult = await wf.CreateNewWorkflowInstanceAsync(wfId, 1, null);
            await wf.StartWorkflowInstanceAsync(newInstanceResult.InstanceId);
        }
    }
}