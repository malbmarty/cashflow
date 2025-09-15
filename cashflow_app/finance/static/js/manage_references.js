// Общие функции для всех справочников
function editItem(type, id, name) {
    document.getElementById(`${type}Id`).value = id;
    document.querySelector(`#${type}Form input[name="name"]`).value = name;
    document.querySelector(`#${type}Form`).scrollIntoView();
}

// Отчистка формы
function clearForm(formId) {
    document.getElementById(formId).reset();
    document.getElementById(formId).querySelector('input[type="hidden"]').value = '';
}

// Удаление записи выбранной записи из справочника
function deleteItem(endpoint, id) {
    if (confirm('Удалить запись?')) {
        fetch(`/api/${endpoint}/${id}/`, {
            method: 'DELETE',
            // headers: {
            //     'X-CSRFToken': getCookie('csrftoken')
            // }
        })
        .then(response => {
            if (response.ok) {
                location.reload();
            } else {
                alert('Ошибка при удалении');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ошибка при удалении');
        });
    }
}

function editCategory(id, name, typeId) {
    document.getElementById('categoryId').value = id;
    document.querySelector('#categoryForm input[name="name"]').value = name;
    document.getElementById('categoryType').value = typeId;
    document.getElementById('categoryForm').scrollIntoView();
}

function editSubcategory(id, name, categoryId) {
    document.getElementById('subcategoryId').value = id;
    document.querySelector('#subcategoryForm input[name="name"]').value = name;
    document.getElementById('subcategoryCategory').value = categoryId;
    updateSubcategoryType();
    document.getElementById('subcategoryForm').scrollIntoView();
}

function updateSubcategoryType() {
    const categorySelect = document.getElementById('subcategoryCategory');
    const selectedOption = categorySelect.options[categorySelect.selectedIndex];
    const typeId = selectedOption ? selectedOption.getAttribute('data-type') : '';
    
    const typeDisplay = document.getElementById('subcategoryTypeDisplay');
    if (typeId) {
        // Найти название типа по ID
        const typeOption = document.querySelector(`#categoryType option[value="${typeId}"]`);
        typeDisplay.textContent = typeOption ? typeOption.textContent : 'Неизвестно';
    } else {
        typeDisplay.textContent = '—';
    }
}

// Обработчики форм
document.addEventListener('DOMContentLoaded', function() {
    // Статусы
    document.getElementById('statusForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveItem('statuses', this);
    });

    // Типы
    document.getElementById('typeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveItem('types', this);
    });

    // Категории
    document.getElementById('categoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveItem('categories', this);
    });

    // Подкатегории
    document.getElementById('subcategoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveItem('subcategories', this);
    });
});

// Загрузка и редактирование записи
function saveItem(endpoint, form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const id = data.id;
    const url = id ? `/api/${endpoint}/${id}/` : `/api/${endpoint}/`;
    const method = id ? 'PUT' : 'POST';

    // Преобразование числовых полей
    if (data.transaction_type) data.transaction_type = parseInt(data.transaction_type);
    if (data.category) data.category = parseInt(data.category);

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            // 'X-CSRFToken': getCSRFToken(),
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            location.reload();
        } else {
            return response.json().then(errorData => {
                throw new Error(errorData.detail || 'Ошибка сохранения');
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ошибка при сохранении: ' + error.message);
    });
}

// function getCSRFToken() {
//     return document.querySelector('[name=csrfmiddlewaretoken]').value;
// }

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

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    updateSubcategoryType();
});