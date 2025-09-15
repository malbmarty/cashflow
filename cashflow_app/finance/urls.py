from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views 

router = DefaultRouter()
router.register(r'statuses', views.StatusViewSet)
router.register(r'types', views.TypeViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'subcategories', views.SubcategoryViewSet)
router.register(r'transactions', views.TransactionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('home/', views.HomePageView.as_view(), name='home'),
    path('create/', views.CreateTransactionView.as_view(), name='create'),
    path('edit/<int:pk>/', views.EditTransactionView.as_view(), name='edit'),
    path('manage/', views.ManageReferencesView.as_view(), name='manage'),
]