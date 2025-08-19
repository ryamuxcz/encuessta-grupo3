// Simulación de API con localStorage
const API = {
  // Obtener todas las opiniones
  getOpiniones: () => {
    const opiniones = localStorage.getItem('opiniones');
    return opiniones ? JSON.parse(opiniones) : [];
  },
  
  // Guardar una nueva opinión
  saveOpinion: (opinion) => {
    const opiniones = API.getOpiniones();
    
    if (opinion.id) {
      // Editar opinión existente
      const index = opiniones.findIndex(op => op.id === opinion.id);
      if (index !== -1) {
        opiniones[index] = opinion;
      }
    } else {
      // Nueva opinión
      opinion.id = Date.now(); // ID único basado en timestamp
      opiniones.push(opinion);
    }
    
    localStorage.setItem('opiniones', JSON.stringify(opiniones));
    return opinion;
  },
  
  // Eliminar una opinión por ID
  deleteOpinion: (id) => {
    let opiniones = API.getOpiniones();
    // Convertir id a número para comparación
    const idNum = typeof id === 'string' ? parseInt(id) : id;
    opiniones = opiniones.filter(op => op.id !== idNum);
    localStorage.setItem('opiniones', JSON.stringify(opiniones));
    return true;
  },
  
  // Obtener una opinión por ID
  getOpinion: (id) => {
    const opiniones = API.getOpiniones();
    const idNum = typeof id === 'string' ? parseInt(id) : id;
    return opiniones.find(op => op.id === idNum);
  }
};

// Mostrar notificación
function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.toggle('error', isError);
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Limpiar formulario
function clearForm() {
  document.getElementById('opinionForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('submitBtn').textContent = 'Enviar Opinión';
  document.getElementById('cancelBtn').style.display = 'none';
}

// Cargar datos en formulario para editar
function loadFormData(opinion) {
  document.getElementById('editId').value = opinion.id;
  document.getElementById('nombre').value = opinion.nombre;
  document.getElementById('opinion').value = opinion.opinion;
  document.getElementById('satisfaccion').value = opinion.satisfaccion;
  document.getElementById('submitBtn').textContent = 'Actualizar Opinión';
  document.getElementById('cancelBtn').style.display = 'inline-block';
}

// Mostrar opinión completa en modal
function showOpinionModal(opinion) {
  document.getElementById('modalNombre').textContent = opinion.nombre;
  document.getElementById('modalOpinion').textContent = opinion.opinion;
  document.getElementById('modalSatisfaccion').textContent = opinion.satisfaccion;
  
  const modal = document.getElementById('opinionModal');
  modal.style.display = 'block';
}

// Renderizar opiniones en la tabla
function renderOpiniones() {
  const opiniones = API.getOpiniones();
  const tbody = document.querySelector('#tablaOpiniones tbody');
  
  tbody.innerHTML = '';
  
  if (opiniones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay opiniones registradas aún</td></tr>';
    return;
  }
  
  opiniones.forEach(opinion => {
    const tr = document.createElement('tr');
    
    // Acortar opinión larga para la vista de tabla
    const shortOpinion = opinion.opinion.length > 100 
      ? opinion.opinion.substring(0, 100) + '...' 
      : opinion.opinion;
    
    tr.innerHTML = `
      <td>${opinion.nombre}</td>
      <td class="opinion-cell" title="${opinion.opinion}">${shortOpinion}</td>
      <td>${opinion.satisfaccion}</td>
      <td>
        <button class="btn-view" data-id="${opinion.id}">Ver</button>
        <button class="btn-edit" data-id="${opinion.id}">Editar</button>
        <button class="btn-delete" data-id="${opinion.id}">Eliminar</button>
      </td>
    `;
    
    tbody.appendChild(tr);
  });
  
  // Agregar event listeners a los botones
  document.querySelectorAll('.btn-view').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      const opinion = API.getOpinion(id);
      if (opinion) {
        showOpinionModal(opinion);
      }
    });
  });
  
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      const opinion = API.getOpinion(id);
      if (opinion) {
        loadFormData(opinion);
        // Scroll al formulario
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (confirm('¿Estás seguro de que quieres eliminar esta opinión?')) {
        API.deleteOpinion(id);
        renderOpiniones();
        showNotification('Opinión eliminada correctamente');
      }
    });
  });
  
  // Hacer las celdas de opinión clickeables para mostrar el modal
  document.querySelectorAll('.opinion-cell').forEach(cell => {
    cell.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      const id = row.querySelector('.btn-view').getAttribute('data-id');
      const opinion = API.getOpinion(id);
      if (opinion) {
        showOpinionModal(opinion);
      }
    });
  });
}

// Manejar el envío del formulario
document.getElementById('opinionForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const id = document.getElementById('editId').value;
  const nombre = document.getElementById('nombre').value.trim();
  const opinion = document.getElementById('opinion').value.trim();
  const satisfaccion = document.getElementById('satisfaccion').value;
  
  // Validación adicional
  if (!nombre || !opinion || !satisfaccion) {
    showNotification('Por favor, completa todos los campos', true);
    return;
  }
  
  // Guardar la opinión
  const opinionData = { nombre, opinion, satisfaccion };
  if (id) {
    opinionData.id = parseInt(id);
  }
  
  API.saveOpinion(opinionData);
  
  // Mostrar notificación de éxito
  showNotification(id ? '¡Opinión actualizada correctamente!' : '¡Opinión agregada correctamente!');
  
  // Resetear formulario
  clearForm();
  
  // Actualizar la tabla
  renderOpiniones();
});

// Cancelar edición
document.getElementById('cancelBtn').addEventListener('click', clearForm);

// Cerrar modal
document.querySelector('.close').addEventListener('click', function() {
  document.getElementById('opinionModal').style.display = 'none';
});

// Cerrar modal al hacer clic fuera de él
window.addEventListener('click', function(e) {
  const modal = document.getElementById('opinionModal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
  renderOpiniones();
  
  // Agregar algunos datos de ejemplo si no hay ninguno
  if (API.getOpiniones().length === 0) {
    const opinionesEjemplo = [
      { id: 1, nombre: "Juan Pérez", opinion: "Me gustó mucho el servicio, fue muy rápido y eficiente.", satisfaccion: "Muy satisfecho" },
      { id: 2, nombre: "María García", opinion: "El producto llegó en buen estado pero con un poco de retraso.", satisfaccion: "Satisfecho" }
    ];
    localStorage.setItem('opiniones', JSON.stringify(opinionesEjemplo));
    renderOpiniones();
  }
});
