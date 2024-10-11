document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cita');
    const citasContainer = document.getElementById('citas-container');
    let editIndex = -1; // Índice de la cita a editar

    loadCitas();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fecha = document.getElementById('fecha').value;
        const nombre = document.getElementById('nombre').value;
        const numeroOrden = document.getElementById('numeroOrden').value;
        const hora = document.getElementById('hora').value;

        const cita = { fecha, nombre, numeroOrden, hora };

        if (editIndex >= 0) {
            updateCita(editIndex, cita);
            editIndex = -1; // Reiniciar índice después de editar
        } else {
            saveCita(cita);
        }

        form.reset();
        loadCitas();
    });

    function saveCita(cita) {
        let citas = JSON.parse(localStorage.getItem('citas')) || [];
        citas.push(cita);
        localStorage.setItem('citas', JSON.stringify(citas));
    }

    function updateCita(index, cita) {
        let citas = JSON.parse(localStorage.getItem('citas'));
        citas[index] = cita;
        localStorage.setItem('citas', JSON.stringify(citas));
    }

    function loadCitas() {
        const citas = JSON.parse(localStorage.getItem('citas')) || [];
        const citasGrouped = groupCitasByMonth(citas);
        displayCitas(citasGrouped);
    }

    function groupCitasByMonth(citas) {
        return citas.reduce((acc, cita) => {
            const month = new Date(cita.fecha).toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!acc[month]) {
                acc[month] = [];
            }
            acc[month].push(cita);
            return acc;
        }, {});
    }

    function displayCitas(citasGrouped) {
        citasContainer.innerHTML = '';
        for (const month in citasGrouped) {
            const table = document.createElement('table');
            table.innerHTML = `<thead><tr><th>Fecha</th><th>Cliente</th><th>Número de Orden</th><th>Hora</th><th>Acciones</th></tr></thead><tbody>`;
            citasGrouped[month].forEach((cita, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${cita.fecha}</td>
                    <td>${cita.nombre}</td>
                    <td>${cita.numeroOrden}</td>
                    <td>${cita.hora}</td>
                    <td>
                        <button onclick="editCita(${index})">Editar</button>
                        <button onclick="deleteCita(${index})">Eliminar</button>
                        <button onclick="sendWhatsApp('${cita.nombre}', '${cita.fecha}', '${cita.hora}', '${cita.numeroOrden}')">Enviar WhatsApp</button>
                    </td>
                `;
                table.querySelector('tbody').appendChild(row);
            });
            table.innerHTML += '</tbody>';
            citasContainer.appendChild(document.createElement('h3')).innerText = month;
            citasContainer.appendChild(table);
        }
    }

    window.deleteCita = (index) => {
        let citas = JSON.parse(localStorage.getItem('citas'));
        citas.splice(index, 1);
        localStorage.setItem('citas', JSON.stringify(citas));
        loadCitas();
    };

    window.editCita = (index) => {
        editIndex = index; // Establecer índice de edición
        const citas = JSON.parse(localStorage.getItem('citas'));
        const cita = citas[index];
        
        // Rellenar el formulario con los datos de la cita
        document.getElementById('fecha').value = cita.fecha;
        document.getElementById('nombre').value = cita.nombre;
        document.getElementById('numeroOrden').value = cita.numeroOrden;
        document.getElementById('hora').value = cita.hora;
    };

    window.sendWhatsApp = (nombre, fecha, hora, numeroOrden) => {
        const date = new Date(`${fecha}T${hora}`);
        const currentHour = date.getHours();
        let greeting;

        if (currentHour < 12) {
            greeting = "Hola estimado cliente, muy buenos días";
        } else {
            greeting = "Hola estimado cliente, muy buenas tardes";
        }

        const message = `${greeting}, un gusto en saludarle. Su hora está agendada para el ${fecha} a las ${hora}. Número de orden de compra: ${numeroOrden}.`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };
});
