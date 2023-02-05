// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;
using System.Threading.Tasks;
using System.Threading;
using System.Collections.Generic;
using System.Linq;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.EntityFramework;
using Pomelo.Workflow.Models.ViewModels;
using Newtonsoft.Json.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

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

        public async Task<Guid> CreateWorkflowAsync(CreateWorkflowRequest request, CancellationToken cancellationToken)
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

        public async Task<int> CreateWorkflowVersion(
            Guid workflowId, 
            CreateWorkflowVersionRequest request,
            CancellationToken cancellationToken)
        {
            if (!await db.Workflows.AsNoTracking().AnyAsync(x => x.Id == workflowId, cancellationToken))
            {
                throw new KeyNotFoundException(workflowId.ToString());
            }

            var workflowVersion = new DbWorkflowVersion
            {
                Diagram = request.Diagram,
                WorkflowId = workflowId,
                Version = await db.WorkflowVersions
                    .CountAsync(x => x.WorkflowId == workflowId, cancellationToken) + 1
            };
            db.WorkflowVersions.Add(workflowVersion);
            await db.SaveChangesAsync(cancellationToken);
            return workflowVersion.Version;
        }

        public async Task DeleteWorkflowAsync(
            Guid workflowId, 
            CancellationToken cancellationToken = default)
        {
            if (await db.WorkflowVersions
                .AnyAsync(x => x.WorkflowId == workflowId, cancellationToken))
            {
                throw new InvalidOperationException("There are workflow versions already created, cannot delete workflow.");
            }

            var workflow = await db.Workflows
                .FirstOrDefaultAsync(x => x.Id == workflowId, cancellationToken);
            db.Workflows.Remove(workflow);
            await db.SaveChangesAsync(cancellationToken);
        }

        public async Task<Models.Workflow> GetWorkflowAsync(
            Guid workflowId, 
            CancellationToken cancellationToken = default)
            => await db.Workflows.FirstOrDefaultAsync(x => x.Id == workflowId, cancellationToken);

        public async Task<IEnumerable<Models.Workflow>> GetWorkflowsAsync(
            string name = null, 
            CancellationToken cancellationToken = default)
        {
            IQueryable<DbWorkflow> workflows = db.Workflows;

            if (name != null)
            {
                workflows = workflows.Where(x => x.Name.Contains(name));
            }

            return await workflows.ToListAsync(cancellationToken);
        }

        public async Task<WorkflowVersion> GetWorkflowVersionAsync(
            Guid workflowId, 
            int version, 
            CancellationToken cancellationToken)
            => await db.WorkflowVersions
                .FirstOrDefaultAsync(x => x.WorkflowId == workflowId && x.Version == version, cancellationToken);

        public async Task<IEnumerable<GetWorkflowVersionResult>> GetWorkflowVersionsAsync(
            Guid workflowId,
            CancellationToken cancellationToken = default)
            => await db.WorkflowVersions
                .Where(x => x.WorkflowId == workflowId)
                .Select(x => new GetWorkflowVersionResult 
                {
                    Diagram = x.Diagram,
                    WorkflowId = x.WorkflowId,
                    Version = x.Version,
                    Status = x.Status
                }).ToListAsync(cancellationToken);

        public async Task UpdateWorkflowAsync(
            Guid workflowId, 
            UpdateWorkflowRequest request,
            CancellationToken cancellationToken)
        {
            var workflow = await db.Workflows
                .FirstOrDefaultAsync(x => x.Id == workflowId, cancellationToken);

            workflow.Name = request.Name;
            workflow.Description = request.Description;
            await db.SaveChangesAsync(cancellationToken);
        }

        public async Task<int?> GetLatestVersionAsync(
            Guid workflowId,
            WorkflowVersionStatus? status = WorkflowVersionStatus.Available,
            CancellationToken cancellationToken = default)
        {
            IQueryable<DbWorkflowVersion> workflowVersions = db.WorkflowVersions
                .Where(x => x.WorkflowId == workflowId);

            if (status.HasValue)
            {
                workflowVersions = workflowVersions.Where(x => x.Status == status);
            }

            return await workflowVersions
                .OrderByDescending(x => x.Version)
                .Select(x => x.Version)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task UpdateWorkflowVersionStatusAsync(
            Guid workflowId, 
            int version, 
            WorkflowVersionStatus status, 
            CancellationToken cancellationToken = default)
        {
            var workflowVersion = await db.WorkflowVersions
                .Where(x => x.WorkflowId == workflowId && x.Version == version)
                .FirstOrDefaultAsync(cancellationToken);

            if (workflowVersion == null)
            {
                throw new KeyNotFoundException($"The workflow version {workflowId} #{version} was not found");
            }

            workflowVersion.Status = status;
            await db.SaveChangesAsync(cancellationToken);
        }

        public async Task<Guid> CreateWorkflowInstanceAsync(
            Guid workflowId,
            int version,
            Dictionary<string, JToken> arguments,
            CancellationToken cancellationToken = default)
        {
            var workflowVersion = await db.WorkflowVersions
                .FirstOrDefaultAsync(x => x.WorkflowId == workflowId && x.Version == version, cancellationToken);

            if (workflowVersion == null)
            {
                throw new KeyNotFoundException($"The workflow version {workflowId} #{version} was not found");
            }

            var instance = new DbWorkflowInstance
            {
                Arguments = arguments,
                Status = WorkflowStatus.NotStarted,
                WorkflowId = workflowId,
                WorkflowVersion = version
            };
            db.WorkflowInstances.Add(instance);
            await db.SaveChangesAsync(cancellationToken);
            return instance.Id;
        }

        public async Task<Guid> CreateWorkflowStepAsync(
            Guid instanceId,
            WorkflowInstanceStep step,
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
            db.WorkflowInstanceSteps.Add(_step);
            await db.SaveChangesAsync(cancellationToken);
            return _step.Id;
        }

        public async Task<WorkflowInstance> GetWorkflowInstanceAsync(
            Guid instanceId, 
            CancellationToken cancellationToken)
            => await db.WorkflowInstances
                .FirstOrDefaultAsync(x => x.Id == instanceId, cancellationToken);

        public async Task<UpdateWorkflowInstanceResult> UpdateWorkflowInstanceAsync(
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
            instance.UpdatedAt = DateTime.UtcNow;
            updateArgumentsDelegate?.Invoke(instance.Arguments);
            await db.SaveChangesAsync(cancellationToken);

            return ret;
        }

        public async Task<UpdateWorkflowStepResult> UpdateWorkflowStepAsync(
            Guid stepId, 
            StepStatus status, 
            Action<Dictionary<string, JToken>> updateArgumentsDelegate, 
            string error = null,
            CancellationToken cancellationToken = default)
        {
            var step = await db.WorkflowInstanceSteps
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
            step.UpdatedAt = DateTime.UtcNow;
            if (error != null)
            {
                step.Error = error;
            }
            updateArgumentsDelegate?.Invoke(step.Arguments);
            await db.SaveChangesAsync(cancellationToken);
            await UpdateWorkflowInstanceUpdateTimeAsync(step.WorkflowInstanceId, cancellationToken);
            return ret;
        }

        public async Task<WorkflowInstanceStep> GetStepByShapeIdAsync(
            Guid instanceId, 
            Guid shapeId, 
            CancellationToken cancellationToken = default)
            => await db.WorkflowInstanceSteps
            .FirstOrDefaultAsync(x => x.WorkflowInstanceId == instanceId 
                && x.ShapeId == shapeId, cancellationToken);

        public async Task<WorkflowInstanceStep> GetWorkflowInstanceStepAsync(
            Guid stepId,
            CancellationToken cancellationToken = default)
            => await db.WorkflowInstanceSteps.AsNoTracking().FirstOrDefaultAsync(x => x.Id == stepId, cancellationToken);

        public async Task<GetPreviousStepsResult> GetPreviousStepsAsync(
            Guid stepId,
            CancellationToken cancellationToken = default)
        {
            var step = await GetWorkflowInstanceStepAsync(stepId, cancellationToken);
            var instance = await GetWorkflowInstanceAsync(step.WorkflowInstanceId, cancellationToken);
            var workflowVersion = await GetWorkflowVersionAsync(instance.WorkflowId, instance.WorkflowVersion, cancellationToken);
            var diagram = workflowVersion.Diagram;
            var shapeIds = diagram.ConnectPolylines
                .Where(x => x.DestinationShapeGuid == step.ShapeId)
                .Select(x => x.DepartureShapeGuid)
                .ToList();
            var steps = await db.WorkflowInstanceSteps
                .Where(x => x.WorkflowInstanceId == instance.Id && shapeIds.Contains(x.ShapeId))
                .ToListAsync(cancellationToken);
            var ret = new GetPreviousStepsResult 
            {
                ShapeIds = shapeIds,
                Steps = steps
            };
            return ret;
        }

        public async Task UpdateWorkflowInstanceUpdateTimeAsync(
            Guid instanceId, 
            CancellationToken cancellationToken = default)
        {
            var instance = await db.WorkflowInstances
                .FirstOrDefaultAsync(x => x.Id == instanceId, cancellationToken);

            if (instance == null)
            {
                throw new KeyNotFoundException($"The workflow instance {instanceId} was not found");
            }

            instance.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }

        public async Task<IEnumerable<WorkflowInstanceStep>> GetInstanceStepsAsync(
            Guid instanceId, 
            CancellationToken cancellationToken = default)
            => await db.WorkflowInstanceSteps
                .Where(x => x.WorkflowInstanceId == instanceId)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync(cancellationToken);

        public async Task<IEnumerable<GetWorkflowInstanceResult>> GetWorkflowInstancesAsync(
            Guid workflowId,
            int? version,
            CancellationToken cancellationToken = default)
        {
            IQueryable<DbWorkflowInstance> query = db.WorkflowInstances
                .Where(x => x.WorkflowId == workflowId);

            if (version.HasValue)
            {
                query = query.Where(x => x.WorkflowVersion == version.Value);
            }

            return await query
                .Select(x => new GetWorkflowInstanceResult
                {
                    Id = x.Id,
                    Status = x.Status,
                    Arguments = x.Arguments,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                    WorkflowId = workflowId,
                    WorkflowVersion = x.WorkflowVersion
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<WorkflowInstanceConnection>> GetWorkflowInstanceConnectionsAsync(
            Guid instanceId,
            CancellationToken cancellationToken = default)
            => await db.WorkflowInstanceConnections
                .Where(x => x.InstanceId == instanceId)
                .ToListAsync(cancellationToken);

        public async Task CreateWorkflowInstanceConnectionAsync(WorkflowInstanceConnection request, CancellationToken cancellationToken = default)
        {
            db.WorkflowInstanceConnections.Add(new DbWorkflowInstanceConnection 
            { 
                ConnectPolylineId = request.ConnectPolylineId,
                InstanceId = request.InstanceId
            });
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
                e.Property(x => x.Diagram).HasColumnType("json");
            });

            builder.Entity<DbWorkflowInstance>(e =>
            {
                e.HasIndex(x => new { x.WorkflowId, x.WorkflowVersion });
                e.Property(x => x.Arguments).HasColumnType("json");
                e.HasMany(x => x.Steps).WithOne(x => x.WorkflowInstance);
                e.HasMany(x => x.Connections).WithOne(x => x.WorkflowInstance);
            });

            builder.Entity<DbWorkflowInstanceConnection>(e =>
            {
                e.HasKey(x => new { x.InstanceId, x.ConnectPolylineId });
            });

            builder.Entity<DbStep>(e =>
            {
                e.Property(x => x.Type).HasMaxLength(64);
                e.Property(x => x.Arguments).HasColumnType("json");
                e.HasIndex(x => new { x.WorkflowInstanceId, x.ShapeId });
            });

            return builder;
        }

        public static IServiceCollection AddDbWorkflowStorageProvider<TDbContext>(this IServiceCollection services)
            where TDbContext : DbContext, IWorkflowDbContext
        {
            return services.AddScoped<IWorkflowStorageProvider, DbWorkflowStorageProvider<TDbContext>>();
        }
    }
}
