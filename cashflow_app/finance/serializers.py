from rest_framework import serializers
from .models import Status, TransactionType, Category, Subcategory, Transaction

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    transaction_type_name = serializers.CharField(source='transaction_type.name', read_only=True)
    
    class Meta:
        model = Category
        fields = '__all__'

class SubcategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    transaction_type_name = serializers.CharField(source='category.transaction_type.name', read_only=True)

    class Meta:
        model = Subcategory
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    status_name = serializers.CharField(source='status.name', read_only=True)
    transaction_type_name = serializers.CharField(source='transaction_type.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    comment = serializers.CharField(allow_blank=True, required=False)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'date', 'status', 'transaction_type', 'category', 'subcategory',
            'amount', 'comment',
            'status_name', 'transaction_type_name', 'category_name', 'subcategory_name'
            ]
    
    # Проверка выполнения бизнес-правил
    def validate(self, attrs):
        # Комплексная проверка для всех HTTP-методов
        instance = getattr(self, 'instance', None)
        
        subcategory = attrs.get('subcategory')
        category = attrs.get('category')
        transaction_type = attrs.get('transaction_type')
        
        if instance:
            if subcategory is None:
                subcategory = instance.subcategory
            if category is None:
                category = instance.category
            if transaction_type is None:
                transaction_type = instance.transaction_type
        
        errors = {}
        
        # Проверка подкатегории
        if subcategory and category and subcategory.category != category:
            errors['subcategory'] = 'Выбранная подкатегория не принадлежит выбранной категории'
        
        # Проверка категории
        if category and transaction_type and category.transaction_type != transaction_type:
            errors['category'] = 'Выбранная категория не принадлежит выбранному типу операции'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return attrs
    
 

