// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.EntityFramework;
using Pomelo.Workflow.Models.ViewModels;
using Pomelo.Workflow.Storage;
using Pomelo.Workflow.WorkflowHandler;
using System.Collections.Immutable;
using System.Reflection;

namespace Pomelo.Workflow
{
    public class WorkflowManager
    {
        private readonly IWorkflowStorageProvider storage;

        public virtual string DefaultWorkflowDiagramTemplate => @"{
    ""guid"": ""{DIAGRAM_GUID}"",
    ""shapes"": [
        {
            ""guid"": ""{START_NODE_GUID}"",
            ""points"": [
                {
                    ""x"": 66,
                    ""y"": 74
                },
                {
                    ""x"": 106,
                    ""y"": 74
                },
                {
                    ""x"": 106,
                    ""y"": 114
                },
                {
                    ""x"": 66,
                    ""y"": 114
                }
            ],
            ""anchors"": [
                {
                    ""xPercentage"": 0.5,
                    ""yPercentage"": 0
                },
                {
                    ""xPercentage"": 1,
                    ""yPercentage"": 0.5
                },
                {
                    ""xPercentage"": 0.5,
                    ""yPercentage"": 1
                },
                {
                    ""xPercentage"": 0,
                    ""yPercentage"": 0.5
                }
            ],
            ""node"": ""start"",
            ""type"": ""Rectangle"",
            ""width"": 40,
            ""height"": 40
        },
        {
            ""guid"": ""{FINISH_NODE_GUID}"",
            ""points"": [
                {
                    ""x"": 250,
                    ""y"": 74
                },
                {
                    ""x"": 290,
                    ""y"": 74
                },
                {
                    ""x"": 290,
                    ""y"": 114
                },
                {
                    ""x"": 250,
                    ""y"": 114
                }
            ],
            ""anchors"": [
                {
                    ""xPercentage"": 0.5,
                    ""yPercentage"": 0
                },
                {
                    ""xPercentage"": 1,
                    ""yPercentage"": 0.5
                },
                {
                    ""xPercentage"": 0.5,
                    ""yPercentage"": 1
                },
                {
                    ""xPercentage"": 0,
                    ""yPercentage"": 0.5
                }
            ],
            ""node"": ""finish"",
            ""type"": ""Rectangle"",
            ""width"": 40,
            ""height"": 40
        }
    ],
    ""connectPolylines"": [
        {
            ""guid"": ""{POLYLINE_GUID}"",
            ""departureShapeGuid"": ""{START_NODE_GUID}"",
            ""destinationShapeGuid"": ""{FINISH_NODE_GUID}"",
            ""departureAnchorIndex"": 1,
            ""destinationAnchorIndex"": 3,
            ""color"": ""#56a333"",
            ""path"": [
                {
                    ""x"": 106,
                    ""y"": 94
                },
                {
                    ""x"": 116,
                    ""y"": 94
                },
                {
                    ""x"": 250,
                    ""y"": 94
                }
            ],
            ""type"": ""default"",
            ""arguments"": null
        }
    ]
}";
        public virtual string EmptyWorkflowDiagramTemplate => @"{
    ""guid"": ""{DIAGRAM_GUID}"",
    ""shapes"": [],
    ""connectPolylines"": []
}";

        public WorkflowManager(IWorkflowStorageProvider storage) 
        {
            this.storage = storage;
        }

        public virtual async ValueTask<IEnumerable<Models.Workflow>> GetWorkflowsAsync(
            string name = null,
            CancellationToken cancellationToken = default) 
        {
            return await storage.GetWorkflowsAsync(name, cancellationToken);
        }

        public virtual async ValueTask<Models.Workflow> GetWorkflowAsync(
            Guid workflowId,
            CancellationToken cancellationToken = default)
        {
            return await storage.GetWorkflowAsync(workflowId, cancellationToken);
        }

        public virtual async ValueTask<IEnumerable<GetWorkflowVersionResult>> GetWorkflowVersionsAsync(
            Guid workflowId,
            CancellationToken cancellationToken = default)
        { 
            return await storage.GetWorkflowVersionsAsync(workflowId, cancellationToken);
        }

        public virtual async ValueTask<WorkflowVersion> GetWorkflowVersionAsync(
            Guid workflowId,
            int version,
            CancellationToken cancellationToken = default)
        {
            return await storage.GetWorkflowVersionAsync(workflowId, version, cancellationToken);
        }

        public virtual async ValueTask<int?> GetLatestVersionAsync(
            Guid workflowId,
            WorkflowVersionStatus status = WorkflowVersionStatus.Available,
            CancellationToken cancellationToken = default)
        {
            return await storage.GetLatestVersionAsync(workflowId, status, cancellationToken);
        }

        public virtual async ValueTask<WorkflowVersion> GetLatestWorkflowVersionAsync(
            Guid workflowId,
            WorkflowVersionStatus status = WorkflowVersionStatus.Available,
            CancellationToken cancellationToken = default) 
        {
            var version = await storage.GetLatestVersionAsync(workflowId, status, cancellationToken);

            if (!version.HasValue)
            {
                throw new InvalidOperationException("The workflow doesn't contain any versions");
            }

            return await GetWorkflowVersionAsync(workflowId, version.Value, cancellationToken);
        }

        public virtual async ValueTask<Guid> CreateWorkflowAsync(
            CreateWorkflowRequest request,
            bool withDefaultDiagram = true,
            CancellationToken cancellationToken = default)
        {
            var id = await storage.CreateWorkflowAsync(request, cancellationToken);

            if (withDefaultDiagram)
            {
                var template = GenerateDiagram(id);

                await storage.CreateWorkflowVersion(
                    id,
                    new CreateWorkflowVersionRequest
                    { 
                        Diagram = JsonConvert.DeserializeObject<Diagram>(template)
                    }, 
                    cancellationToken);
            }

            return id;
        }

        public virtual async ValueTask<int> CreateWorkflowVersionAsync(
            Guid workflowId,
            bool withDefaultDiagram = true,
            CancellationToken cancellationToken = default)
        {
            var template = GenerateDiagram(workflowId, withDefaultDiagram);

            var version = await storage.CreateWorkflowVersion(
                workflowId, 
                new CreateWorkflowVersionRequest 
                {
                    Diagram = JsonConvert.DeserializeObject<Diagram>(template)
                }, cancellationToken);

            return version;
        }

        public virtual async ValueTask<int> CreateWorkflowVersionAsync(
            Guid workflowId,
            Diagram diagram,
            CancellationToken cancellationToken = default)
        {
            diagram.Guid = workflowId;
            var version = await storage.CreateWorkflowVersion(
                workflowId,
                new CreateWorkflowVersionRequest
                {
                    Diagram = diagram
                }, cancellationToken);

            return version;
        }

        public async ValueTask<StartNewInstanceResult> CreateNewWorkflowInstanceAsync(
            Guid workflowId,
            int version,
            Dictionary<string, JToken> arguments,
            CancellationToken cancellationToken = default)
        {
            var workflowVersion = await GetWorkflowVersionAsync(workflowId, version, cancellationToken);
            var diagram = workflowVersion.Diagram;
            var instanceId = await storage.CreateWorkflowInstanceAsync(workflowId, version, arguments, cancellationToken);
            var start = diagram.Shapes.FirstOrDefault(x => x.ToObject<Shape>().Node == "start");
            if (start == null) 
            {
                throw new KeyNotFoundException("Start node was not found in this diagram");
            }

            var mergedArguments = MergeArguments(arguments, start.ToObject<Shape>().Arguments);

            var step = new DbStep
            {
                Arguments = mergedArguments,
                ShapeId = start.ToObject<Shape>().Guid,
                Status = StepStatus.NotStarted,
                WorkflowInstanceId = workflowId,
                Type = start.ToObject<Shape>().Node
            };
            var stepId = await storage.CreateWorkflowStepAsync(instanceId, step, cancellationToken);
            return new StartNewInstanceResult 
            {
                InstanceId = instanceId,
                StartStepId = stepId
            };
        }

        public async ValueTask<UpdateWorkflowStepResult> UpdateWorkflowStepAsync(
            Guid stepId,
            StepStatus status,
            Action<Dictionary<string, JToken>> updateArgumentsDelegate,
            string error = null,
            CancellationToken cancellationToken = default)
        {
            var result = await storage
                .UpdateWorkflowStepAsync(stepId, status, updateArgumentsDelegate, error, cancellationToken);

            var step = await storage.GetWorkflowInstanceStepAsync(stepId, cancellationToken);

            WorkflowHandlerBase currentStepHandler = null;
            if (result.PreviousStatus != result.NewStatus)
            {
                var handler = await CreateHandlerAsync(step, cancellationToken);
                currentStepHandler = handler;
                await handler.OnStepStatusChangedAsync(result.NewStatus, result.PreviousStatus, cancellationToken);
            }

            step = await storage.GetWorkflowInstanceStepAsync(step.Id, cancellationToken);
            if (step.Status >= StepStatus.Failed)
            { 
                // 1. Prepare
                var instance = await storage.GetWorkflowInstanceAsync(step.WorkflowInstanceId, cancellationToken);
                var workflowVersion = await storage.GetWorkflowVersionAsync(instance.WorkflowId, instance.WorkflowVersion, cancellationToken);
                var diagram = workflowVersion.Diagram;

                // 2. Get connected polylines (outgoing)
                var connections = diagram
                    .ConnectPolylines
                    .Where(x => x.DepartureShapeGuid == step.ShapeId)
                    .ToList();

                var shapes = diagram // Destinations
                    .Shapes
                    .Where(x => connections.Select(x => x.DestinationShapeGuid).Contains(x.ToObject<Shape>().Guid))
                    .ToList();

                // 3. Get each handlers
                var currentShape = diagram.Shapes
                    .Where(x => x.ToObject<Shape>().Guid == step.ShapeId)
                    .Select(x => x.ToObject<Shape>())
                    .First();

                if (currentStepHandler == null)
                {
                    currentStepHandler = await CreateHandlerAsync(step, cancellationToken);
                }

                foreach (var shape in shapes)
                {
                    var connection = connections.First(x => x.DestinationShapeGuid == shape.ToObject<Shape>().Guid);

                    if (!await currentStepHandler.IsAbleToMoveNextAsync(new ConnectionType
                    {
                        Type = connection.Type,
                        Arguments = connection.Arguments
                    }, currentShape, shape.ToObject<Shape>(), cancellationToken))
                    {
                        continue;
                    }

                    // 4. Create or get next step
                    var nextStepId = (await storage.GetStepByShapeId(instance.Id, shape.ToObject<Shape>().Guid, cancellationToken))?.Id;
                    if (!nextStepId.HasValue)
                    {
                        nextStepId = await storage.CreateWorkflowStepAsync(instance.Id, new WorkflowInstanceStep
                        {
                            Arguments = shape.ToObject<Shape>().Arguments,
                            Status = StepStatus.NotStarted,
                            Type = shape.ToObject<Shape>().Node,
                            WorkflowInstanceId = instance.Id,
                            ShapeId = shape.ToObject<Shape>().Guid
                        }, cancellationToken);
                    }

                    // 5. Determine if all the next step's previous steps are finished
                    var nextStep = await storage.GetWorkflowInstanceStepAsync(nextStepId.Value, cancellationToken);
                    if (nextStep.Status >= StepStatus.Failed)
                    {
                        continue;
                    }
                    var steps = await storage.GetPreviousStepsAsync(nextStepId.Value, cancellationToken);
                    var handler = await CreateHandlerAsync(nextStep, cancellationToken);
                    var allFinished = steps.ShapeIds.Count() == steps.Steps.Count() 
                        && steps.Steps.All(x => x.Status >= StepStatus.Failed);
                    var connectionType = new ConnectionType 
                    {
                        Type = connection.Type,
                        Arguments = connection.Arguments
                    };
                    await handler.OnPreviousStepFinishedAsync(step, connectionType, allFinished, cancellationToken);
                }
            }

            return result;
        }

        public async ValueTask<UpdateWorkflowInstanceResult> UpdateWorkflowInstanceAsync(
            Guid instanceId,
            WorkflowStatus status,
            Action<Dictionary<string, JToken>> updateArgumentsDelegate,
            CancellationToken cancellationToken = default)
        {
            var result = await storage
                .UpdateWorkflowInstanceAsync(instanceId, status, updateArgumentsDelegate, cancellationToken);

            return result;
        }

        public async ValueTask StartWorkflowInstanceAsync(
            Guid instanceId, 
            CancellationToken cancellationToken = default)
        {
            await storage.UpdateWorkflowInstanceAsync(
                instanceId, 
                WorkflowStatus.InProgress,
                null, 
                cancellationToken);

            var instance = await storage
                .GetWorkflowInstanceAsync(instanceId, cancellationToken);

            var workflowVersion = await storage
                .GetWorkflowVersionAsync(instance.WorkflowId, instance.WorkflowVersion, cancellationToken);

            var diagram = workflowVersion.Diagram;
            var startShape = diagram.Shapes.FirstOrDefault(x => x.ToObject<Shape>().Node == "start");

            var startStep = await storage.GetStepByShapeId(instanceId, startShape.ToObject<Shape>().Guid, cancellationToken);

            await UpdateWorkflowInstanceAsync(
                instanceId,
                WorkflowStatus.InProgress,
                null,
                cancellationToken
            );

            await UpdateWorkflowStepAsync(
                startStep.Id,
                StepStatus.InProgress,
                null,
                null,
                cancellationToken);
        }

        public async ValueTask<IEnumerable<WorkflowInstanceStep>> GetInstanceStepsAsync(
            Guid instanceId,
            CancellationToken cancellationToken = default)
            => await storage.GetInstanceStepsAsync(instanceId, cancellationToken);

        public async ValueTask<InstanceDiagram> GetInstanceDiagramAsync(
            Guid instanceId,
            CancellationToken cancellationToken = default)
        {
            var steps = await GetInstanceStepsAsync(instanceId, cancellationToken);
            var instance = await storage.GetWorkflowInstanceAsync(instanceId, cancellationToken);
            var workflowVersion = await storage.GetWorkflowVersionAsync(instance.WorkflowId, instance.WorkflowVersion, cancellationToken);
            IEnumerable<InstanceShape> shapes = workflowVersion.Diagram.Shapes
                .Where(x => x.ToObject<Shape>().Type == "Shape")
                .Select(x => new InstanceShape 
                {
                    Anchors = x.ToObject<Shape>().Anchors,
                    Arguments = x.ToObject<Shape>().Arguments,
                    Guid = x.ToObject<Shape>().Guid,
                    Name = x.ToObject<Shape>().Name,
                    Node = x.ToObject<Shape>().Node,
                    Points = x.ToObject<Shape>().Points,
                    Type = x.ToObject<Shape>().Type
                }).Concat(workflowVersion.Diagram.Shapes
                .Where(x => x.ToObject<Shape>().Type == "Rectangle")
                .Select(x => new InstanceRectangle
                {
                    Anchors = x.ToObject<Rectangle>().Anchors,
                    Arguments = x.ToObject<Rectangle>().Arguments,
                    Guid = x.ToObject<Rectangle>().Guid,
                    Name = x.ToObject<Rectangle>().Name,
                    Node = x.ToObject<Rectangle>().Node,
                    Points = x.ToObject<Rectangle>().Points,
                    Type = x.ToObject<Rectangle>().Type,
                    Width = x.ToObject<Rectangle>().Width,
                    Height = x.ToObject<Rectangle>().Height
                }));
            var diagram = new InstanceDiagram 
            {
                InstanceId = instanceId,
                ConnectPolylines = workflowVersion.Diagram.ConnectPolylines,
                Shapes = shapes.ToList(),
                Status = instance.Status,
                Guid = workflowVersion.Diagram.Guid,
                Version = workflowVersion.Diagram.Version
            };

            foreach(var connection in diagram.ConnectPolylines)
            {
                connection.Dashed = true;
            }

            foreach(var step in steps)
            {
                if (step.Status >= StepStatus.Failed)
                {
                    foreach (var connection in diagram.ConnectPolylines.Where(x => x.DepartureShapeGuid == step.ShapeId))
                    {
                        if (steps.Any(x => x.ShapeId == connection.DestinationShapeGuid))
                        {
                            connection.Dashed = false;
                        }
                    }
                }

                var shape = diagram.Shapes.First(x => x.Guid == step.ShapeId);
                shape.Arguments = step.Arguments;
                shape.CreatedAt = step.CreatedAt;
                shape.UpdatedAt = step.UpdatedAt;
                shape.Status = step.Status;
            }

            return diagram;
        }

        public async ValueTask<IEnumerable<GetWorkflowInstanceResult>> GetWorkflowInstancesAsync(
            Guid workflowId,
            int? version,
            CancellationToken cancellationToken = default)
            => await storage.GetWorkflowInstancesAsync(workflowId, version, cancellationToken);

        protected async ValueTask<WorkflowHandlerBase> CreateHandlerAsync(
            WorkflowInstanceStep step, 
            CancellationToken cancellationToken = default)
        {
            var workflowInstance = await storage.GetWorkflowInstanceAsync(
                step.WorkflowInstanceId, 
                cancellationToken);

            var workflowVersion = await storage.GetWorkflowVersionAsync(
                workflowInstance.WorkflowId,
                workflowInstance.WorkflowVersion,
                cancellationToken);

            var handlerType = GetHandlerType(GetStepShape(step, workflowVersion.Diagram).Node);

            return (WorkflowHandlerBase)Activator.CreateInstance(handlerType, this, step);
        }

        protected Type GetHandlerType(string name)
            => AppDomain.CurrentDomain.GetAssemblies()
                .SelectMany(x => x.DefinedTypes)
                .Where(x => x != null && x.IsClass && x.GetCustomAttribute<WorkflowHandlerAttribute>(true)?.Type == name)
                .First();

        protected Shape GetStepShape(WorkflowInstanceStep step, Diagram diagram)
            => diagram.Shapes.FirstOrDefault(x => x.ToObject<Shape>().Guid == step.ShapeId)?.ToObject<Shape>();

        private Dictionary<string, JToken> MergeArguments(
            Dictionary<string, JToken> args1, 
            Dictionary<string, JToken> args2)
        {
            var ret = new Dictionary<string, JToken>();

            foreach (var arg in args1 ?? new Dictionary<string, JToken>())
            {
                ret[arg.Key] = arg.Value;
            }

            foreach(var arg in args2 ?? new Dictionary<string, JToken>())
            {
                if (ret.ContainsKey(arg.Key))
                {
                    continue;
                }

                ret[arg.Key] = arg.Value;
            }

            return ret;
        }

        private string GenerateDiagram(Guid id, bool empty = false)
        {
            if (empty)
            {
                return EmptyWorkflowDiagramTemplate
                    .Replace("{DIAGRAM_GUID}", id.ToString());
            }
            else
            { 
                return DefaultWorkflowDiagramTemplate
                    .Replace("{START_NODE_GUID}", Guid.NewGuid().ToString())
                    .Replace("{FINISH_NODE_GUID}", Guid.NewGuid().ToString())
                    .Replace("{POLYLINE_GUID}", Guid.NewGuid().ToString())
                    .Replace("{DIAGRAM_GUID}", id.ToString());
            }
        }
    }

    public static class WorkflowManagerExtensions
    {
        public static IServiceCollection AddWorkflowManager(this IServiceCollection services)
        {
            return services.AddScoped<WorkflowManager>();
        }
    }
}
