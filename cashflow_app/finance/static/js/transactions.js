
// Загрузка таблицы транзакций после применения фильтров 
function loadTransactions() {
    const params = new URLSearchParams();
    const filters = ['date_from', 'date_to', 'status', 'transaction_type', 'category', 'subcategory'];
    
    filters.forEach(filter => {
        const value = document.getElementById(filter + 'Filter')?.value || 
                     document.getElementById(filter)?.value;
        if (value) params.append(filter, value);
    });

    fetch(`/api/transactions/?${params}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('transactionsBody');
            tbody.innerHTML = '';
            
            
            data.forEach(transaction => {
                // Форматирование даты
                const [year, month, day] = transaction.date.split('-');
                const formattedDate = `${day}.${month}.${year}`;
                const row = `
                    <tr>
                        <td>${formattedDate}</td>
                        <td>${transaction.status_name}</td>
                        <td>${transaction.transaction_type_name}</td>
                        <td>${transaction.category_name}</td>
                        <td>${transaction.subcategory_name}</td>
                        <td>${transaction.amount}</td>
                        <td>${transaction.comment || ''}</td>
                        <td>
                            <a href="/edit/${transaction.id}/">Редактировать</a>
                            <button onclick="deleteTransaction(${transaction.id})">Удалить</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        });
}

// Применение фильтров
function applyFilters() {
    loadTransactions();
}

// Отчистка полей фильтров
function clearFilters() {
    document.getElementById('filterForm').reset();
    loadTransactions();
}

// Удаление транзакции
function deleteTransaction(id) {
    if (confirm('Удалить запись?')) {
        fetch(`/api/transactions/${id}/`, { method: 'DELETE' })
            .then(() => loadTransactions());
    }
}

// Загружаем данные при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли на странице таблица транзакций
    if (document.getElementById('transactionsBody')) {
        loadTransactions();
    }
});