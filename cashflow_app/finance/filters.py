from django_filters import FilterSet, DateFilter
from .models import Category, Subcategory, Transaction

# Фильтр для транзакций
class TransactionFilter(FilterSet):
    date_from = DateFilter(field_name='date', lookup_expr='gte')
    date_to = DateFilter(field_name='date', lookup_expr='lte')
    
    class Meta:
        model = Transaction
        fields = {
            'status': ['exact'],
            'transaction_type': ['exact'],
            'category': ['exact'],
            'subcategory': ['exact'],
        }

# Фильтр для категорий
class CategoriesFilter(FilterSet):
    
    class Meta:
        model = Category
        fields = {
            'transaction_type': ['exact'],
        }

# Фильтр для подкатегорий
class SubcategoriesFilter(FilterSet):
    
    class Meta:
        model = Subcategory
        fields = {
            'category': ['exact'],
        }