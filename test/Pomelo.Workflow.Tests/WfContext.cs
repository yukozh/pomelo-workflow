using Microsoft.EntityFrameworkCore;
using Pomelo.Workflow.Models.EntityFramework;
using Pomelo.Workflow.Storage;

namespace Pomelo.Workflow.Tests
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

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);

            var connStr = "Server=localhost;Uid=root;Pwd=123456;Database=wf-test";
            optionsBuilder.UseMySql(connStr, ServerVersion.AutoDetect(connStr));
        }
    }
}
