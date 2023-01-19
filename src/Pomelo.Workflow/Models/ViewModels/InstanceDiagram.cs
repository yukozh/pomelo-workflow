// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

namespace Pomelo.Workflow.Models.ViewModels
{
    public class InstanceDiagram : Diagram
    {
        public WorkflowStatus Status { get; set; }

        public new IEnumerable<InstanceShape> Shapes { get; set; }
    }
}
