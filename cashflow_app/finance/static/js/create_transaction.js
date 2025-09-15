
// Загрузка списка категорий доступных по выбранному типу
function loadCategories() {
    const typeId = document.getElementById('transactionType').value;
    if (!typeId) return;
    
    fetch(`/api/categories/?transaction_type=${typeId}`)
        .then(response => response.json())
        .then(categories => {
            const select = document.getElementById('category');
            select.innerHTML = '<option value="">Выберите категорию</option>';
            
            categories.forEach(cat => {
                select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            });
            
            // Очищаем подкатегории
            document.getElementById('subcategory').innerHTML = '<option value="">Выберите категорию сначала</option>';
        });
}

// Загрузка списка подкатегорий доступных по выбранной категории
function loadSubcategories() {
    const categoryId = document.getElementById('category').value;
    if (!categoryId) return;
    
    fetch(`/api/subcategories/?category=${categoryId}`)
        .then(response => response.json())
        .then(subcategories => {
            const select = document.getElementById('subcategory');
            select.innerHTML = '<option value="">Выберите подкатегорию</option>';
            
            subcategories.forEach(sub => {
                select.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
            });
        });
}

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('currentDate').value = formattedDate;
});

// Создание новой транзакции
document.getElementById('transactionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    fetch('/api/transactions/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
           'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                // Создаем объект ошибки с данными от сервера
                const error = new Error('Validation Error');
                error.responseData = errorData;
                throw error;
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Запись создана успешно!');
        this.reset(); // Очищаем форму
    })
    .catch(error => {
        if (error.responseData) {
            // Обрабатываем ошибки валидации из сериализатора
            let errorMessage = 'Ошибки валидации:\n\n';
            
            // Проходим по всем полям с ошибками
            for (const [field, message] of Object.entries(error.responseData)) {
                const fieldName = field;
                errorMessage += `• ${fieldName}: ${message}\n`;
            }
            
            alert(errorMessage);
        } else {
            alert('Ошибка при создании записи: ' + error.message);
        }
    });
});

// Функция для получения CSRF токена
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}