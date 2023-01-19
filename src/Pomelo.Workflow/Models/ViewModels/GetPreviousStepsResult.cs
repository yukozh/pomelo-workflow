// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;
using System.Collections.Generic;

namespace Pomelo.Workflow.Models.ViewModels
{
    public class GetPreviousStepsResult
    {
        public IEnumerable<WorkflowInstanceStep> Steps { get; set; }

        public IEnumerable<Guid> ShapeIds { get; set; }
    }
}
