// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Pomelo.Workflow.Models.EntityFramework;

namespace Pomelo.Workflow.Storage
{
    public interface IWorkflowDbContext
    {
        public DbSet<DbWorkflow> Workflows { get; set; }

        public DbSet<DbWorkflowVersion> WorkflowVersions { get; set; }

        public DbSet<DbWorkflowInstance> WorkflowInstances { get; set; }

        public DbSet<DbStep> WorkflowInstanceSteps { get; set; }

        public DbSet<DbWorkflowInstanceConnection> WorkflowInstanceConnections { get; set; }
    }
}
