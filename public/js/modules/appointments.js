/* ==========================================================================
   SALON & SPA MANAGEMENT - APPOINTMENTS MODULE
   ========================================================================== */

const AppointmentsModule = {
  appointments: [],
  filterStatus: 'ALL',
  searchQuery: '',

  async init() {
    this.bindEvents();
    await this.loadAppointments();
  },

  bindEvents() {
    const searchInput = document.getElementById('appointment-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderTable();
      });
    }

    const pills = document.querySelectorAll('.appointment-filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        pills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.filterStatus = e.target.dataset.status;
        this.renderTable();
      });
    });
  },

  async loadAppointments() {
    const tableBody = document.getElementById('appointments-table-body');
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <div class="loading-spinner"></div>
            <div style="margin-top: 10px;">Loading appointments...</div>
          </td>
        </tr>
      `;
    }

    try {
      const res = await API.appointments.getAll();
      this.appointments = res.data || [];
      this.renderTable();
    } catch (err) {
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="empty-state" style="color: var(--accent-rose);">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <div>Failed to load appointments: ${err.message}</div>
            </td>
          </tr>
        `;
      }
    }
  },

  renderTable() {
    const tableBody = document.getElementById('appointments-table-body');
    if (!tableBody) return;

    let filtered = this.appointments;

    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(a => a.status === this.filterStatus);
    }

    if (this.searchQuery) {
      filtered = filtered.filter(a => {
        const custName = a.customer_id ? a.customer_id.name.toLowerCase() : '';
        const barberName = a.barber_id && a.barber_id.user_id ? a.barber_id.user_id.name.toLowerCase() : '';
        const servName = a.service_id ? a.service_id.service_name.toLowerCase() : '';
        const remarks = a.remarks ? a.remarks.toLowerCase() : '';
        return custName.includes(this.searchQuery) ||
               barberName.includes(this.searchQuery) ||
               servName.includes(this.searchQuery) ||
               remarks.includes(this.searchQuery);
      });
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <i class="fa-solid fa-calendar-xmark"></i>
            <div class="empty-state-text">No matching appointments found</div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(app => {
      const customerName = app.customer_id ? app.customer_id.name : 'Unknown';
      const customerPhone = app.customer_id ? app.customer_id.phone : '-';
      const barberName = app.barber_id && app.barber_id.user_id ? app.barber_id.user_id.name : (app.barber_id ? 'Barber #' + (app.barber_id._id || app.barber_id).slice(-4) : 'Unassigned');
      const serviceName = app.service_id ? app.service_id.service_name : 'Custom Service';
      const servicePrice = app.service_id ? `$${app.service_id.price}` : '-';
      const dateFormatted = app.appointment_date ? new Date(app.appointment_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-';
      const remarks = app.remarks || '-';

      return `
        <tr>
          <td>
            <div style="font-weight: 600;">${customerName}</div>
            <div style="font-size: 0.78rem; color: var(--text-dim);"><i class="fa-solid fa-phone" style="font-size: 0.7rem;"></i> ${customerPhone}</div>
          </td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 0.4rem;">
              <i class="fa-solid fa-user-tie" style="color: var(--accent-gold); font-size: 0.8rem;"></i>
              ${barberName}
            </span>
          </td>
          <td>
            <div style="font-weight: 500;">${serviceName}</div>
            <div style="font-size: 0.78rem; color: var(--accent-gold); font-weight: 600;">${servicePrice}</div>
          </td>
          <td>
            <div style="font-size: 0.88rem;">${dateFormatted}</div>
          </td>
          <td>
            <select class="form-control" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; width: auto; background: var(--bg-card-solid);" onchange="AppointmentsModule.updateStatus('${app._id}', this.value)">
              <option value="Pending" ${app.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Confirmed" ${app.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="In Progress" ${app.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${app.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Cancelled" ${app.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td style="max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.82rem; color: var(--text-muted);" title="${remarks}">
            ${remarks}
          </td>
          <td style="text-align: right;">
            <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-icon" title="Edit" onclick="AppointmentsModule.openEditModal('${app._id}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-danger btn-icon" title="Delete" onclick="AppointmentsModule.confirmDelete('${app._id}')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async openCreateModal() {
    try {
      const [customersRes, barbersRes, servicesRes] = await Promise.all([
        API.customers.getAll(),
        API.barbers.getAll(),
        API.services.getAll(),
      ]);

      const customers = customersRes.data || [];
      const barbers = barbersRes.data || [];
      const services = servicesRes.data || [];

      const custSelect = document.getElementById('app-form-customer');
      const barberSelect = document.getElementById('app-form-barber');
      const serviceSelect = document.getElementById('app-form-service');

      if (custSelect) {
        custSelect.innerHTML = '<option value="">-- Select Customer --</option>' +
          customers.map(c => `<option value="${c._id}">${c.name} (${c.phone || 'No phone'})</option>`).join('');
      }

      if (barberSelect) {
        barberSelect.innerHTML = '<option value="">-- Select Barber --</option>' +
          barbers.map(b => {
            const name = b.user_id ? b.user_id.name : 'Barber #' + b._id.slice(-4);
            const spec = b.specialization ? ` - ${b.specialization}` : '';
            return `<option value="${b._id}">${name}${spec}</option>`;
          }).join('');
      }

      if (serviceSelect) {
        serviceSelect.innerHTML = '<option value="">-- Select Service --</option>' +
          services.map(s => `<option value="${s._id}">${s.service_name} ($${s.price} - ${s.duration}m)</option>`).join('');
      }

      document.getElementById('appointment-form').reset();
      document.getElementById('appointment-id').value = '';
      document.getElementById('appointment-modal-title').textContent = 'Book New Appointment';

      const now = new Date();
      now.setHours(now.getHours() + 1);
      now.setMinutes(0, 0, 0);
      const formatted = now.toISOString().slice(0, 16);
      document.getElementById('app-form-date').value = formatted;

      App.openModal('appointment-modal');
    } catch (err) {
      App.showToast('Error loading form data: ' + err.message, 'error');
    }
  },

  async openEditModal(id) {
    try {
      const app = this.appointments.find(a => a._id === id);
      if (!app) return;

      await this.openCreateModal();
      document.getElementById('appointment-modal-title').textContent = 'Edit Appointment';
      document.getElementById('appointment-id').value = app._id;
      
      if (app.customer_id) {
        document.getElementById('app-form-customer').value = app.customer_id._id || app.customer_id;
      }
      if (app.barber_id) {
        document.getElementById('app-form-barber').value = app.barber_id._id || app.barber_id;
      }
      if (app.service_id) {
        document.getElementById('app-form-service').value = app.service_id._id || app.service_id;
      }
      if (app.appointment_date) {
        const d = new Date(app.appointment_date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        document.getElementById('app-form-date').value = d.toISOString().slice(0, 16);
      }
      document.getElementById('app-form-status').value = app.status || 'Pending';
      document.getElementById('app-form-remarks').value = app.remarks || '';

    } catch (err) {
      App.showToast('Failed to open edit modal: ' + err.message, 'error');
    }
  },

  async saveAppointment(event) {
    event.preventDefault();
    const id = document.getElementById('appointment-id').value;
    const customer_id = document.getElementById('app-form-customer').value;
    const barber_id = document.getElementById('app-form-barber').value;
    const service_id = document.getElementById('app-form-service').value;
    const appointment_date = document.getElementById('app-form-date').value;
    const status = document.getElementById('app-form-status').value;
    const remarks = document.getElementById('app-form-remarks').value;

    if (!customer_id || !barber_id || !service_id || !appointment_date) {
      App.showToast('Please fill all required fields', 'warning');
      return;
    }

    const payload = {
      customer_id,
      barber_id,
      service_id,
      appointment_date: new Date(appointment_date).toISOString(),
      status,
      remarks,
    };

    try {
      if (id) {
        await API.appointments.update(id, payload);
        App.showToast('Appointment updated successfully', 'success');
      } else {
        await API.appointments.create(payload);
        App.showToast('Appointment booked successfully', 'success');
      }
      App.closeModal('appointment-modal');
      await this.loadAppointments();
      if (window.DashboardModule) window.DashboardModule.init();
    } catch (err) {
      App.showToast(err.message, 'error');
    }
  },

  async updateStatus(id, newStatus) {
    try {
      await API.appointments.update(id, { status: newStatus });
      App.showToast(`Status updated to ${newStatus}`, 'success');
      const item = this.appointments.find(a => a._id === id);
      if (item) item.status = newStatus;
      if (window.DashboardModule) window.DashboardModule.init();
    } catch (err) {
      App.showToast('Failed to update status: ' + err.message, 'error');
      this.renderTable();
    }
  },

  confirmDelete(id) {
    App.showConfirmModal(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      async () => {
        try {
          await API.appointments.delete(id);
          App.showToast('Appointment deleted successfully', 'success');
          await this.loadAppointments();
          if (window.DashboardModule) window.DashboardModule.init();
        } catch (err) {
          App.showToast('Failed to delete appointment: ' + err.message, 'error');
        }
      }
    );
  },
};

window.AppointmentsModule = AppointmentsModule;
