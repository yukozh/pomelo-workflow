using Microsoft.EntityFrameworkCore;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.EntityFramework;
using Pomelo.Workflow.Models.ViewModels;
using Newtonsoft.Json.Linq;

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

        public async ValueTask<IEnumerable<GetWorkflowVersionResult>> GetWorkflowVersionsAsync(Guid id, CancellationToken cancellationToken = default)
            => await db.WorkflowVersions
                .Where(x => x.WorkflowId == id)
                .Select(x => new GetWorkflowVersionResult 
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

        public async ValueTask<Guid> CreateWorkflowInstanceAsync(
            Guid id,
            int version,
            Dictionary<string, JToken> arguments,
            CancellationToken cancellationToken = default)
        {
            var workflowVersion = db.WorkflowVersions
                .FirstOrDefaultAsync(x => x.WorkflowId == id && x.Version == version, cancellationToken);

            if (workflowVersion == null)
            {
                throw new KeyNotFoundException($"The workflow version {id} #{version} was not found");
            }

            var instance = new DbWorkflowInstance
            {
                Arguments = arguments,
                Status = WorkflowStatus.NotStarted,
                WorkflowId = id,
                WorkflowVersion = version
            };
            db.WorkflowInstances.Add(instance);
            await db.SaveChangesAsync(cancellationToken);
            return instance.Id;
        }

        public async ValueTask<Guid> CreateWorkflowStepAsync(
            Guid instanceId,
            Step step,
            CancellationToken cancellationToken)
        {
            var _step = new DbStep
            {
                Arguments = step.Arguments,
                ShapeId = step.ShapeId,
                Status = StepStatus.NotStarted,
                CreatedAt = step.CreatedAt,
                Error = step.Error,
                WorkflowInstanceId = instanceId,
                Type = step.Type
            };
            db.Steps.Add(_step);
            await db.SaveChangesAsync(cancellationToken);
            return step.Id;
        }

        public async ValueTask<WorkflowInstance> GetWorkflowInstanceAsync(
            Guid instanceId, 
            CancellationToken cancellationToken)
            => await db.WorkflowInstances
                .FirstOrDefaultAsync(x => x.Id == instanceId, cancellationToken);

        public async ValueTask<UpdateWorkflowInstanceResult> UpdateWorkflowInstanceAsync(
            Guid instanceId,
            WorkflowStatus status, 
            Action<Dictionary<string, JToken>> updateArgumentsDelegate, 
            CancellationToken cancellationToken = default)
        {
            var instance = await db.WorkflowInstances
                .FirstOrDefaultAsync(x => x.Id == instanceId, cancellationToken);

            if (instance == null)
            {
                throw new KeyNotFoundException($"Workflow instance {instanceId} was not found");
            }

            var ret = new UpdateWorkflowInstanceResult 
            {
                NewStatus = status,
                OldStatus = instance.Status
            };

            instance.Status = status;
            updateArgumentsDelegate?.Invoke(instance.Arguments);
            await db.SaveChangesAsync(cancellationToken);

            return ret;
        }

        public async ValueTask<UpdateWorkflowStepResult> UpdateWorkflowStepAsync(
            Guid stepId, 
            StepStatus status, 
            Action<Dictionary<string, JToken>> updateArgumentsDelegate, 
            string error = null,
            CancellationToken cancellationToken = default)
        {
            var step = await db.Steps
                .FirstOrDefaultAsync(x => x.Id == stepId, cancellationToken);

            if (step == null)
            {
                throw new KeyNotFoundException($"Workflow step {stepId} was not found");
            }

            var ret = new UpdateWorkflowStepResult
            {
                NewStatus = status,
                PreviousStatus = step.Status
            };

            step.Status = status;
            if (error != null)
            {
                step.Error = error;
            }
            updateArgumentsDelegate?.Invoke(step.Arguments);
            await db.AddRangeAsync(cancellationToken);
            return ret;
        }

        public async ValueTask<Step> GetStepByShapeId(
            Guid instanceId, 
            Guid shapeId, 
            CancellationToken cancellationToken = default)
            => await db.Steps.FirstOrDefaultAsync(x => x.ShapeId == shapeId, cancellationToken);

        public async ValueTask<Step> GetStepAsync(
            Guid stepId,
            CancellationToken cancellationToken = default)
            => await db.Steps.FirstOrDefaultAsync(x => x.Id == stepId, cancellationToken);

        public async ValueTask<GetPreviousStepsResult> GetPreviousStepsAsync(
            Guid stepId,
            CancellationToken cancellationToken = default)
        {
            var step = await GetStepAsync(stepId, cancellationToken);
            var instance = await GetWorkflowInstanceAsync(step.WorkflowInstanceId, cancellationToken);
            var workflowVersion = await GetWorkflowVersionAsync(instance.WorkflowId, instance.WorkflowVersion, cancellationToken);
            var diagram = workflowVersion.Diagram;
            var shapeIds = diagram.ConnectPolylines
                .Where(x => x.DestinationShapeGuid == step.ShapeId)
                .Select(x => x.DepartureShapeGuid)
                .ToList();
            var steps = await db.Steps
                .Where(x => x.WorkflowInstanceId == instance.Id && shapeIds.Contains(x.ShapeId))
                .ToListAsync(cancellationToken);
            var ret = new GetPreviousStepsResult 
            {
                ShapeIds = shapeIds,
                Steps = steps
            };
            return ret;
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
                e.HasIndex(x => new { x.WorkflowInstanceId, x.ShapeId });
            });

            return builder;
        }
    }
}
