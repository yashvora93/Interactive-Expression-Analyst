using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Diagnostics;

namespace HackathonService.Controllers
{
    public class FrameController : ApiController
    {
        // GET api/frame
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/frame/5
        public string Get(string videoName)
        {
            var apiUrl = "https://videobreakdown.azure-api.net/Breakdowns/Api/Partner/Breakdowns";
            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", "6dbacb784f154ba396ba3f3a847ecaa1");

            var content = new MultipartFormDataContent();

            //Console.WriteLine("Uploading...");
            var videoUrl = "https://thakeraj1.blob.core.windows.net/videos/" + videoName + ".mp4";
            var result = client.PostAsync(apiUrl + "?name=file&description=file&privacy=private&partition=some_partition&videoUrl=" + videoUrl, content).Result;
            var json = result.Content.ReadAsStringAsync().Result;

            //Console.WriteLine();
            //Console.WriteLine("Uploaded:");
            //Console.WriteLine(json);

            var idx = JsonConvert.DeserializeObject<string>(json);
            var output = new Dictionary<string,string>();
            var stateData = "";
            while (true)
            {
                Thread.Sleep(10000);

                result = client.GetAsync(string.Format(apiUrl + "/{0}/State", idx)).Result;
                json = result.Content.ReadAsStringAsync().Result;

                //Console.WriteLine();
                //Console.WriteLine("State:");
                stateData += json;

                dynamic state = JsonConvert.DeserializeObject(json);
                if (state.state != "Uploaded" && state.state != "Processing")
                {
                    break;
                }
            }
            output.Add("State", stateData);

            result = client.GetAsync(string.Format(apiUrl + "/{0}", idx)).Result;
            json = result.Content.ReadAsStringAsync().Result;
            //Console.WriteLine();
            //Console.WriteLine("Full JSON:");
            //Console.WriteLine(json);
            output.Add("Full_JSON", json);

            result = client.GetAsync(string.Format(apiUrl + "/Search?id={0}", idx)).Result;
            json = result.Content.ReadAsStringAsync().Result;
            //Console.WriteLine();
            //Console.WriteLine("Search:");
            //Console.WriteLine(json);
            output.Add("Search", json);

            result = client.GetAsync(string.Format(apiUrl + "/{0}/InsightsWidgetUrl", idx)).Result;
            json = result.Content.ReadAsStringAsync().Result;
            //Console.WriteLine();
            //Console.WriteLine("Insights Widget url:");
            //Console.WriteLine(json);
            output.Add("Insight", json);

            result = client.GetAsync(string.Format(apiUrl + "/{0}/PlayerWidgetUrl", idx)).Result;
            json = result.Content.ReadAsStringAsync().Result;
            //Console.WriteLine();
            //Console.WriteLine("Player token:");
            //Console.WriteLine(json);
            output.Add("Player_Token", json);

            return JsonConvert.SerializeObject(output);
        }


        public string Get(string token, string data = "")
        {
            var apiUrl = "https://videobreakdown.azure-api.net/Breakdowns/Api/Partner/Breakdowns";
            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", "6dbacb784f154ba396ba3f3a847ecaa1");

            var result = client.GetAsync(string.Format(apiUrl + "/{0}", token)).Result;
            var json = result.Content.ReadAsStringAsync().Result;
            return JsonConvert.SerializeObject(json);
        }

        // POST api/frame
        public void Post([FromBody]string value)
        {
            int i = 0;
        }

        // PUT api/frame/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/frame/5
        public void Delete(int id)
        {
        }
    }
}
