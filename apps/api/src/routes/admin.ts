import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient();

const reviewSchema = z.object({
  status: z.enum(['CONFIRMED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

export async function adminRoutes(fastify: FastifyInstance) {
  // Admin API: List all appointments
  fastify.get('/admin/appointments', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { documents: true },
    });

    return reply.send({
      count: appointments.length,
      appointments: appointments.map((a) => ({
        id: a.id,
        bookingRef: a.bookingRef,
        hospitalName: a.hospitalName,
        departmentName: a.departmentName,
        date: a.date,
        timeSlot: a.timeSlot,
        patientName: a.patientName,
        patientAge: a.patientAge,
        patientPhone: a.patientPhone,
        status: a.status,
        rejectionReason: a.rejectionReason,
        createdAt: a.createdAt.toISOString(),
        document: a.documents[0]
          ? {
              id: a.documents[0].id,
              documentType: a.documents[0].documentType,
              filename: a.documents[0].originalFilename,
              fileUrl: a.documents[0].fileUrl,
              verificationStatus: a.documents[0].verificationStatus,
            }
          : null,
      })),
    });
  });

  // Admin API: Confirm or Reject booking
  fastify.patch('/admin/appointments/:id', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = reviewSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid input',
        details: parseResult.error.errors,
      });
    }

    const { status, rejectionReason } = parseResult.data;

    const existing = await prisma.appointment.findUnique({
      where: { id },
      include: { documents: true },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Appointment not found' });
    }

    const docStatus = status === 'CONFIRMED' ? 'ACCEPTED' : 'REJECTED';

    const updated = await prisma.$transaction(async (tx) => {
      if (existing.documents.length > 0) {
        await tx.appointmentDocument.updateMany({
          where: { appointmentId: id },
          data: {
            verificationStatus: docStatus,
            rejectionReason: status === 'REJECTED' ? rejectionReason || 'Document details not verified' : null,
          },
        });
      }

      return tx.appointment.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason || 'Document could not be verified' : null,
        },
        include: { documents: true },
      });
    });

    return reply.send({
      success: true,
      appointment: {
        id: updated.id,
        bookingRef: updated.bookingRef,
        status: updated.status,
        rejectionReason: updated.rejectionReason,
      },
    });
  });

  // Minimal Protected Admin HTML Dashboard for Hospital Desk
  fastify.get('/admin', async (request, reply) => {
    const token = (request.query as { token?: string }).token || config.ADMIN_API_TOKEN;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hospital Desk - ReportSaathi Admin</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #F7FAF9; color: #1E293B; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #E2E8F0; }
    .header h1 { font-size: 22px; color: #0F766E; }
    .badge { background: #E6F4F1; color: #0F766E; padding: 6px 12px; border-radius: 12px; font-weight: 600; font-size: 13px; }
    .card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 20px; margin-bottom: 16px; border: 1px solid #E2E8F0; }
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
    th { background: #F1F5F9; padding: 12px; color: #475569; font-weight: 600; border-bottom: 2px solid #E2E8F0; }
    td { padding: 14px 12px; border-bottom: 1px solid #E2E8F0; vertical-align: middle; }
    tr:hover { background: #F8FAFC; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .status-PENDING_VERIFICATION { background: #FEF3C7; color: #92400E; }
    .status-CONFIRMED { background: #DCFCE7; color: #166534; }
    .status-REJECTED { background: #FEE2E2; color: #991B1B; }
    .status-CANCELLED { background: #E2E8F0; color: #475569; }
    .btn { cursor: pointer; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.85; }
    .btn-confirm { background: #0F766E; color: white; margin-right: 6px; }
    .btn-reject { background: #EF4444; color: white; }
    .btn-doc { background: #E0F2FE; color: #0369A1; text-decoration: none; padding: 5px 10px; border-radius: 6px; font-size: 12px; display: inline-block; }
    .token-input { padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 13px; width: 320px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>🏥 ${config.hospital.name}</h1>
      <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Appointment Verification Desk &bull; ReportSaathi</p>
    </div>
    <div style="display: flex; gap: 12px; align-items: center;">
      <input id="tokenInput" class="token-input" type="password" value="${token}" placeholder="Admin API Token" />
      <button class="btn btn-confirm" onclick="fetchAppointments()">Refresh</button>
    </div>
  </div>

  <div class="card">
    <div class="table-container">
      <table id="appointmentsTable">
        <thead>
          <tr>
            <th>Ref #</th>
            <th>Date & Time</th>
            <th>Patient</th>
            <th>Department</th>
            <th>Document</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          <tr><td colspan="7" style="text-align: center; color: #64748B;">Loading bookings...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    async function fetchAppointments() {
      const token = document.getElementById('tokenInput').value;
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading...</td></tr>';

      try {
        const res = await fetch('/admin/appointments', {
          headers: { 'x-admin-token': token }
        });
        if (!res.ok) throw new Error('Unauthorized or failed to fetch: ' + res.status);
        const data = await res.json();
        
        if (data.appointments.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748B;">No appointments booked yet.</td></tr>';
          return;
        }

        tbody.innerHTML = data.appointments.map(a => {
          const docLink = a.document 
            ? '<a class="btn-doc" target="_blank" href="' + a.document.fileUrl + '">View (' + a.document.documentType + ')</a>'
            : '<span style="color: #94A3B8;">No doc</span>';

          const actionButtons = a.status === 'PENDING_VERIFICATION' 
            ? '<button class="btn btn-confirm" onclick="updateStatus(\\'' + a.id + '\\', \\'CONFIRMED\\')">Approve</button>' +
              '<button class="btn btn-reject" onclick="promptReject(\\'' + a.id + '\\')">Reject</button>'
            : '<span style="color: #64748B; font-size: 12px;">Completed</span>';

          return '<tr>' +
            '<td><strong>' + a.bookingRef + '</strong></td>' +
            '<td>' + a.date + '<br><small style="color:#64748B;">' + a.timeSlot + '</small></td>' +
            '<td>' + a.patientName + ' (' + a.patientAge + 'y)<br><small style="color:#64748B;">' + a.patientPhone + '</small></td>' +
            '<td>' + a.departmentName + '</td>' +
            '<td>' + docLink + '</td>' +
            '<td><span class="status-badge status-' + a.status + '">' + a.status.replace('_', ' ') + '</span></td>' +
            '<td>' + actionButtons + '</td>' +
          '</tr>';
        }).join('');
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #EF4444;">' + err.message + '</td></tr>';
      }
    }

    async function updateStatus(id, status, rejectionReason) {
      const token = document.getElementById('tokenInput').value;
      try {
        const res = await fetch('/admin/appointments/' + id, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': token
          },
          body: JSON.stringify({ status, rejectionReason })
        });
        if (!res.ok) throw new Error('Action failed: ' + res.status);
        fetchAppointments();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }

    function promptReject(id) {
      const reason = prompt('Please enter the reason for rejection (will be shown to patient):', 'Document unreadable / Invalid ID');
      if (reason) {
        updateStatus(id, 'REJECTED', reason);
      }
    }

    fetchAppointments();
  </script>
</body>
</html>`;

    reply.type('text/html').send(html);
  });
}
