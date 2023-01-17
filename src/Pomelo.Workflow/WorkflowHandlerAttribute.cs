namespace Pomelo.Workflow
{
    public class WorkflowHandlerAttribute
    {
        public string Type { get; init; }

        public WorkflowHandlerAttribute(string type)
        {
            Type = type;
        }
    }
}
