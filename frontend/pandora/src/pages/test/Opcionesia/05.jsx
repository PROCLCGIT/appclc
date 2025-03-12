import React, { useState, useEffect } from 'react';

// Estilos CSS en línea para mantener todo en un solo archivo
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    color: '#4CAF50',
    fontSize: '24px',
    marginRight: '10px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    margin: '20px 0',
    padding: '20px',
  },
  balanceLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  balanceAmount: {
    fontSize: '38px',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '20px',
    margin: '20px 0',
  },
  button: {
    flex: 1,
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
    border: '1px solid #e0e0e0',
  },
  incomeButton: {
    color: '#4CAF50',
  },
  expenseButton: {
    color: '#F44336',
  },
  circleIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10px',
    fontSize: '18px',
  },
  plusIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    color: '#4CAF50',
  },
  minusIcon: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    color: '#F44336',
  },
  transactionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    color: '#4CAF50',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  rightArrow: {
    marginLeft: '5px',
  },
  transactionList: {
    width: '100%',
  },
  transaction: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  transactionInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  transactionTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
  },
  transactionDate: {
    fontSize: '14px',
    color: '#888',
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
  income: {
    color: '#4CAF50',
  },
  expense: {
    color: '#F44336',
  },
  emptyState: {
    textAlign: 'center',
    padding: '30px 0',
    color: '#888',
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  allTransactionsModalContent: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '95%',
    maxWidth: '800px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#888',
  },
  form: {
    padding: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px',
  },
  expenseSaveButton: {
    backgroundColor: '#F44336',
  },
  transactionsTableContainer: {
    overflowY: 'auto',
    padding: '0 20px',
    flexGrow: 1,
  },
  transactionsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  tableCell: {
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #e0e0e0',
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  emptyTable: {
    textAlign: 'center',
    padding: '30px 0',
    color: '#888',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
    borderTop: '1px solid #e0e0e0',
  },
  exportButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#F44336',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

const CajaChica = () => {
  // Estados
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAllTransactionsModal, setShowAllTransactionsModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: '',
    notes: '',
    paymentMethod: ''
  });

  const STORAGE_KEY = 'cajachica_transactions';

  // Cargar transacciones al iniciar
  useEffect(() => {
    const storedTransactions = localStorage.getItem(STORAGE_KEY);
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      setTransactions(parsedTransactions);
    }
  }, []);

  // Actualizar balance cuando cambian las transacciones
  useEffect(() => {
    const newBalance = transactions.reduce((total, transaction) => {
      if (transaction.type === 'income') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
    
    setBalance(newBalance);
    
    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Resetear formulario
  const resetForm = (type) => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      amount: '',
      notes: '',
      paymentMethod: ''
    });
  };

  // Guardar transacción
  const saveTransaction = (type) => {
    if (!formData.date || !formData.description || !formData.category || !formData.amount || formData.amount <= 0) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }
    
    if (type === 'expense' && !formData.paymentMethod) {
      alert('Por favor selecciona un método de pago');
      return;
    }
    
    const newTransaction = {
      id: Date.now(),
      type,
      date: formData.date,
      description: formData.description,
      category: formData.category,
      amount: parseFloat(formData.amount),
      notes: formData.notes,
      paymentMethod: type === 'expense' ? formData.paymentMethod : null
    };
    
    setTransactions(prev => {
      const newTransactions = [...prev, newTransaction];
      return newTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    resetForm(type);
    closeModal(type);
  };

  // Eliminar transacción
  const deleteTransaction = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    }
  };

  // Borrar todas las transacciones
  const clearAllTransactions = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar TODAS las transacciones? Esta acción no se puede deshacer.')) {
      setTransactions([]);
      setShowAllTransactionsModal(false);
    }
  };

  // Exportar a CSV
  const exportToCSV = () => {
    if (transactions.length === 0) {
      alert('No hay transacciones para exportar');
      return;
    }
    
    // Ordenar transacciones por fecha
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let csvContent = 'Fecha,Tipo,Descripción,Categoría,Importe,Método de Pago,Notas\n';
    
    sortedTransactions.forEach(transaction => {
      const type = transaction.type === 'income' ? 'Ingreso' : 'Gasto';
      const amount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      const paymentMethod = transaction.paymentMethod || 'N/A';
      
      const row = [
        formatDate(transaction.date),
        type,
        `"${transaction.description.replace(/"/g, '""')}"`,
        transaction.category,
        amount.toFixed(2),
        paymentMethod,
        `"${(transaction.notes || '').replace(/"/g, '""')}"`
      ].join(',');
      
      csvContent += row + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'control_caja_chica.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Abrir modal
  const openModal = (type) => {
    if (type === 'income') {
      setShowIncomeModal(true);
    } else if (type === 'expense') {
      setShowExpenseModal(true);
    } else if (type === 'allTransactions') {
      setShowAllTransactionsModal(true);
    }
  };

  // Cerrar modal
  const closeModal = (type) => {
    if (type === 'income') {
      setShowIncomeModal(false);
    } else if (type === 'expense') {
      setShowExpenseModal(false);
    } else if (type === 'allTransactions') {
      setShowAllTransactionsModal(false);
    }
    resetForm(type);
  };

  // Modal de ingresos
  const IncomeModal = () => (
    <div 
      style={styles.modalBackdrop} 
      onClick={() => closeModal('income')}
    >
      <div 
        style={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>Registrar Ingreso</div>
          <span 
            style={styles.closeButton}
            onClick={() => closeModal('income')}
          >
            &times;
          </span>
        </div>
        
        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="date">Fecha:</label>
            <input
              style={styles.input}
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="description">Descripción:</label>
            <input
              style={styles.input}
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ej: Venta de productos"
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="category">Categoría:</label>
            <select
              style={styles.input}
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">-- Selecciona una categoría --</option>
              <option value="Ventas">Ventas</option>
              <option value="Inversión">Inversión</option>
              <option value="Préstamo">Préstamo</option>
              <option value="Reembolso">Reembolso</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="amount">Importe ($):</label>
            <input
              style={styles.input}
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="notes">Notas adicionales:</label>
            <textarea
              style={styles.input}
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
            />
          </div>
          
          <button
            style={styles.saveButton}
            type="button"
            onClick={() => saveTransaction('income')}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de gastos
  const ExpenseModal = () => (
    <div 
      style={styles.modalBackdrop} 
      onClick={() => closeModal('expense')}
    >
      <div 
        style={styles.modalContent} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>Registrar Gasto</div>
          <span 
            style={styles.closeButton}
            onClick={() => closeModal('expense')}
          >
            &times;
          </span>
        </div>
        
        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="date">Fecha:</label>
            <input
              style={styles.input}
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="description">Descripción:</label>
            <input
              style={styles.input}
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ej: Compra de suministros"
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="category">Categoría:</label>
            <select
              style={styles.input}
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">-- Selecciona una categoría --</option>
              <option value="Suministros">Suministros</option>
              <option value="Servicios">Servicios</option>
              <option value="Salarios">Salarios</option>
              <option value="Transporte">Transporte</option>
              <option value="Impuestos">Impuestos</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="amount">Importe ($):</label>
            <input
              style={styles.input}
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="paymentMethod">Método de pago:</label>
            <select
              style={styles.input}
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">-- Selecciona método de pago --</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="notes">Notas adicionales:</label>
            <textarea
              style={styles.input}
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
            />
          </div>
          
          <button
            style={{ ...styles.saveButton, ...styles.expenseSaveButton }}
            type="button"
            onClick={() => saveTransaction('expense')}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de todas las transacciones
  const AllTransactionsModal = () => (
    <div 
      style={styles.modalBackdrop} 
      onClick={() => closeModal('allTransactions')}
    >
      <div 
        style={styles.allTransactionsModalContent} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>Todas las Transacciones</div>
          <span 
            style={styles.closeButton}
            onClick={() => closeModal('allTransactions')}
          >
            &times;
          </span>
        </div>
        
        <div style={styles.transactionsTableContainer}>
          {transactions.length === 0 ? (
            <div style={styles.emptyTable}>No hay transacciones registradas</div>
          ) : (
            <table style={styles.transactionsTable}>
              <thead>
                <tr>
                  <th style={{ ...styles.tableCell, ...styles.tableHeader }}>Fecha</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeader }}>Descripción</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeader }}>Categoría</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeader, textAlign: 'right' }}>Importe</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeader, textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => {
                  const { id, type, date, description, category, amount } = transaction;
                  const isIncome = type === 'income';
                  
                  return (
                    <tr key={id}>
                      <td style={styles.tableCell}>{formatDate(date)}</td>
                      <td style={styles.tableCell}>{description}</td>
                      <td style={styles.tableCell}>{category}</td>
                      <td style={{ ...styles.tableCell, textAlign: 'right', color: isIncome ? '#4CAF50' : '#F44336' }}>
                        {isIncome ? '+' : '-'}${amount.toFixed(2)}
                      </td>
                      <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                        <button
                          style={styles.deleteButton}
                          onClick={() => deleteTransaction(id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        <div style={styles.modalActions}>
          <button style={styles.exportButton} onClick={exportToCSV}>
            Exportar a CSV
          </button>
          <button style={styles.clearButton} onClick={clearAllTransactions}>
            Borrar todo
          </button>
        </div>
      </div>
    </div>
  );

  // Componente de transacción
  const Transaction = ({ transaction }) => {
    const { type, date, description, category, amount } = transaction;
    const isIncome = type === 'income';
    
    return (
      <div style={styles.transaction}>
        <div style={styles.transactionInfo}>
          <div style={styles.transactionTitle}>{description}</div>
          <div style={styles.transactionDate}>{formatDate(date)} • {category}</div>
        </div>
        <div style={{ ...styles.transactionAmount, color: isIncome ? '#4CAF50' : '#F44336' }}>
          {isIncome ? '+' : '-'}${amount.toFixed(2)}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>$</div>
        <div style={styles.title}>Control de Caja Chica</div>
      </header>

      {/* Balance Card */}
      <div style={styles.card}>
        <div style={styles.balanceLabel}>Balance Actual</div>
        <div style={{ ...styles.balanceAmount, color: balance >= 0 ? '#4CAF50' : '#F44336' }}>
          ${balance.toFixed(2)}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.buttonContainer}>
        <div 
          style={{ ...styles.button, ...styles.incomeButton }}
          onClick={() => openModal('income')}
        >
          <div style={{ ...styles.circleIcon, ...styles.plusIcon }}>+</div>
          Registrar Ingreso
        </div>
        <div 
          style={{ ...styles.button, ...styles.expenseButton }}
          onClick={() => openModal('expense')}
        >
          <div style={{ ...styles.circleIcon, ...styles.minusIcon }}>-</div>
          Registrar Gasto
        </div>
      </div>

      {/* Transaction List */}
      <div style={styles.card}>
        <div style={styles.transactionsHeader}>
          <div style={styles.sectionTitle}>Transacciones Recientes</div>
          <div 
            style={styles.viewAll}
            onClick={() => openModal('allTransactions')}
          >
            Ver todas <span style={styles.rightArrow}>→</span>
          </div>
        </div>
        
        <div style={styles.transactionList}>
          {transactions.length === 0 ? (
            <div style={styles.emptyState}>
              No hay transacciones registradas
            </div>
          ) : (
            transactions.slice(0, 5).map(transaction => (
              <Transaction key={transaction.id} transaction={transaction} />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showIncomeModal && <IncomeModal />}
      {showExpenseModal && <ExpenseModal />}
      {showAllTransactionsModal && <AllTransactionsModal />}
    </div>
  );
};

export default CajaChica;