using Microsoft.EntityFrameworkCore;
using Pomelo.Workflow.Models.EntityFramework;

namespace Pomelo.Workflow.Storage
{
    public interface IWorkflowDbContext
    {
        public DbSet<DbWorkflow> Workflows { get; set; }

        public DbSet<DbWorkflowVersion> WorkflowVersions { get; set; }

        public DbSet<DbWorkflowInstance> WorkflowInstances { get; set; }

        public DbSet<DbStep> Steps { get; set; }
    }
}
