namespace Pomelo.Workflow.Models.EntityFramework
{
    public class DbWorkflowVersion : WorkflowVersion
    {
        public virtual DbWorkflow Workflow { get; set; }
    }
}
