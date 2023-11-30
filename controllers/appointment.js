var express = require('express');
var router = express.Router();
var db = require.main.require('./models/db_controller');
var bodyParser = require('body-parser');



router.get('*', function (req, res, next) {
  if (req.cookies['username'] == null) {
    res.redirect('/login');
  } else {
    next();
  }
});

router.get('/', function (req, res) {
  db.getallappointment(function (err, result) {
    console.log(result);
    res.render('appointment.ejs', { list: result });
  });
});

router.get('/add_appointment', function (req, res) {
  res.render('add_appointment.ejs');
});

router.post('/add_appointment', function (req, res) {
  db.add_appointment(
    req.body.p_name,
    req.body.department,
    req.body.d_name,
    req.body.date,
    req.body.time,
    req.body.email,
    req.body.phone,
    function (err, result) {
      res.redirect('/appointment');
    }
  );
});

router.get('/edit_appointment/:id', function (req, res) {
  var id = req.params.id;
  db.getappointmentbyid(id, function (err, result) {
    console.log(result);
    res.render('edit_appointment.ejs', { list: result });
  });
});

router.post('/edit_appointment/:id', function (req, res) {
  var id = req.params.id;
  db.editappointment(
    id,
    req.body.p_name,
    req.body.department,
    req.body.d_name,
    req.body.date,
    req.body.time,
    req.body.email,
    req.body.phone,
    function (err, result) {
      res.redirect('/appointment');
    }
  );
});


// Import necessary modules

router.get('/delete_appointment/:id', function(req, res){
    var id = req.params.id;
    db.getappointmentbyid(id, function(err, result){
        if (err) {
            console.error("Error retrieving appointment for deletion:", err);
            res.status(500).send("Internal Server Error");
            return;
        }

        console.log(result);
        res.render('delete_appointment.ejs', { list: result });
    });
});

router.post('/delete_appointment/:id', function(req, res){
    var id = req.params.id;
    db.deleteappointment(id, function(err, result){
        if (err) {
            console.error("Error deleting appointment:", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.redirect('/appointment');
    });
});
router.get('/mark_completed/:id', function(req, res) {
  var id = req.params.id;

  // Retrieve the appointment details before marking it as completed
  db.getappointmentbyid(id, function(err, appointment) {
    if (err || !appointment) {
      console.error("Error fetching appointment details:", err);
      res.status(500).send("Error fetching appointment details");
      return;
    }

    // Assuming addPastAppointment takes appointment details and a callback
    db.addPastAppointment(
      appointment.id,
      appointment.patient_name,
      appointment.department,
      appointment.doctor_name,
      appointment.date,
      appointment.time,
      appointment.email,
      appointment.phone,
      function(err) {
        if (err) {
          console.error("Error adding appointment to past_appointments:", err);
          res.status(500).send("Error adding appointment to past_appointments");
          return;
        }

        // Now, delete the appointment from the appointments table
        db.deleteappointment(id, function(err) {
          if (err) {
            console.error("Error deleting appointment:", err);
            res.status(500).send("Error deleting appointment");
            return;
          }

          // Redirect to the appointments page or any other page as needed
          res.redirect('/appointment');
        });
      }
    );
  });
});



module.exports = router;
