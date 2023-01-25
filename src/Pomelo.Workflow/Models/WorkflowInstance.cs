// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Pomelo.Workflow.Models.EntityFramework;

namespace Pomelo.Workflow.Models
{
    public enum WorkflowStatus
    {
        NotStarted,
        InProgress,
        Finished,
        Error
    }

    public class WorkflowInstance
    {
        public Guid Id { get; set; }

        public Guid WorkflowId { get; set; }

        public int WorkflowVersion { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public WorkflowStatus Status { get; set; }

        public Dictionary<string, JToken> Arguments { get; set; }

        public virtual ICollection<DbWorkflowInstanceConnection> Connections { get; set; }
    }
}
