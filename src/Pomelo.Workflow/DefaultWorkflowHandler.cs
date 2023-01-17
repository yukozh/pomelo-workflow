namespace Pomelo.Workflow
{
    public class DefaultWorkflowHandler
    {
        protected readonly WorkflowManager PomeloWorkflow;

        public DefaultWorkflowHandler(WorkflowManager pomeloWorkflow)
        {
            PomeloWorkflow = pomeloWorkflow;
        }
    }
}
