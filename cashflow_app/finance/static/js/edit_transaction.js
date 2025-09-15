
// Загружаем категории по типу.
// preserveSelected — если true, используем data-selected-category и data-selected-subcategory (нужно для initial load).
async function loadCategories(preserveSelected = false) {
    const typeId = document.getElementById('transactionType').value;
    const categorySelect = document.getElementById('category');
    const subSelect = document.getElementById('subcategory');

    if (!typeId) {
        categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
        subSelect.innerHTML = '<option value="">Выберите категорию сначала</option>';
        categorySelect.value = '';
        subSelect.value = '';
        return;
    }

    // Показываем заглушки пока идут запросы
    categorySelect.innerHTML = '<option value="">Загрузка категорий...</option>';
    subSelect.innerHTML = '<option value="">Выберите категорию сначала</option>';

    try {
        const response = await fetch(`/api/categories/?transaction_type=${typeId}`);
        if (!response.ok) throw new Error('Ошибка при загрузке категорий');
        const categories = await response.json();

        // Построим options
        let html = '<option value="">Выберите категорию</option>';
        categories.forEach(cat => {
            html += `<option value="${cat.id}">${cat.name}</option>`;
        });
        categorySelect.innerHTML = html;

        if (preserveSelected && categorySelect.dataset.selectedCategory) {
            // начальная загрузка: выставляем категорию из data-*
            categorySelect.value = categorySelect.dataset.selectedCategory;
        } else {
            // пользователь изменил тип или просто обычный вызов: стереть сохранённую подкатегорию
            subSelect.dataset.selectedSubcategory = '';
            // не ставим value у category — оставляем пустым (пользователь выберет)
            // если хотите выбрать первый элемент автоматически — можно установить categorySelect.selectedIndex = 1;
        }

        // После установки категории загружаем подкатегории (preserveSelected прокидываем дальше)
        await loadSubcategories(preserveSelected);
    } catch (err) {
        console.error(err);
        categorySelect.innerHTML = '<option value="">Ошибка загрузки</option>';
        subSelect.innerHTML = '<option value="">Выберите категорию сначала</option>';
    }
}

// Загружаем подкатегории для выбранной категории.
// preserveSelected — если true, выставляем data-selected-subcategory (только при initial load).
async function loadSubcategories(preserveSelected = false) {
    const categoryId = document.getElementById('category').value;
    const subSelect = document.getElementById('subcategory');

    if (!categoryId) {
        subSelect.innerHTML = '<option value="">Выберите категорию сначала</option>';
        subSelect.value = '';
        return;
    }

    subSelect.innerHTML = '<option value="">Загрузка подкатегорий...</option>';

    try {
        const response = await fetch(`/api/subcategories/?category=${categoryId}`);
        if (!response.ok) throw new Error('Ошибка при загрузке подкатегорий');
        const subcategories = await response.json();

        let html = '<option value="">Выберите подкатегорию</option>';
        subcategories.forEach(sub => {
            html += `<option value="${sub.id}">${sub.name}</option>`;
        });
        subSelect.innerHTML = html;

        if (preserveSelected && subSelect.dataset.selectedSubcategory) {
            // начальная загрузка: выставляем подкатегорию из data-*
            subSelect.value = subSelect.dataset.selectedSubcategory;
        } else {
            // обычный вызов — очищаем выбор
            subSelect.value = '';
        }
    } catch (err) {
        console.error(err);
        subSelect.innerHTML = '<option value="">Ошибка загрузки</option>';
    }
}

// Инициализация при открытии страницы
document.addEventListener('DOMContentLoaded', async function() {
    const typeId = document.getElementById('transactionType').value;
    if (typeId) {
        // При начальной загрузке сохраняем выбранные значения (data-*)
        await loadCategories(true);
    } else {
        document.getElementById('category').innerHTML = '<option value="">Выберите тип</option>';
        document.getElementById('subcategory').innerHTML = '<option value="">Выберите категорию сначала</option>';
    }

    // Примечание: у вас в HTML уже есть onchange="loadCategories()" и onchange="loadSubcategories()".
    // Вызовы без аргумента используют preserve=false (т.е. будут обнулять подкатегорию) — это именно то, что нужно.
});

// Редактирование транзакции
document.getElementById('transactionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this;
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    const transactionId = window.location.pathname.split('/').filter(Boolean).pop();
    const successUrl = form.dataset.successUrl;

    fetch(`/api/transactions/${transactionId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                const error = new Error('Validation Error');
                error.responseData = errorData;
                throw error;
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Запись отредактирована успешно!');
        window.location.href = successUrl;
    })
    .catch(error => {
        if (error.responseData) {
            let errorMessage = 'Ошибки валидации:\n\n';
            for (const [field, message] of Object.entries(error.responseData)) {
                errorMessage += `• ${field}: ${message}\n`;
            }
            alert(errorMessage);
        } else {
            alert('Ошибка при редактировании записи: ' + error.message);
        }
    });
});

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
