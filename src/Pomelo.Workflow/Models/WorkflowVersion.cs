// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;

namespace Pomelo.Workflow.Models
{
    public enum WorkflowVersionStatus
    {
        Draft,
        Available,
        Disabled
    }

    public class WorkflowVersion
    {
        public Guid WorkflowId { get; set; }

        public int Version { get; set; }

        public Diagram Diagram { get; set; }

        public WorkflowVersionStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
