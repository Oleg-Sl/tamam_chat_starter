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
            "auth_token": request.data.get("AUTH_ID", ""),
            "expires_in": request.data.get("AUTH_EXPIRES", 3600),
            "refresh_token": request.data.get("REFRESH_ID", ""),
            "application_token": request.query_params.get("APP_SID", ""),
            'client_endpoint': f'https://{request.query_params.get("DOMAIN", "")}/rest/',
        }

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
            placement = request.data.get("PLACEMENT", "")
            placement_option = request.data.get("PLACEMENT_OPTIONS", "")
            logging.info({
                "placement": placement,
                "placement_option": placement_option
            })

            for prefix, entity_type in self.PLACEMENT_PREFIX_MAPPING.items():
                if placement.startswith(prefix):
                    context["entity_type"] = entity_type
                    break

            data = json.loads(placement_option)
            context["id"] = data.get("ID")

        except Exception as err:
            logging.error(f"Error: {err}")
            context["error"] = str(err)

        return render(request, self.TEMPLATE_NAME, context=context)
