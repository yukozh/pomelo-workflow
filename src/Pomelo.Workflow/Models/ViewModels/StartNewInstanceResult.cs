// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;

namespace Pomelo.Workflow.Models.ViewModels
{
    public class StartNewInstanceResult
    {
        public Guid InstanceId { get; set; }

        public Guid StartStepId { get; set; }
    }
}
