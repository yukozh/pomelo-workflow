using Newtonsoft.Json;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;
using Pomelo.Workflow.Storage;

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

        public virtual async ValueTask<IEnumerable<GetWorkflowVersionResponse>> GetWorkflowVersionsAsync(
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

        public async ValueTask<Guid> StartNewInstanceAsync(
            Guid workflowId,
            int version,
            CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException();
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
