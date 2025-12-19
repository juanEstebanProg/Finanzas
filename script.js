// Finance App JavaScript
class FinanceApp {
    constructor() {
        this.data = {
            movements: [],
            debts: {
                debo: [],
                meDeben: []
            }
        };
        
        // Helper function to get local date in YYYY-MM-DD format
        this.getLocalDateString = (date = new Date()) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Helper function to format numbers as Colombian pesos (no decimals, thousands separator)
this.formatPeso = (amount) => {
    return Math.trunc(amount).toLocaleString('es-CO');
};


        // Helper function to parse formatted peso input back to number
        this.parsePeso = (formattedAmount) => {
            return parseFloat(formattedAmount.replace(/\./g, ''));
        };
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.filteredMovements = [];
        this.isAuthenticated = false;
        this.githubToken = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupCalendar();
        this.render();
        this.setupAuth();
    }

    // Data Management
    loadData() {
        const savedData = localStorage.getItem('financeAppData');
        if (savedData) {
            this.data = JSON.parse(savedData);
        }
        this.filteredMovements = [...this.data.movements];
    }

    saveData() {
        localStorage.setItem('financeAppData', JSON.stringify(this.data));
    }

    // Authentication Setup
    setupAuth() {
        // Check if user is authenticated with GitHub
        const token = localStorage.getItem('githubToken');
        if (token) {
            this.githubToken = token;
            this.isAuthenticated = true;
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        const authSection = document.getElementById('authSection');
        if (this.isAuthenticated) {
            authSection.innerHTML = `
                <div class="user-info">
                    <span class="user-name">Conectado</span>
                    <button id="logoutBtn" class="logout-btn">Salir</button>
                </div>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        } else {
            authSection.innerHTML = '<button id="loginBtn" class="login-btn">Iniciar Sesión</button>';
            document.getElementById('loginBtn').addEventListener('click', () => {
                this.showGitHubModal();
            });
        }
    }

    login() {
        // Redirect to GitHub OAuth
        const clientId = 'Ov23liqB78H3oprtrrWG'; // You'll need to set this up
        const redirectUri = encodeURIComponent(window.location.origin + '/callback');
        const scope = 'repo';
        
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
        window.location.href = authUrl;
    }

    logout() {
        localStorage.removeItem('githubToken');
        this.githubToken = null;
        this.isAuthenticated = false;
        this.updateAuthUI();
        this.showNotification('Sesión cerrada', 'success');
    }

    // GitHub Sync
    async syncWithGitHub() {
        if (!this.isAuthenticated) {
            this.showGitHubModal();
            return;
        }

        const syncBtn = document.getElementById('syncBtn');
        syncBtn.classList.add('syncing');
        syncBtn.querySelector('.sync-text').textContent = 'Sincronizando...';

        try {
            // Sync data with GitHub
            await this.pushToGitHub();
            await this.pullFromGitHub();
            this.showNotification('Datos sincronizados correctamente', 'success');
        } catch (error) {
            console.error('Error syncing:', error);
            this.showNotification('Error al sincronizar datos', 'error');
        } finally {
            syncBtn.classList.remove('syncing');
            syncBtn.querySelector('.sync-text').textContent = 'Sincronizar';
        }
    }

    async pushToGitHub() {
        // This would implement pushing data to GitHub
        // For now, we'll simulate the process
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Data pushed to GitHub');
                resolve();
            }, 1000);
        });
    }

    async pullFromGitHub() {
        // This would implement pulling data from GitHub
        // For now, we'll simulate the process
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Data pulled from GitHub');
                resolve();
            }, 1000);
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Bottom navigation (mobile)
        document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.bottom-nav-btn').dataset.tab);
            });
        });

        // Sync button
        document.getElementById('syncBtn').addEventListener('click', () => {
            this.syncWithGitHub();
        });

        // Modal handlers
        document.querySelectorAll('.modal-close, .cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Movement form
        document.getElementById('movementForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMovement();
        });

        // Debt form
        document.getElementById('debtForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDebt();
        });

        // Payment form
        document.getElementById('paymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });

        // Filter handlers
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Add buttons
        document.getElementById('addMovementBtn').addEventListener('click', () => {
            this.showMovementModal();
        });

        document.getElementById('addDebtBtn').addEventListener('click', () => {
            this.showDebtModal('debo');
        });

        document.getElementById('addCreditBtn').addEventListener('click', () => {
            this.showDebtModal('meDeben');
        });

        // Debt tabs
        document.getElementById('deboTab').addEventListener('click', () => {
            this.switchDebtTab('debo');
        });

        document.getElementById('meDebenTab').addEventListener('click', () => {
            this.switchDebtTab('meDeben');
        });

        // GitHub modal
        document.getElementById('githubLogin').addEventListener('click', () => {
            this.login();
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });

        // Auto-format peso inputs in real-time
        const pesoInputs = ['movementAmount', 'debtAmount', 'paymentAmount', 'minAmount', 'maxAmount'];
        pesoInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', (e) => {
                    // Remove all non-digits and format
                    const value = e.target.value.replace(/\D/g, '');
                    if (value) {
                        const formatted = this.formatPeso(value);
                        e.target.value = formatted;
                    }
                });
            }
        });
    }

    // Tab Navigation
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn, .bottom-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(btn => {
            btn.classList.add('active');
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Render content for the active tab
        this.renderTab(tabName);
    }

    renderTab(tabName) {
        switch (tabName) {
            case 'calendar':
                this.renderCalendar();
                this.renderDayDetails();
                break;
            case 'movements':
                this.renderAllMovements();
                break;
            case 'debts':
                this.renderDebts();
                break;
            case 'filters':
                this.renderFilteredResults();
                break;
        }
    }

    // Calendar Setup and Rendering
    setupCalendar() {
        this.renderCalendar();
        this.updateCurrentDate();
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('es-ES', options);
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Clear previous calendar
        calendar.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            calendar.appendChild(header);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendar.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            // Check if this day has movements
            const dayDate = new Date(year, month, day);
            const dayMovements = this.getMovementsForDate(dayDate);
            
            if (dayMovements.length > 0) {
                dayElement.classList.add('has-movements');
                const totalIncome = dayMovements
                    .filter(m => m.type === 'income')
                    .reduce((sum, m) => sum + m.amount, 0);
                const totalExpense = dayMovements
                    .filter(m => m.type === 'expense')
                    .reduce((sum, m) => sum + m.amount, 0);
                
                if (totalExpense > totalIncome) {
                    dayElement.classList.add('has-expenses');
                }
            }
            
            // Check if this is today
            if (day === today.getDate() && 
                month === today.getMonth() && 
                year === today.getFullYear()) {
                dayElement.classList.add('selected');
                this.selectedDate = dayDate;
            }
            
            // Add click event
            dayElement.addEventListener('click', () => {
                this.selectDate(dayDate);
            });
            
            calendar.appendChild(dayElement);
        }
    }

    selectDate(date) {
        this.selectedDate = date;
        
        // Update selected state
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Find and select the clicked day
        const dayElements = document.querySelectorAll('.calendar-day:not(.other-month)');
        const dayOfMonth = date.getDate();
        if (dayElements[dayOfMonth - 1]) {
            dayElements[dayOfMonth - 1].classList.add('selected');
        }
        
        this.renderDayDetails();
    }

getMovementsForDate(date) {
    const localDateString = this.getLocalDateString(date);
    return this.data.movements.filter(movement => movement.date === localDateString);
}


    renderDayDetails() {
        const dayDetails = document.getElementById('dayDetails');
        const selectedDateTitle = document.getElementById('selectedDateTitle');
        const dayMovements = document.getElementById('dayMovements');
        
        if (!this.selectedDate) {
            dayDetails.classList.add('hidden');
            return;
        }
        
        dayDetails.classList.remove('hidden');
        selectedDateTitle.textContent = `Movimientos del ${this.selectedDate.toLocaleDateString('es-ES')}`;
        
        const movements = this.getMovementsForDate(this.selectedDate);
        dayMovements.innerHTML = '';
        
        if (movements.length === 0) {
            dayMovements.innerHTML = `
                <div class="empty-state">
                    <p>No hay movimientos para este día</p>
                </div>
            `;
        } else {
            movements.forEach(movement => {
                const movementElement = this.createMovementElement(movement);
                dayMovements.appendChild(movementElement);
            });
        }
    }

    // Movement Management
    createMovementElement(movement) {
        const div = document.createElement('div');
        div.className = 'movement-item';
        
        const iconClass = movement.type === 'income' ? 'income' : 'expense';
        const iconSvg = movement.type === 'income' 
            ? '<path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>'
            : '<path d="M1 4v16h22V4z"></path>';
        
        div.innerHTML = `
            <div class="movement-icon ${iconClass}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    ${iconSvg}
                </svg>
            </div>
            <div class="movement-details">
                <div class="movement-description">${movement.description}</div>
                <div class="movement-meta">
                    <span>${movement.date.split('-').reverse().join('/')}</span>

                    <span>${new Date(movement.timestamp).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            </div>
            <div class="movement-amount ${movement.type}">
                ${movement.type === 'income' ? '+' : '-'}$${this.formatPeso(movement.amount)}
            </div>
        `;
        
        return div;
    }

    showMovementModal() {
        const modal = document.getElementById('movementModal');
        const form = document.getElementById('movementForm');
        const dateInput = document.getElementById('movementDate');
        
        // Set default date to selected date - fix timezone issue
        if (this.selectedDate) {
            // Format date as YYYY-MM-DD without timezone conversion
            const year = this.selectedDate.getFullYear();
            const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(this.selectedDate.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
        } else {
            // Default to today
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
        }
        
        modal.classList.add('active');
        document.getElementById('movementType').focus();
    }

    saveMovement() {
        const form = document.getElementById('movementForm');
        const formData = new FormData(form);
        
        // Fix date issue by ensuring we use the date correctly
        const selectedDateValue = document.getElementById('movementDate').value;
        const movement = {
            id: Date.now().toString(),
            type: document.getElementById('movementType').value,
            amount: this.parsePeso(document.getElementById('movementAmount').value),
            description: document.getElementById('movementDescription').value,
            date: selectedDateValue, // Use the date directly without timezone conversion
            timestamp: new Date().toISOString()
        };
        
        this.data.movements.push(movement);
        this.saveData();
        this.render();
        this.closeModals();
        this.showNotification('Movimiento guardado correctamente', 'success');
    }

    renderAllMovements() {
        const container = document.getElementById('allMovements');
        const movements = [...this.data.movements].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        container.innerHTML = '';
        
        if (movements.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No hay movimientos registrados</p>
                </div>
            `;
        } else {
            movements.forEach(movement => {
                const movementElement = this.createMovementElement(movement);
                container.appendChild(movementElement);
            });
        }
    }

    // Debt Management
    switchDebtTab(type) {
        // Update tab buttons
        document.querySelectorAll('.debt-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(type === 'debo' ? 'deboTab' : 'meDebenTab').classList.add('active');
        
        // Update sections
        document.querySelectorAll('.debt-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${type}Section`).classList.add('active');
        
        this.renderDebts();
    }

    showDebtModal(type) {
        const modal = document.getElementById('debtModal');
        const title = document.getElementById('debtModalTitle');
        const dueDateInput = document.getElementById('debtDueDate');
        
        title.textContent = type === 'debo' ? 'Nueva Deuda' : 'Nueva Deuda de Otros';
        
        // Set minimum date to today - fix timezone issue
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        dueDateInput.min = todayString;
        
        modal.classList.add('active');
        document.getElementById('debtPerson').focus();
    }

    saveDebt() {
        const form = document.getElementById('debtForm');
        const debtType = document.getElementById('deboTab').classList.contains('active') ? 'debo' : 'meDeben';
        
        const debt = {
            id: Date.now().toString(),
            person: document.getElementById('debtPerson').value,
            amount: this.parsePeso(document.getElementById('debtAmount').value),
            description: document.getElementById('debtDescription').value,
            dueDate: document.getElementById('debtDueDate').value,
            paidAmount: 0,
            createdAt: new Date().toISOString(),
            type: debtType
        };
        
        this.data.debts[debtType].push(debt);
        this.saveData();
        this.render();
        this.closeModals();
        this.showNotification('Deuda guardada correctamente', 'success');
    }

    createDebtElement(debt) {
        const div = document.createElement('div');
        div.className = 'debt-item';
        
        const progressPercentage = debt.amount > 0 ? (debt.paidAmount / debt.amount) * 100 : 0;
        const remainingAmount = debt.amount - debt.paidAmount;
        const isOverdue = new Date(debt.dueDate) < new Date() && remainingAmount > 0;
        
        div.innerHTML = `
            <div class="debt-header">
                <div class="debt-person">${debt.person}</div>
                <div class="debt-amount">$${this.formatPeso(remainingAmount)}</div>
            </div>
            ${debt.description ? `<div class="debt-description">${debt.description}</div>` : ''}
            <div class="debt-meta">
                <span>Vence: ${new Date(debt.dueDate).toLocaleDateString('es-ES')}</span>
                <span>Total: $${this.formatPeso(debt.amount)}</span>
                ${debt.paidAmount > 0 ? `<span>Pagado: $${this.formatPeso(debt.paidAmount)}</span>` : ''}
            </div>
            <div class="debt-progress">
                <div class="debt-progress-bar" style="width: ${progressPercentage}%"></div>
            </div>
            <div class="debt-actions">
                <button class="debt-btn" onclick="app.showPaymentModal('${debt.id}', '${debt.type}')">
                    Abonar
                </button>
                <button class="debt-btn primary" onclick="app.markAsPaid('${debt.id}', '${debt.type}')">
                    Marcar como Pagada
                </button>
            </div>
        `;
        
        return div;
    }

    renderDebts() {
        const deboList = document.getElementById('deboList');
        const meDebenList = document.getElementById('meDebenList');
        
        // Filter out fully paid debts (they get removed automatically)
        const activeDebo = this.data.debts.debo.filter(debt => debt.paidAmount < debt.amount);
        const activeMeDeben = this.data.debts.meDeben.filter(debt => debt.paidAmount < debt.amount);
        
        // Sort debts by due date
        const deboSorted = activeDebo.sort((a, b) => 
            new Date(a.dueDate) - new Date(b.dueDate)
        );
        const meDebenSorted = activeMeDeben.sort((a, b) => 
            new Date(a.dueDate) - new Date(b.dueDate)
        );
        
        // Render debo
        deboList.innerHTML = '';
        if (deboSorted.length === 0) {
            deboList.innerHTML = `
                <div class="empty-state">
                    <p>No tienes deudas activas</p>
                    <small>Las deudas pagadas se eliminan automáticamente</small>
                </div>
            `;
        } else {
            deboSorted.forEach(debt => {
                const debtElement = this.createDebtElement(debt);
                deboList.appendChild(debtElement);
            });
        }
        
        // Render me deben
        meDebenList.innerHTML = '';
        if (meDebenSorted.length === 0) {
            meDebenList.innerHTML = `
                <div class="empty-state">
                    <p>No tienes deudas de otros activas</p>
                    <small>Las deudas pagadas se eliminan automáticamente</small>
                </div>
            `;
        } else {
            meDebenSorted.forEach(debt => {
                const debtElement = this.createDebtElement(debt);
                meDebenList.appendChild(debtElement);
            });
        }
    }

    showPaymentModal(debtId, debtType) {
        const modal = document.getElementById('paymentModal');
        const form = document.getElementById('paymentForm');
        
        // Store current debt info
        form.dataset.debtId = debtId;
        form.dataset.debtType = debtType;
        
        modal.classList.add('active');
        document.getElementById('paymentAmount').focus();
    }

    processPayment() {
        const form = document.getElementById('paymentForm');
        const debtId = form.dataset.debtId;
        const debtType = form.dataset.debtType;
        const paymentAmount = this.parsePeso(document.getElementById('paymentAmount').value);
        const newDueDate = document.getElementById('newDueDate').value;
        
        const debt = this.data.debts[debtType].find(d => d.id === debtId);
        if (debt) {
            const previousPaidAmount = debt.paidAmount;
            debt.paidAmount += paymentAmount;
            
            // Update due date if provided
            if (newDueDate) {
                debt.dueDate = newDueDate;
            }
            
            // Create automatic movement for the payment
            const paymentMovement = {
                id: Date.now().toString(),
                type: debtType === 'debo' ? 'expense' : 'income',
                amount: paymentAmount,
                description: debtType === 'debo' 
                    ? `Abono a "${debt.person}" - ${debt.description || 'Sin descripción'}`
                    : `Me abono "${debt.person}" - ${debt.description || 'Sin descripción'}`,
                date: this.getLocalDateString(), // Today's date
                timestamp: new Date().toISOString()
            };
            
            this.data.movements.push(paymentMovement);
            
            // Check if debt is fully paid
            const isDebtFullyPaid = debt.paidAmount >= debt.amount;
            if (isDebtFullyPaid) {
                // Create final payment movement if not already included
                const remainingAmount = debt.amount - previousPaidAmount;
                if (remainingAmount > 0) {
                    const finalPaymentMovement = {
                        id: (Date.now() + 1).toString(),
                        type: debtType === 'debo' ? 'expense' : 'income',
                        amount: remainingAmount,
                        description: debtType === 'debo' 
                            ? `Pago final deuda "${debt.person}" - ${debt.description || 'Sin descripción'}`
                            : `Me paga "${debt.person}" - ${debt.description || 'Sin descripción'}`,
                        date: this.getLocalDateString(),
                        timestamp: new Date().toISOString()
                    };
                    this.data.movements.push(finalPaymentMovement);
                }
                
                // Remove the debt since it's fully paid
                this.data.debts[debtType] = this.data.debts[debtType].filter(d => d.id !== debtId);
                this.showNotification('Deuda completamente pagada y eliminada', 'success');
            } else {
                this.showNotification('Abono procesado correctamente', 'success');
            }
            
            this.saveData();
            this.render();
            this.closeModals();
        }
    }

    markAsPaid(debtId, debtType) {
        if (confirm('¿Estás seguro de que quieres marcar esta deuda como pagada?')) {
            const debt = this.data.debts[debtType].find(d => d.id === debtId);
            if (debt) {
                const remainingAmount = debt.amount - debt.paidAmount;
                
                // Create automatic movement for the final payment
                if (remainingAmount > 0) {
                    const finalPaymentMovement = {
                        id: Date.now().toString(),
                        type: debtType === 'debo' ? 'expense' : 'income',
                        amount: remainingAmount,
                        description: debtType === 'debo' 
                            ? `Pago final deuda "${debt.person}" - ${debt.description || 'Sin descripción'}`
                            : `Me paga "${debt.person}" - ${debt.description || 'Sin descripción'}`,
                        date: this.getLocalDateString(),
                        timestamp: new Date().toISOString()
                    };
                    this.data.movements.push(finalPaymentMovement);
                }
                
                // Update debt to fully paid
                debt.paidAmount = debt.amount;
                
                // Remove the debt since it's fully paid
                this.data.debts[debtType] = this.data.debts[debtType].filter(d => d.id !== debtId);
                
                this.saveData();
                this.render();
                this.showNotification('Deuda marcada como pagada y eliminada', 'success');
            }
        }
    }

    // Filter Management
    applyFilters() {
        const minAmountStr = document.getElementById('minAmount').value;
        const maxAmountStr = document.getElementById('maxAmount').value;
        const minAmount = minAmountStr ? this.parsePeso(minAmountStr) : 0;
        const maxAmount = maxAmountStr ? this.parsePeso(maxAmountStr) : Infinity;
        const description = document.getElementById('descriptionFilter').value.toUpperCase();
        
        this.filteredMovements = this.data.movements.filter(movement => {
            const amountInRange = movement.amount >= minAmount && movement.amount <= maxAmount;
            const descriptionMatch = !description || movement.description.toUpperCase().includes(description);
            return amountInRange && descriptionMatch;
        });
        
        this.renderFilteredResults();
        this.showNotification('Filtros aplicados', 'success');
    }

    clearFilters() {
        document.getElementById('minAmount').value = '';
        document.getElementById('maxAmount').value = '';
        document.getElementById('descriptionFilter').value = '';
        this.filteredMovements = [...this.data.movements];
        this.renderFilteredResults();
    }

    renderFilteredResults() {
        const container = document.getElementById('filteredResults');
        const movements = [...this.filteredMovements].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        if (movements.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No se encontraron movimientos con los filtros aplicados</p>
                </div>
            `;
        } else {
            container.innerHTML = '<h3>Resultados Filtrados</h3>';
            movements.forEach(movement => {
                const movementElement = this.createMovementElement(movement);
                container.appendChild(movementElement);
            });
        }
    }

    // Modal Management
    showGitHubModal() {
        document.getElementById('githubModal').classList.add('active');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        // Reset forms
        document.getElementById('movementForm').reset();
        document.getElementById('debtForm').reset();
        document.getElementById('paymentForm').reset();
    }

    // Summary Calculation
    calculateBalance() {
        const totalIncome = this.data.movements
            .filter(m => m.type === 'income')
            .reduce((sum, m) => sum + m.amount, 0);
        
        const totalExpense = this.data.movements
            .filter(m => m.type === 'expense')
            .reduce((sum, m) => sum + m.amount, 0);
        
        return totalIncome - totalExpense;
    }

    getLastMovement() {
        if (this.data.movements.length === 0) return null;
        return this.data.movements
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    }

    // Main Render Function
    render() {
        this.updateCurrentDate();
        this.renderSummary();
        this.renderCalendar();
        this.renderDayDetails();
        this.renderAllMovements();
        this.renderDebts();
        this.renderFilteredResults();
    }

    renderSummary() {
        const balance = this.calculateBalance();
        const lastMovement = this.getLastMovement();
        
        document.getElementById('balanceAmount').textContent = `$${this.formatPeso(Math.abs(balance))}`;
        document.getElementById('balanceAmount').className = `balance-amount ${balance >= 0 ? 'income' : 'expense'}`;
        
        if (lastMovement) {
            const date = new Date(lastMovement.date).toLocaleDateString('es-ES');
            document.getElementById('lastMovement').textContent = 
                `${lastMovement.type === 'income' ? 'Ingreso' : 'Egreso'}: ${lastMovement.description} (${date})`;
        } else {
            document.getElementById('lastMovement').textContent = 'No hay movimientos';
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinanceApp();
});

// Make app globally available for button onclick handlers
window.app = null;
