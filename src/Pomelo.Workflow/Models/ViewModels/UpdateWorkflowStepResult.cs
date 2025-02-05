// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

namespace Pomelo.Workflow.Models.ViewModels
{
    public class UpdateWorkflowStepResult
    {
        public StepStatus NewStatus { get; set; }

        public StepStatus PreviousStatus { get; set; }
    }
}
