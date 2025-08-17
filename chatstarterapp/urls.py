from django.urls import include, path
from rest_framework import routers


from .views import (
    InstallView,
)


app_name = 'api_v1'
router = routers.DefaultRouter()


urlpatterns = [
    path('', include(router.urls)),
    # path('index/', IndexApiView.as_view()),
    path('install/', InstallView.as_view()),
    # path('smart/<int:smart_type_id>/<int:smart_id>/', SmartApiView.as_view()),
    # path('get-image/', GetImage, name='get_image'),

]


urlpatterns += router.urls
