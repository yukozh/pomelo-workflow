// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

namespace Pomelo.Workflow
{
    public class WorkflowHandlerAttribute : Attribute
    {
        public string Type { get; init; }

        public WorkflowHandlerAttribute(string type)
        {
            Type = type;
        }
    }
}
