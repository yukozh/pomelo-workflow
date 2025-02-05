// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;

namespace Pomelo.Workflow.Models
{
    public enum StepStatus
    {
        NotStarted,
        InProgress,
        Failed,
        Succeeded
    }

    public class WorkflowInstanceStep
    {
        public Guid Id { get; set; }

        public Guid WorkflowInstanceId { get; set; }

        public Guid ShapeId { get; set; }

        public string Type { get; set; }

        public StepStatus Status { get; set; }

        public Dictionary<string, JToken> Arguments { get; set; }

        public string Error { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
