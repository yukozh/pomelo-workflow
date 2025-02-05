using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pomelo.Workflow.Models;
using Pomelo.Workflow.Web.Models;
using Pomelo.Workflow.Web.Models.ViewModels;

namespace Pomelo.Workflow.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApprovalController : ControllerBase
    {
        public async ValueTask<IEnumerable<Approval>> GetApprovals(
            [FromServices] WfContext db,
            CancellationToken cancellationToken = default)
        {
            return await db.Approvals.ToListAsync(cancellationToken);
        }

        [HttpPatch("{id:Guid}")]
        public async ValueTask<Approval> PatchApproval(
            [FromServices] WfContext db,
            [FromServices] WorkflowManager wf,
            [FromRoute] Guid id,
            [FromBody] PatchApprovalRequest request,
            CancellationToken cancellationToken = default)
        { 
            var approval = await db.Approvals
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            approval.Status = request.Status;

            await wf.UpdateWorkflowStepAsync(approval.StepId, request.Status == ApprovalStatus.Approved 
                ? StepStatus.Succeeded 
                : StepStatus.Failed, null, null, cancellationToken);

            await db.SaveChangesAsync(cancellationToken);

            return approval;
        }
    }
}
