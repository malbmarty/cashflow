from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError

class Status(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class TransactionType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    transaction_type = models.ForeignKey(TransactionType, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Subcategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Transaction(models.Model):
    date = models.DateField()
    status = models.ForeignKey(Status, on_delete=models.PROTECT)
    transaction_type = models.ForeignKey(TransactionType, on_delete=models.PROTECT)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    subcategory = models.ForeignKey(Subcategory, on_delete=models.PROTECT)
    amount = models.DecimalField(decimal_places=2, max_digits=20, validators=[MinValueValidator(0.01)])
    comment = models.CharField(max_length=100, null=True, blank=True)

    # Проверка выполнения бизнес-правил
    def clean(self):
        # Проверка, что подкатегория принадлежит выбранной категории
        if self.subcategory.category != self.category:
            raise ValidationError({
                'subcategory': 'Выбранная подкатегория не принадлежит выбранной категории'
            })
        
        # Проверка, что категория принадлежит выбранному типу операции
        if self.category.transaction_type != self.transaction_type:
            raise ValidationError({
                'category': 'Выбранная категория не принадлежит выбранному типу операции'
            })
    
    def save(self, *args, **kwargs):
        """Переопределение save для автоматической валидации"""
        self.full_clean()
        super().save(*args, **kwargs)


