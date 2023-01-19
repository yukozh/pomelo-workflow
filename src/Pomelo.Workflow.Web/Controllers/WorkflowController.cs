using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Models.ViewModels;

namespace Pomelo.Workflow.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkflowController : ControllerBase
    {
        [HttpGet]
        public async ValueTask<IEnumerable<Workflow.Models.Workflow>> GetWorkflows(
            [FromServices] WorkflowManager wf,
            [FromQuery] string name = null,
            CancellationToken cancellationToken = default)
            => await wf.GetWorkflowsAsync(name, cancellationToken);

        [HttpPost]
        public async ValueTask<Workflow.Models.Workflow> PostWorkflow(
            [FromServices] WorkflowManager wf,
            [FromBody] CreateWorkflowRequest request,
            CancellationToken cancellationToken = default)
        {
            var wfId = await wf.CreateWorkflowAsync(request, true, cancellationToken);
            return await wf.GetWorkflowAsync(wfId, cancellationToken);
        }

        [HttpGet("{workflowId:Guid}")]
        public async ValueTask<Workflow.Models.Workflow> GetWorkflow(
            [FromServices] WorkflowManager wf,
            [FromQuery] Guid workflowId,
            CancellationToken cancellationToken = default)
            => await wf.GetWorkflowAsync(workflowId, cancellationToken);

        [HttpGet("{workflowId:Guid}/version")]
        public async ValueTask<IEnumerable<GetWorkflowVersionResult>> GetWorkflowVersions(
            [FromServices] WorkflowManager wf,
            [FromRoute] Guid workflowId,
            CancellationToken cancellationToken = default)
            => await wf.GetWorkflowVersionsAsync(workflowId, cancellationToken);

        [HttpPost("{workflowId:Guid}/version")]
        public async ValueTask<WorkflowVersion> PostWorkflowVersion(
            [FromServices] WorkflowManager wf,
            [FromRoute] Guid workflowId,
            [FromBody] Diagram diagram,
            CancellationToken cancellationToken = default)
        {
            var version = await wf.CreateWorkflowVersionAsync(workflowId, diagram, cancellationToken);
            return await GetWorkflowVersion(wf, workflowId, version, cancellationToken);
        }

        [HttpGet("{workflowId:Guid}/version/{version:int}")]
        public async ValueTask<WorkflowVersion> GetWorkflowVersion(
            [FromServices] WorkflowManager wf,
            [FromRoute] Guid workflowId,
            [FromRoute] int version,
            CancellationToken cancellationToken = default)
            => await wf.GetWorkflowVersionAsync(workflowId, version, cancellationToken);

        [HttpGet("{workflowId:Guid}/version/{version:int}/instance")]
        public async ValueTask<IEnumerable<GetWorkflowInstanceResult>> GetWorkflowVersionInstances(
            [FromServices] WorkflowManager wf,
            [FromRoute] Guid workflowId,
            [FromRoute] int version,
            CancellationToken cancellationToken = default)
            => await wf.GetWorkflowInstancesAsync(workflowId, version, cancellationToken);

        [HttpGet("{workflowId:Guid}/instance")]
        public async ValueTask<IEnumerable<GetWorkflowInstanceResult>> GetWorkflowInstances(
            [FromServices] WorkflowManager wf,
            [FromRoute] Guid workflowId,
            CancellationToken cancellationToken = default)
            => await wf.GetWorkflowInstancesAsync(workflowId, null, cancellationToken);

        [HttpPost("{workflowId:Guid}/version/{version:int}/instance")]
        public async ValueTask<InstanceDiagram> PostWorkflowInstance(
            [FromServices] WorkflowManager wf,
            [FromRoute] Guid workflowId,
            [FromRoute] int version,
            [FromBody] Dictionary<string, JToken> arguments,
            CancellationToken cancellationToken = default)
        {
            var result = await wf.CreateNewWorkflowInstanceAsync(
                workflowId,
                version, 
                arguments, 
                cancellationToken);

            return await GetWorkflowInstanceDiagram(
                wf,
                workflowId, 
                result.InstanceId, 
                cancellationToken);
        }

        [HttpGet("{workflowId:Guid}/instance/{instanceId:Guid}/diagram")]
        public async ValueTask<InstanceDiagram> GetWorkflowInstanceDiagram(
            [FromServices] WorkflowManager wf,
            [FromRoute] Guid workflowId,
            [FromRoute] Guid instanceId,
            CancellationToken cancellationToken = default)
            => await wf.GetInstanceDiagramAsync(instanceId, cancellationToken);

        [HttpPost("{workflowId:Guid}/instance/{instanceId:Guid}/start")]
        public async ValueTask<InstanceDiagram> PostWorkflowInstanceStart(
            [FromServices] WorkflowManager wf,
            [FromRoute] Guid workflowId,
            [FromRoute] Guid instanceId,
            CancellationToken cancellationToken = default)
        {
            await wf.StartWorkflowInstanceAsync(instanceId);
            return await GetWorkflowInstanceDiagram(
                wf, 
                workflowId, 
                instanceId, 
                cancellationToken);
        }
    }
}
