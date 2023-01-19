// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Pomelo.Workflow.Models.EntityFramework;
using Pomelo.Workflow.Storage;

namespace Pomelo.Workflow.Web.Models
{
    public class WfContext : DbContext, IWorkflowDbContext
    {
        public WfContext(DbContextOptions<WfContext> opt) : base(opt)
        { }

        public DbSet<DbWorkflow> Workflows { get; set; }

        public DbSet<DbWorkflowVersion> WorkflowVersions { get; set; }

        public DbSet<DbWorkflowInstance> WorkflowInstances { get; set; }

        public DbSet<DbStep> WorkflowInstanceSteps { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.SetupWorkflow();
        }
    }
}
