// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System.Collections.Generic;

namespace Pomelo.Workflow.Models.EntityFramework
{
    public class DbWorkflowInstance : WorkflowInstance
    {
        public virtual DbWorkflow Workflow { get; set; }

        public virtual ICollection<DbStep> Steps { get; set; }
    }
}
