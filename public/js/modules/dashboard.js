/* ==========================================================================
   SALON & SPA MANAGEMENT - DASHBOARD MODULE
   ========================================================================== */

const DashboardModule = {
  async init() {
    this.renderLoading();
    await this.loadStats();
    await this.loadRecentAppointments();
  },

  renderLoading() {
    const container = document.getElementById('dashboard-recent-table');
    if (container) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            <div class="loading-spinner"></div>
            <div style="margin-top: 10px;">Loading dashboard overview...</div>
          </td>
        </tr>
      `;
    }
  },

  async loadStats() {
    try {
      const [appointmentsRes, customersRes, barbersRes, servicesRes] = await Promise.allSettled([
        API.appointments.getAll(),
        API.customers.getAll(),
        API.barbers.getAll(),
        API.services.getAll(),
      ]);

      const appointments = appointmentsRes.status === 'fulfilled' && appointmentsRes.value.data ? appointmentsRes.value.data : [];
      const customers = customersRes.status === 'fulfilled' && customersRes.value.data ? customersRes.value.data : [];
      const barbers = barbersRes.status === 'fulfilled' && barbersRes.value.data ? barbersRes.value.data : [];
      const services = servicesRes.status === 'fulfilled' && servicesRes.value.data ? servicesRes.value.data : [];

      const statAppointments = document.getElementById('stat-total-appointments');
      const statCustomers = document.getElementById('stat-total-customers');
      const statBarbers = document.getElementById('stat-total-barbers');
      const statServices = document.getElementById('stat-total-services');

      if (statAppointments) statAppointments.textContent = appointments.length;
      if (statCustomers) statCustomers.textContent = customers.length;
      if (statBarbers) statBarbers.textContent = barbers.length;
      if (statServices) statServices.textContent = services.length;

      const todayStr = new Date().toISOString().slice(0, 10);
      const todayAppointments = appointments.filter(a => {
        if (!a.appointment_date) return false;
        return new Date(a.appointment_date).toISOString().slice(0, 10) === todayStr;
      });

      const statToday = document.getElementById('stat-today-appointments');
      if (statToday) statToday.textContent = todayAppointments.length;

    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    }
  },

  async loadRecentAppointments() {
    const tableBody = document.getElementById('dashboard-recent-table');
    if (!tableBody) return;

    try {
      const res = await API.appointments.getAll();
      const appointments = res.data || [];

      if (appointments.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="empty-state">
              <i class="fa-solid fa-calendar-xmark"></i>
              <div class="empty-state-text">No appointments found</div>
              <p style="font-size: 0.85rem; color: var(--text-dim); margin-top: 0.3rem;">Create a new appointment to get started.</p>
            </td>
          </tr>
        `;
        return;
      }

      const sorted = [...appointments].sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)).slice(0, 6);

      tableBody.innerHTML = sorted.map(app => {
        const customerName = app.customer_id ? app.customer_id.name : 'Unknown Customer';
        const barberName = app.barber_id && app.barber_id.user_id ? app.barber_id.user_id.name : (app.barber_id ? 'Barber #' + (app.barber_id._id || app.barber_id).slice(-4) : 'Unassigned');
        const serviceName = app.service_id ? app.service_id.service_name : 'General Service';
        const servicePrice = app.service_id ? `$${app.service_id.price}` : '-';
        const dateFormatted = app.appointment_date ? new Date(app.appointment_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
        
        const statusClass = {
          'Pending': 'badge-pending',
          'Confirmed': 'badge-confirmed',
          'In Progress': 'badge-in-progress',
          'Completed': 'badge-completed',
          'Cancelled': 'badge-cancelled',
        }[app.status] || 'badge-pending';

        return `
          <tr>
            <td>
              <div style="font-weight: 600;">${customerName}</div>
              <div style="font-size: 0.75rem; color: var(--text-dim);">${app.customer_id && app.customer_id.phone ? app.customer_id.phone : ''}</div>
            </td>
            <td>
              <div>${serviceName}</div>
              <div style="font-size: 0.75rem; color: var(--accent-gold);">${servicePrice}</div>
            </td>
            <td>
              <span style="display: inline-flex; align-items: center; gap: 0.4rem;">
                <i class="fa-solid fa-scissors" style="color: var(--accent-gold); font-size: 0.8rem;"></i>
                ${barberName}
              </span>
            </td>
            <td>${dateFormatted}</td>
            <td><span class="badge ${statusClass}">${app.status}</span></td>
            <td style="text-align: right;">
              <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('appointments')">
                <i class="fa-solid fa-arrow-right"></i> View
              </button>
            </td>
          </tr>
        `;
      }).join('');

    } catch (err) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state" style="color: var(--accent-rose);">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div>Error loading recent appointments: ${err.message}</div>
          </td>
        </tr>
      `;
    }
  },
};

window.DashboardModule = DashboardModule;
