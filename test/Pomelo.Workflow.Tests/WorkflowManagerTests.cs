// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Pomelo.Workflow.Storage;

namespace Pomelo.Workflow.Tests
{
    public class WorkflowManagerTests : IDisposable
    {
        readonly IServiceProvider services;

        public WorkflowManagerTests()
        {
            var collection = new ServiceCollection();
            collection.AddDbContext<WfContext>(x =>
            {
                var connStr = "Server=localhost;Uid=root;Pwd=123456;Database=wf-unittest";
                x.UseMySql(connStr, ServerVersion.AutoDetect(connStr), opt =>
                {
                    opt.UseNewtonsoftJson();
                });
            });
            collection.AddDbWorkflowStorageProvider<WfContext>();
            collection.AddWorkflowManager();
            services = collection.BuildServiceProvider();
            var db = services.GetRequiredService<WfContext>();
            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();
        }

        [Fact]
        public async Task SimpleStartFinishWorkflowTest()
        {
            using (var scope = services.CreateScope())
            {
                // Act
                var wf = scope.ServiceProvider.GetRequiredService<WorkflowManager>();
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

        [Fact]
        public async Task StartInstanceTwiceTest()
        {
            // Act
            await SimpleStartFinishWorkflowTest();
            await SimpleStartFinishWorkflowTest();
        }

        public void Dispose()
        {
        }
    }
}