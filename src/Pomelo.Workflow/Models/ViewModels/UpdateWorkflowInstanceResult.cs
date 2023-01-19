// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

namespace Pomelo.Workflow.Models.ViewModels
{
    public class UpdateWorkflowInstanceResult
    {
        public WorkflowStatus NewStatus { get; set; }

        public WorkflowStatus OldStatus { get; set; }
    }
}
