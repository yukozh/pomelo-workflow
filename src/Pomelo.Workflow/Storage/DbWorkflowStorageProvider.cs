﻿using Microsoft.EntityFrameworkCore;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.EntityFramework;
using Pomelo.Workflow.Models.ViewModels;

namespace Pomelo.Workflow.Storage
{
    public class DbWorkflowStorageProvider<TDbContext> 
        : WorkflowStorageProviderBase
        where TDbContext : DbContext, IWorkflowDbContext
    {
        readonly TDbContext db;

        public DbWorkflowStorageProvider(TDbContext db)
        {
            this.db = db;
        }

        public override async ValueTask<Guid> CreateWorkflowAsync(CreateWorkflowRequest request, CancellationToken cancellationToken)
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

        public override async ValueTask<int> CreateWorkflowVersion(Guid id, CreateWorkflowVersionRequest request, CancellationToken cancellationToken)
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

        public override async ValueTask DeleteWorkflowAsync(Guid id, CancellationToken cancellationToken = default)
        {
            if (await db.WorkflowVersions.AnyAsync(x => x.WorkflowId == id, cancellationToken))
            {
                throw new InvalidOperationException("There are workflow versions already created, cannot delete workflow.");
            }

            var workflow = await db.Workflows.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
            db.Workflows.Remove(workflow);
            await db.SaveChangesAsync(cancellationToken);
        }

        public override async ValueTask<Models.Workflow> GetWorkflowAsync(Guid id, CancellationToken cancellationToken = default)
            => await db.Workflows.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        public override async ValueTask<IEnumerable<Models.Workflow>> GetWorkflowsAsync(CancellationToken cancellationToken = default)
            => await db.Workflows.ToListAsync(cancellationToken);

        public override async ValueTask<WorkflowVersion> GetWorkflowVersionAsync(Guid id, int version, CancellationToken cancellationToken)
            => await db.WorkflowVersions.FirstOrDefaultAsync(x => x.WorkflowId == id && x.Version == version, cancellationToken);

        public override async ValueTask<IEnumerable<GetWorkflowVersionResponse>> GetWorkflowVersionsAsync(Guid id, CancellationToken cancellationToken = default)
            => await db.WorkflowVersions
                .Where(x => x.WorkflowId == id)
                .Select(x => new GetWorkflowVersionResponse 
                {
                    Diagram = x.Diagram,
                    WorkflowId = x.WorkflowId,
                    Version = x.Version
                }).ToListAsync(cancellationToken);

        public override async ValueTask UpdateWorkflowAsync(Guid id, UpdateWorkflowRequest request, CancellationToken cancellationToken)
        {
            var workflow = await db.Workflows
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            workflow.Name = request.Name;
            workflow.Description = request.Description;
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
            });

            builder.Entity<DbStep>(e =>
            {
                e.Property(x => x.Type).HasMaxLength(64);
                e.HasIndex(x => new { x.WorkflowInstanceId, x.Order });
            });

            return builder;
        }
    }
}