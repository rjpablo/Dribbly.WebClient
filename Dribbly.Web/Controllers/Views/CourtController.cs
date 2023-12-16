using Dribbly.Web.Enums;
using Dribbly.Web.Models;
using Dribbly.Web.Services;
using Dribbly.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;

namespace Dribbly.Web.Controllers
{
    public class CourtController : Controller
    {
        private readonly IConfiguration _config;
        private readonly IHttpService _http;
        private readonly ClientSettings _clienSettings;
        private readonly string _pageDescription = "Check out {0} and other Basketball courts for rent on FreeHoops.net. See schedule, rental rates, photos and more.";

        public CourtController(IConfiguration config,
            IOptions<ClientSettings> clientSettingsAccessor,
            IHttpService http)
        {
            _config = config;
            _http = http;
            _clienSettings = clientSettingsAccessor.Value;
        }

        private async Task<IndexedEntityModel> GetEntity(long courtId, string description = "")
        {
            var court = await _http.Get<IndexedEntityModel>
                ($"{_clienSettings.ServiceBase}/api/shared/getIndexedEntity/{EntityTypeEnum.Court}/{courtId}");
            return court;
        }

        private async Task<MainViewModel> GetViewModel(long courtId, string titleTemplate = "")
        {
            var court = await _http.Get<IndexedEntityModel>
                ($"{_clienSettings.ServiceBase}/api/shared/getIndexedEntity/{EntityTypeEnum.Court}/{courtId}");
            var vm = new MainViewModel(_clienSettings, string.Format(titleTemplate, court.Name), court.IconUrl);
            vm.Description = string.Format(_pageDescription, court.Name);
            return vm;
        }

        public async Task<IActionResult> Index(long courtId)
        {
            var vm = await GetViewModel(courtId, "{0}");
            return View("Views/Main/Index.cshtml", vm);
        }

        public async Task<IActionResult> Details(long courtId)
        {
            var vm = await GetViewModel(courtId, "{0} - Details");
            return View("Views/Main/Index.cshtml", vm);
        }

        public async Task<IActionResult> Games(long courtId)
        {
            var vm = await GetViewModel(courtId, "Games at {0}");
            return View("Views/Main/Index.cshtml", vm);
        }

        public async Task<IActionResult> Photos(long courtId)
        {
            var vm = await GetViewModel(courtId, "{0} Photos");
            return View("Views/Main/Index.cshtml", vm);
        }

        public async Task<IActionResult> Videos(long courtId)
        {
            var vm = await GetViewModel(courtId, "{0} Videos");
            return View("Views/Main/Index.cshtml", vm);
        }
    }
}