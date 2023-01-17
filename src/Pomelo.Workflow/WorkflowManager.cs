using Pomelo.Workflow.Storage;

namespace Pomelo.Workflow
{
    public class WorkflowManager
    {
        private readonly IWorkflowStorageProvider storage;

        public WorkflowManager(IWorkflowStorageProvider storage) 
        {
            this.storage = storage;
        }
    }
}
