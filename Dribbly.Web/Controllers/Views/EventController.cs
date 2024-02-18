using Dribbly.Web.Enums;
using Dribbly.Web.Models;
using Dribbly.Web.Services;
using Dribbly.Web.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;

namespace Dribbly.Web.Controllers
{
    public class EventController : Controller
    {
        private readonly IHttpService _http;
        private readonly ClientSettings _clienSettings;

        public EventController(IOptions<ClientSettings> clientSettingsAccessor,
            IHttpService http)
        {
            _http = http;
            _clienSettings = clientSettingsAccessor.Value;
        }

        private async Task<MainViewModel> GetViewModel(long evtId, string titleTemplate = "")
        {
            var evt = await _http.Get<IndexedEntityModel>
                ($"{_clienSettings.ServiceBase}/api/shared/getIndexedEntity/{EntityTypeEnum.Event}/{evtId}");
            var vm = new MainViewModel(_clienSettings, string.Format(titleTemplate, evt.Name), evt.IconUrl);
            vm.Description = string.Format(evt.Description, evt.Name);
            return vm;
        }

        public async Task<IActionResult> Index(long eventId)
        {
            var vm = await GetViewModel(eventId, "{0}");
            return View("Views/Main/Index.cshtml", vm);
        }

        public async Task<IActionResult> Attendees(long eventId)
        {
            var vm = await GetViewModel(eventId, "{0} - Attendees");
            return View("Views/Main/Index.cshtml", vm);
        }
    }
}