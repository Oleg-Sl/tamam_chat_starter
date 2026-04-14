import re
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

# 2026-04-14 17:05:12,948 - root - INFO - {'placement': 'CRM_DYNAMIC_131_DETAIL_ACTIVITY', 'placement_option': '{"ID":"1701"}'}
# 2026-04-14 17:05:12,948 - root - INFO - {'ID': '1701'}
# 2026-04-14 17:05:12,948 - root - INFO - {'entity_type': '', 'entity_id': '1701'}
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

            if placement.startswith("CRM_DYNAMIC_"):
                context["entity_type"] = "smart"
                context["entity_type_id"] = re.sub(r'CRM_DYNAMIC_(\d+)_.*', r'\1', placement)

            data = json.loads(placement_option)
            context["entity_id"] = data.get("ID")

            logging.info(data)

        except Exception as err:
            logging.error(f"Error: {err}")
            context["error"] = str(err)

        logging.info(context)
        return render(request, self.TEMPLATE_NAME, context=context)
