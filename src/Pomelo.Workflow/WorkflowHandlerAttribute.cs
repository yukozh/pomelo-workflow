// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

using System;

namespace Pomelo.Workflow
{
    public class WorkflowHandlerAttribute : Attribute
    {
        public string Type { get; private set; }

        public int Priority { get; private set; }

        public WorkflowHandlerAttribute(string type, int priority = 0)
        {
            Type = type;
            Priority = priority;
        }
    }
}
