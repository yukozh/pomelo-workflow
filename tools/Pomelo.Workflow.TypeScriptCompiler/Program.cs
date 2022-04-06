using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using Newtonsoft.Json;

namespace Pomelo.Workflow.TypeScriptCompiler
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

            var config = ReadPomeloConfig(path);
            var entry = GenerateTypeScript(new[] { Path.Combine(path, config.Entry) });
            var clousure = entry.Split('\n').Where(x => x.Contains("// <Clousure />")).FirstOrDefault();
            if (clousure == null) 
            {
                Console.Error.WriteLine("Invalid Entry");
                Environment.Exit(1);
            }
            var padding = clousure.Substring(0, clousure.IndexOf("// <Clousure />"));

            var prioritizedFiles = config.Prioritized.Select(x => Path.Combine(path, x)).ToArray();
            var ts = GenerateTypeScript(prioritizedFiles, padding);

            var files = Directory.EnumerateFiles(path, "*.ts", SearchOption.AllDirectories)
                .Where(x => !x.Contains("node_modules") && !x.Contains("Tests"))
                .Where(x => !prioritizedFiles.Contains(x));

            ts += "\r\n\r\n" + GenerateTypeScript(files, padding);

            ts = entry.Replace("// <Clousure />", "\r\n" + ts);

            Console.WriteLine(ts);
            File.WriteAllText(config.Output, ts);

            Compile(Path.Combine(path, config.Tsconfig));
        }

        static string GenerateTypeScript(IEnumerable<string> files, string padding = "") 
        {
            var sb = new StringBuilder();
            foreach (var file in files)
            {
                var lines = File.ReadAllLines(file)
                    .Where(x => !x.StartsWith("import "))
                    .Select(x => x.Replace("export ", ""));

                foreach (var line in lines)
                {
                    sb.AppendLine(padding + line);
                }
            }

            return sb.ToString();
        }

        static PomeloConfig ReadPomeloConfig(string path)
        {
            var pomeloConfigPath = Path.Combine(path, "pomelo.json");
            return JsonConvert.DeserializeObject<PomeloConfig>(File.ReadAllText(pomeloConfigPath));
        }

        static void Compile(string tsconfigPath) 
        {
            File.Copy(tsconfigPath, "tsconfig.json", true);

            using (var process = new Process
            {
                StartInfo = new ProcessStartInfo 
                {
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    FileName = "cmd",
                    Arguments = $"/c tsc --build"
                }
            }) {
                process.Start();
                process.WaitForExit();
            }
        }
    }
}
