using System;

namespace Pomelo.Workflow.Models
{
    public class WorkflowInstanceConnection
    {
        public Guid InstanceId { get; set; }

        public Guid ConnectPolylineId { get; set; }
    }
}
