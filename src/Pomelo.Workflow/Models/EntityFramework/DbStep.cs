// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

namespace Pomelo.Workflow.Models.EntityFramework
{
    public class DbStep : WorkflowInstanceStep
    {
        public virtual DbWorkflowInstance WorkflowInstance { get; set; }
    }
}
