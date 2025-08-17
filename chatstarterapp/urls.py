from django.urls import include, path


from .views import (
    InstallView,
    IndexView
)


app_name = 'chatstarterapp'


urlpatterns = [
    path('index/', IndexView.as_view()),
    path('install/', InstallView.as_view()),
]

