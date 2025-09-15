from django.shortcuts import get_object_or_404
from rest_framework import viewsets, filters, status
from rest_framework.exceptions import ValidationError
from django.views.generic import TemplateView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend


from .serializers import (
    StatusSerializer, TypeSerializer, CategorySerializer,
    SubcategorySerializer, TransactionSerializer
)
from .models import Status, TransactionType, Category, Subcategory, Transaction
from .filters import TransactionFilter, CategoriesFilter, SubcategoriesFilter


# HTML Views
# Для главной страницы
class HomePageView(TemplateView):
    template_name = 'finance/transactions.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Получаем все данные из базы и передаем в шаблон
        context['statuses'] = Status.objects.all()
        context['types'] = TransactionType.objects.all()
        context['categories'] = Category.objects.all()
        context['subcategories'] = Subcategory.objects.all()
        
        return context

# Для страницы редактирования записи
class EditTransactionView(TemplateView):
    template_name = 'finance/edit_transaction.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        transaction_id = self.kwargs.get('pk')
        
        # Получаем транзакцию или возвращаем 404
        transaction = get_object_or_404(Transaction, id=transaction_id)
        
        # Сериализуем данные транзакции
        serializer = TransactionSerializer(transaction)
        
        # Добавляем данные в контекст
        context['transaction'] = serializer.data
        context['date'] = transaction.date.strftime('%Y-%m-%d')
        context['statuses'] = Status.objects.all()
        context['types'] = TransactionType.objects.all()
        context['categories'] = Category.objects.all()
        context['subcategories'] = Subcategory.objects.all()
        
        return context

# Для страницы создания записи
class CreateTransactionView(TemplateView):
    template_name = 'finance/create_transaction.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Получаем все данные из базы и передаем в шаблон
        context['statuses'] = Status.objects.all()
        context['types'] = TransactionType.objects.all()
        context['categories'] = Category.objects.all()
        context['subcategories'] = Subcategory.objects.all()
        
        return context
    
# Для страницы управления справочниками
class ManageReferencesView(TemplateView):
    template_name = 'finance/manage_references.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Загружаем все справочники
        context['statuses'] = Status.objects.all()
        context['types'] = TransactionType.objects.all()
        context['categories'] = Category.objects.all().select_related('transaction_type')
        context['subcategories'] = Subcategory.objects.all().select_related('category__transaction_type')
        
        return context

# API 
class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

class TypeViewSet(viewsets.ModelViewSet):
    queryset = TransactionType.objects.all()
    serializer_class = TypeSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CategoriesFilter

class SubcategoryViewSet(viewsets.ModelViewSet):
    queryset = Subcategory.objects.all()
    serializer_class = SubcategorySerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = SubcategoriesFilter

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    # Подключение фильтрации
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TransactionFilter
    ordering_fields = ['date', 'amount']
    ordering = ['-date']  

    # Валидация данных 
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)




