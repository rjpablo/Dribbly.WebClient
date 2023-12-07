using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Dribbly.Web.Services
{
    public class HttpService : IHttpService
    {
        public async Task<T> Get<T>(string url)
        {
            using (HttpClient client = new HttpClient())
            {
                using HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<T>(responseBody, new JsonSerializerOptions()
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
            }
        }
    }

    public interface IHttpService
    {
        Task<T> Get<T>(string url);
    }
}
