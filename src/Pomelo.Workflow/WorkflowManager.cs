using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.EntityFramework;
using Pomelo.Workflow.Models.ViewModels;
using Pomelo.Workflow.Storage;
using Pomelo.Workflow.WorkflowHandler;
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
            Guid id,
            CancellationToken cancellationToken = default)
        {
            return await storage.GetWorkflowAsync(id, cancellationToken);
        }

        public virtual async ValueTask<IEnumerable<GetWorkflowVersionResult>> GetWorkflowVersionsAsync(
            Guid id,
            CancellationToken cancellationToken = default)
        { 
            return await storage.GetWorkflowVersionsAsync(id, cancellationToken);
        }

        public virtual async ValueTask<WorkflowVersion> GetWorkflowVersionAsync(
            Guid id,
            int version,
            CancellationToken cancellationToken = default)
        {
            return await storage.GetWorkflowVersionAsync(id, version, cancellationToken);
        }

        public virtual async ValueTask<int?> GetLatestVersionAsync(
            Guid id,
            WorkflowVersionStatus status = WorkflowVersionStatus.Available,
            CancellationToken cancellationToken = default)
        {
            return await storage.GetLatestVersionAsync(id, status, cancellationToken);
        }

        public virtual async ValueTask<WorkflowVersion> GetLatestWorkflowVersionAsync(
            Guid id,
            WorkflowVersionStatus status = WorkflowVersionStatus.Available,
            CancellationToken cancellationToken = default) 
        {
            var version = await storage.GetLatestVersionAsync(id, status, cancellationToken);

            if (!version.HasValue)
            {
                throw new InvalidOperationException("The workflow doesn't contain any versions");
            }

            return await GetWorkflowVersionAsync(id, version.Value, cancellationToken);
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
            Guid id,
            bool withDefaultDiagram = true,
            CancellationToken cancellationToken = default)
        {
            var template = GenerateDiagram(id, withDefaultDiagram);

            var version = await storage.CreateWorkflowVersion(
                id, 
                new CreateWorkflowVersionRequest 
                {
                    Diagram = JsonConvert.DeserializeObject<Diagram>(template)
                }, cancellationToken);

            return version;
        }

        public async ValueTask<StartNewInstanceResult> StartNewInstanceAsync(
            Guid workflowId,
            int version,
            Dictionary<string, JToken> arguments,
            CancellationToken cancellationToken = default)
        {
            var workflowVersion = await GetWorkflowVersionAsync(workflowId, version, cancellationToken);
            var diagram = workflowVersion.Diagram;
            var instanceId = await storage.CreateWorkflowInstanceAsync(workflowId, version, arguments, cancellationToken);
            var start = diagram.Shapes.FirstOrDefault(x => x.Node == "start");
            if (start == null) 
            {
                throw new KeyNotFoundException("Start node was not found in this diagram");
            }

            var mergedArguments = MergeArguments(arguments, start.Arguments);

            var step = new DbStep
            {
                Arguments = mergedArguments,
                ShapeId = start.Guid,
                Status = StepStatus.NotStarted,
                WorkflowInstanceId = workflowId,
                Type = start.Node
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

            var step = await storage.GetStepAsync(stepId, cancellationToken);
            if (result.PreviousStatus != result.NewStatus)
            {
                var handler = await CreateHandlerAsync(step, cancellationToken);
                await handler.OnStepStatusChangedAsync(result.NewStatus, result.PreviousStatus, cancellationToken);
            }

            if (result.NewStatus >= StepStatus.Failed)
            { 
                // 1. Prepare
                var instance = await storage.GetWorkflowInstanceAsync(stepId, cancellationToken);
                var workflowVersion = await storage.GetWorkflowVersionAsync(instance.WorkflowId, instance.WorkflowVersion, cancellationToken);
                var diagram = workflowVersion.Diagram;

                // 2. Get connected polylines (outgoing)
                var connections = diagram
                    .ConnectPolylines
                    .Where(x => x.DepartureShapeGuid == step.ShapeId)
                    .ToList();
                var shapes = diagram
                    .Shapes
                    .Where(x => connections.Select(x => x.Guid).Contains(x.Guid))
                    .ToList();

                // 3. Get each handlers
                foreach(var shape in shapes)
                {
                    var node = shape.Node;
                    var handlerType = GetHandlerType(node);
                    var method = handlerType.GetMethods().FirstOrDefault(x => x.IsStatic && x.Name == "IsAbleToConnectToCurrentStepAsync");
                    var connection = connections.First(x => x.DestinationShapeGuid == shape.Guid);
                    var isAbleToConnect = await (ValueTask<bool>)method.Invoke(null, new object[] 
                    { 
                        connection.Type,
                        connection.Arguments, 
                        shape, 
                        step,
                        cancellationToken 
                    });
                    if (!isAbleToConnect)
                    {
                        continue;
                    }

                    // 4. Create next step
                    await storage.CreateWorkflowStepAsync(instance.Id, new Step 
                    {
                        Arguments = shape.Arguments,
                        Status = StepStatus.NotStarted,
                        Type = shape.Node,
                        WorkflowInstanceId = instance.Id
                    }, cancellationToken);

                    // 5. Determine if all the previous steps are finished
                    var steps = await storage.GetPreviousStepsAsync(step.Id, cancellationToken);
                    var handler = await CreateHandlerAsync(step, cancellationToken);
                    var allFinished = steps.ShapeIds.Count() == steps.Steps.Count() 
                        && steps.Steps.All(x => x.Status >= StepStatus.Failed);
                    await handler.OnPreviousStepFinishedAsync(step, allFinished, cancellationToken);
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
            CancellationToken cancellationToken)
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
            var startShape = diagram.Shapes.FirstOrDefault(x => x.Node == "start");

            var startStep = await storage.GetStepByShapeId(instanceId, startShape.Guid, cancellationToken);

            await storage.UpdateWorkflowInstanceAsync(
                instanceId,
                WorkflowStatus.InProgress,
                null,
                cancellationToken
            );

            await storage.UpdateWorkflowStepAsync(
                startStep.Id,
                StepStatus.InProgress,
                null,
                null,
                cancellationToken);
        }

        protected async ValueTask<WorkflowHandlerBase> CreateHandlerAsync(
            Step step, 
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
                .Where(x => x.IsClass && x.GetCustomAttribute<WorkflowHandlerAttribute>(true).Type == name)
                .First();

        protected Shape GetStepShape(Step step, Diagram diagram)
            => diagram.Shapes.FirstOrDefault(x => x.Guid == step.ShapeId);

        private Dictionary<string, JToken> MergeArguments(
            Dictionary<string, JToken> args1, 
            Dictionary<string, JToken> args2)
        {
            var ret = new Dictionary<string, JToken>();

            foreach (var arg in args1)
            {
                ret[arg.Key] = arg.Value;
            }

            foreach(var arg in args2)
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
}
