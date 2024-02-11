using Dribbly.Web.Models;
using Dribbly.Web.Services;
using Dribbly.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;

namespace Dribbly.Web.Controllers
{
    public class BlogController : Controller
    {
        private readonly IConfiguration _config;
        private readonly IHttpService _http;
        private readonly ClientSettings _clienSettings;

        public BlogController(IConfiguration config,
            IOptions<ClientSettings> clientSettingsAccessor,
            IHttpService http)
        {
            _config = config;
            _http = http;
            _clienSettings = clientSettingsAccessor.Value;
        }

        public async Task<IActionResult> Index(string slug)
        {
            var blog = await _http.Get<IndexedEntityModel>
                ($"{_clienSettings.ServiceBase}/api/blogs/entity/{slug}");
            var vm = new MainViewModel(_clienSettings, blog.Name, blog.IconUrl);
            vm.Description = blog.Description;
            return View("Views/Main/Index.cshtml", vm);
        }
    }
}