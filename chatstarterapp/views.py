import json
import logging

from django.views import View
from django.views.decorators.clickjacking import xframe_options_exempt
from django.shortcuts import render
# from django.http import HttpResponse


logging.basicConfig(filename='app.log', level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


class InstallView(View):
    TEMPLATE_NAME = 'chatstarterapp/install.html'

    @xframe_options_exempt
    def post(self, request):
        data = {
            "domain": request.GET.get("DOMAIN", ""),
            "auth_token": request.POST.get("AUTH_ID", ""),
            "expires_in": request.POST.get("AUTH_EXPIRES", 3600),
            "refresh_token": request.POST.get("REFRESH_ID", ""),
            "application_token": request.GET.get("APP_SID", ""),
            'client_endpoint': f'https://{request.GET.get("DOMAIN", "")}/rest/',
        }

        logging.info(data)

        # tokens.save_secrets(data)
        return render(request, self.TEMPLATE_NAME)


class IndexView(View):
    TEMPLATE_NAME = 'chatstarterapp/index.html'
    PLACEMENT_PREFIX_MAPPING = {
        "CRM_LEAD": "lead",
        "CRM_DEAL": "deal",
        "CRM_CONTACT": "contact",
    }

    @xframe_options_exempt
    def post(self, request):
        context = {
            "entity_type": "",
            "entity_id": None
        }

        try:
            placement = request.POST.get("PLACEMENT", "")
            placement_option = request.POST.get("PLACEMENT_OPTIONS", "")
            logging.info({
                "placement": placement,
                "placement_option": placement_option
            })

            for prefix, entity_type in self.PLACEMENT_PREFIX_MAPPING.items():
                if placement.startswith(prefix):
                    context["entity_type"] = entity_type
                    break

            data = json.loads(placement_option)
            context["entity_id"] = data.get("ID")

            logging.info(data)

        except Exception as err:
            logging.error(f"Error: {err}")
            context["error"] = str(err)

        logging.info(context)
        return render(request, self.TEMPLATE_NAME, context=context)
