namespace Pomelo.Workflow.Models.EntityFramework
{
    public class DbWorkflowInstanceConnection : WorkflowInstanceConnection
    {
        public virtual DbWorkflowInstance WorkflowInstance { get; set; }
    }
}
