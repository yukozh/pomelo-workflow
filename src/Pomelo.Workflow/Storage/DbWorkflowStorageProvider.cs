using Microsoft.EntityFrameworkCore;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.EntityFramework;
using Pomelo.Workflow.Models.ViewModels;

namespace Pomelo.Workflow.Storage
{
    public class DbWorkflowStorageProvider<TDbContext> 
        : IWorkflowStorageProvider
        where TDbContext : DbContext, IWorkflowDbContext
    {
        readonly TDbContext db;

        public DbWorkflowStorageProvider(TDbContext db)
        {
            this.db = db;
        }

        public async ValueTask<Guid> CreateWorkflowAsync(CreateWorkflowRequest request, CancellationToken cancellationToken)
        {
            var workflow = new DbWorkflow
            {
                Description = request.Description,
                Name = request.Name
            };
            db.Workflows.Add(workflow);

            await db.SaveChangesAsync(cancellationToken);
            return workflow.Id;
        }

        public async ValueTask<int> CreateWorkflowVersion(Guid id, CreateWorkflowVersionRequest request, CancellationToken cancellationToken)
        {
            if (!await db.Workflows.AnyAsync(x => x.Id == id, cancellationToken))
            {
                throw new KeyNotFoundException(id.ToString());
            }

            var workflowVersion = new DbWorkflowVersion
            {
                Diagram = request.Diagram,
                WorkflowId = id,
                Version = await db.WorkflowVersions.CountAsync(x => x.WorkflowId == id, cancellationToken) + 1
            };
            db.WorkflowVersions.Add(workflowVersion);
            await db.SaveChangesAsync(cancellationToken);
            return workflowVersion.Version;
        }

        public async ValueTask DeleteWorkflowAsync(Guid id, CancellationToken cancellationToken = default)
        {
            if (await db.WorkflowVersions.AnyAsync(x => x.WorkflowId == id, cancellationToken))
            {
                throw new InvalidOperationException("There are workflow versions already created, cannot delete workflow.");
            }

            var workflow = await db.Workflows.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            db.Workflows.Remove(workflow);
            await db.SaveChangesAsync(cancellationToken);
        }

        public async ValueTask<Models.Workflow> GetWorkflowAsync(Guid id, CancellationToken cancellationToken = default)
            => await db.Workflows.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        public async ValueTask<IEnumerable<Models.Workflow>> GetWorkflowsAsync(string name = null, CancellationToken cancellationToken = default)
        {
            IQueryable<DbWorkflow> workflows = db.Workflows;

            if (name != null)
            {
                workflows = workflows.Where(x => x.Name.Contains(name));
            }

            return await workflows.ToListAsync(cancellationToken);
        }

        public async ValueTask<WorkflowVersion> GetWorkflowVersionAsync(Guid id, int version, CancellationToken cancellationToken)
            => await db.WorkflowVersions.FirstOrDefaultAsync(x => x.WorkflowId == id && x.Version == version, cancellationToken);

        public async ValueTask<IEnumerable<GetWorkflowVersionResponse>> GetWorkflowVersionsAsync(Guid id, CancellationToken cancellationToken = default)
            => await db.WorkflowVersions
                .Where(x => x.WorkflowId == id)
                .Select(x => new GetWorkflowVersionResponse 
                {
                    Diagram = x.Diagram,
                    WorkflowId = x.WorkflowId,
                    Version = x.Version
                }).ToListAsync(cancellationToken);

        public async ValueTask UpdateWorkflowAsync(Guid id, UpdateWorkflowRequest request, CancellationToken cancellationToken)
        {
            var workflow = await db.Workflows
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            workflow.Name = request.Name;
            workflow.Description = request.Description;
            await db.SaveChangesAsync(cancellationToken);
        }

        public async ValueTask<int?> GetLatestVersionAsync(
            Guid id,
            WorkflowVersionStatus? status = WorkflowVersionStatus.Available,
            CancellationToken cancellationToken = default)
        {
            IQueryable<DbWorkflowVersion> workflowVersions = db.WorkflowVersions
                .Where(x => x.WorkflowId == id);

            if (status.HasValue)
            {
                workflowVersions = workflowVersions.Where(x => x.Status == status);
            }

            return await workflowVersions
                .OrderByDescending(x => x.Version)
                .Select(x => x.Version)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async ValueTask UpdateWorkflowVersionStatusAsync(
            Guid id, 
            int version, 
            WorkflowVersionStatus status, 
            CancellationToken cancellationToken = default)
        {
            var workflowVersion = await db.WorkflowVersions
                .Where(x => x.WorkflowId == id && x.Version == version)
                .FirstOrDefaultAsync(cancellationToken);

            if (workflowVersion == null)
            {
                throw new KeyNotFoundException($"The workflow version {id} #{version} was not found");
            }

            workflowVersion.Status = status;
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    public static class DbWorkflowStorageProviderExtensions
    {
        public static ModelBuilder SetupWorkflow(this ModelBuilder builder)
        {
            builder.Entity<DbWorkflow>(e =>
            {
                e.Property(x => x.Name).HasMaxLength(64);
                e.HasIndex(x => x.Name);
                e.HasMany(x => x.Versions).WithOne(x => x.Workflow);
                e.HasMany(x => x.Instances).WithOne(x => x.Workflow);
            });

            builder.Entity<DbWorkflowVersion>(e =>
            {
                e.HasKey(x => new { x.WorkflowId, x.Version });
            });

            builder.Entity<DbWorkflowInstance>(e =>
            {
                e.HasIndex(x => new { x.WorkflowId, x.WorkflowVersion });
                e.HasMany(x => x.Steps).WithOne(x => x.WorkflowInstance);
                e.Property(x => x.Arguments).HasColumnType("json");
            });

            builder.Entity<DbStep>(e =>
            {
                e.Property(x => x.Type).HasMaxLength(64);
                e.Property(x => x.Arguments).HasColumnType("json");
                e.HasIndex(x => new { x.WorkflowInstanceId, x.Order });
            });

            return builder;
        }
    }
}
