from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LectureViewSet

router = DefaultRouter()
router.register(r'lectures', LectureViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
