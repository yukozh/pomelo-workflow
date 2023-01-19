// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

namespace Pomelo.Workflow.Models.EntityFramework
{
    public class DbWorkflow : Workflow
    {
        public virtual ICollection<DbWorkflowVersion> Versions { get; set; }

        public virtual ICollection<DbWorkflowInstance> Instances { get; set; }
    }
}
