using Dribbly.Web.Models;
using Dribbly.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Dribbly.Web.Controllers
{
    public class MainController : Controller
    {
        private readonly IConfiguration _config;
        private readonly ClientSettings _clienSettings;

        public MainController(IConfiguration config, IOptions<ClientSettings> clientSettingsAccessor)
        {
            _config = config;
            _clienSettings = clientSettingsAccessor.Value;
        }

        public IActionResult Index()
        {
            return View(new MainViewModel(_clienSettings));
        }
    }
}