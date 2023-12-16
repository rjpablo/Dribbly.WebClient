using Dribbly.Web.Models;
using Dribbly.Web.Services;
using Dribbly.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;

namespace Dribbly.Web.Controllers
{
    public class AccountController : Controller
    {
        private readonly IConfiguration _config;
        private readonly IHttpService _http;
        private readonly ClientSettings _clienSettings;

        public AccountController(IConfiguration config,
            IOptions<ClientSettings> clientSettingsAccessor,
            IHttpService http)
        {
            _config = config;
            _http = http;
            _clienSettings = clientSettingsAccessor.Value;
        }

        public async Task<IActionResult> Index(string username)
        {
            var user = await _http.Get<IndexedEntityModel>
                ($"{_clienSettings.ServiceBase}/api/account/getaccountentity/{username}");
            var vm = new MainViewModel(_clienSettings, user.Name, user.IconUrl);
            vm.Description = $"Check out {user.Name}'s profile on FreeHoops.net. See {user.Name}'s highlights, photos, games, teams and more.";
            return View(vm);
        }
    }
}