namespace Pomelo.Workflow.Frontend.Compiler
{
    internal class PomeloConfig
    {
        public string Tsconfig { get; set; }

        public string Entry { get; set; }

        public string Output { get; set; }

        public string[] Exclude { get; set; }

        public string[] Prioritized { get; set; }
    }
}
