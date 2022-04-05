using System;
using System.IO;
using System.Linq;
using System.Text;

namespace Pomelo.Workflow.Frontend.Compiler
{
    internal class Program
    {
        static void Main(string[] args)
        {
            string path = null;
            if (args.Length == 1)
            {
                path = args[0];
            }
            else
            {
                Console.Write("Path: ");
                path = Console.ReadLine();
            }

            var files = Directory.EnumerateFiles(path, "*.ts", SearchOption.AllDirectories)
                .Where(x => !x.Contains("node_modules") && !x.Contains("Tests"));

            var sb = new StringBuilder();
            foreach (var file in files) 
            {
                sb.AppendLine(File.ReadAllText(file)
                    .Replace("import ", "//import ")
                    .Replace("export ", ""));
            }

            var ts = sb.ToString();
            Console.WriteLine(ts);
            File.WriteAllText("pomelo.workflow.core.ts", ts);

            Console.WriteLine();
        }
    }
}
