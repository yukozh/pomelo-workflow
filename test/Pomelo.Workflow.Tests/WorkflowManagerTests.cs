// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Pomelo.Workflow.Storage;

namespace Pomelo.Workflow.Tests
{
    public class WorkflowManagerTests
    {
        [Fact]
        public async Task SimpleStartFinishWorkflowTest()
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
            var instanceDiagram = await wf.GetInstanceDiagramAsync(newInstanceResult.InstanceId);

            // Assert
            Assert.Equal(Models.WorkflowStatus.Finished, instanceDiagram.Status);
            Assert.True(instanceDiagram.Shapes.All(x => x.Status == Models.StepStatus.Succeeded));
        }
    }
}