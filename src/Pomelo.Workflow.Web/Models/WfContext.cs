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

        public DbSet<DbStep> Steps { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.SetupWorkflow();
        }
    }
}
