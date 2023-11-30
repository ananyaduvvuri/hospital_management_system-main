// markCompleted.js

const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const db = require.main.require('./models/db_controller');

// Route to handle marking appointments as completed
router.post('/markCompleted', (req, res) => {
  const appointmentId = req.body.appointmentId;

  // Fetch appointment details from the appointments table
  const getAppointmentQuery = 'SELECT * FROM appointments WHERE id = ?';
  db.query(getAppointmentQuery, [appointmentId], (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
      const appointment = results[0];

      // Insert the appointment into the past_appointments table
      const insertIntoPastAppointmentsQuery =
        'INSERT INTO past_appointments (p_id,id,patient_name,department,doctor_name,date,time,email,phone) VALUES (?, ?, ..., ?)';
      db.query(
        insertIntoPastAppointmentsQuery,
        [
            appointment.id,
            appointment.patient_name,
            appointment.department,
            appointment.doctor_name,
            appointment.date,
            appointment.time,
            appointment.email,
            appointment.phone
        ],
        (error) => {
          if (error) throw error;

          // Delete the appointment from the appointments table
          const deleteAppointmentQuery = 'DELETE FROM appointments WHERE id = ?';
          db.query(deleteAppointmentQuery, [appointmentId], (error) => {
            if (error) throw error;

            res.redirect('/appointment'); // Redirect to appointments page or wherever you want
          });
        }
      );
    } else {
      res.status(404).send('Appointment not found');
    }
  });
});

module.exports = router;
