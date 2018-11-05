var http = require("http");
var express = require('express');
const path = require('path');
var app = express();
var mysql      = require('mysql');
var bodyParser = require('body-parser');
var url = require('url'); 
var querystring = require('querystring');
//var jwt = require('jsonwebtoken');
//var bcrypt = require('bcryptjs');
// var morgan = require('morgan');
var Sendgrid = require("sendgrid-web");
var nocache = require('nocache');
var uniqid = require('uniqid');
const datesBetween = require('dates-between');
// const nodemailer = require('nodemailer');
var sendgrid = new Sendgrid({
  user: "kunalsingh2000",//provide the login credentials
  key:"P@ssw0rd"
});

var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBldGmCaHXdYxOgjlHiwnEMV0EzD3Vt5iU'
});

// var connection = mysql.createPool({
//     connectionLimit : 1000,
//     host     : 'localhost',
//     user     : 'root',
//     password : '',
//     database : 'hawthorn_nodalDirect'
// });

var connection = mysql.createPool({
    connectionLimit : 1000,
    host     : '52.66.104.126',
    user     : 'hawthorn_nodal',
    password : 'TnyXnU7^[+5V',
    database : 'hawthorn_nodalDirect'
});
 
var prt = process.env.PORT || 3000;
process.env.NODE_ENV = 'production';
var server = app.listen(prt, function () {
   var host = server.address().address
   var port = server.address().port   
   console.log("Example app listening at http://%s:%s", host, port)
})

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// app.use(morgan('dev'));

//app.use(nocache());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, Access-Control-Allow-Headers, X-Requested-With, Content-Type, Accept, x-access-token");
  next();
});

// app.get('/robots.txt', function (req, res) {
//     res.type('text/plain');
//     res.send("User-agent: *\nDisallow: /");
// });


app.get('/api/allmaindata/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query("CALL `getMainData`('45')", function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
            console.log(error);
          }
          else{
            res.status(200).send({header : results[0] , property : results[1][0] , admin : results[2][0] , roomurl : results[3][0] , staticurl : results[4] , allroomurl : results[5] , allroomcontent : results[6] });
            //res.status(200).send(JSON.stringify(results))
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/allhomedata/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        con.query("CALL `getHomeData`('45')", function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
            console.log(error);
          }
          else{
              googleMapsClient.geocode({
                  address: results[2][0].companyName + ' , ' + results[2][0].address
                }, function(err, response) {
                  if (!err) {
                    var latitude = response.json.results[0].geometry.location.lat;
                    var longitude = response.json.results[0].geometry.location.lng;
                    res.status(200).send({homeslider : results[0] , metatags : results[1] , admin : { data :results[2][0] , lat : latitude , long : longitude} , homecontent : results[3][0] , awards : results[4] , reviews : results[5] , tripadvisor : results[6][0] , property : results[7][0] , roomcontent : results[8] , roomcontentpara : results[9][0]});
                }
                  else{
                    console.log(errors);
                    res.status(500).send({ error : errors });
                  }
              });
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/header/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM manage_header_footer where customerID = ' + cid + ' ORDER BY primary_sequence', function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/roomsurl/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM city_url where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});


app.get('/api/metatags/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM metaTags where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});


app.get('/api/staticurl/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT page_name , page_url FROM static_pages WHERE customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/sliderimg/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM HomeSlider where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/admindetail/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM admin_details where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/mainservice/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM static_page_whyperch where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/homecontent/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM homeContent where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/questions/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM quesAns where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/review/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM testimonials where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/awards/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM awards where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/allroom/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        console.log(cid);
        con.query('SELECT * FROM propertyRoom JOIN propertyImages on propertyRoom.roomID = propertyImages.roomID where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/roombyname/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var data = req.query;
      if(data.customerid != '' && data.customerid != undefined && data.customerid != null){
        //console.log(cid);
        con.query('SELECT * FROM propertyRoom JOIN propertyImages on propertyRoom.roomID = propertyImages.roomID where customerID = ' + data.customerid + ' AND room_url = "' + data.roomname +'"', function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/socialicon/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM admin_details where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/propertydetail/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM propertyTable where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/contactdetail/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM static_page_contactus WHERE customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/aboutdetail/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM static_page_tbl WHERE customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/teammembers/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM team_members WHERE customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/tripadvisorreview/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT visirTrip_advisor FROM propertyTable where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/roomurl/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT room_url FROM propertyRoom where customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/allroomcontent/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        con.query('SELECT * FROM city_url WHERE customerID = ' + cid, function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }
          else{
            res.status(200).send(JSON.stringify(results));
          }  
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/homeaddress/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
        //console.log(cid);
        var propertyname = '';
        con.query('SELECT propertyName,address,cityName,state,country FROM propertyTable WHERE customerID = ' + cid, function (error, results, fields) {
          if (error) {
              res.status(500).send({ error : error });
            }else{
              //console.log(results[0].propertyName);
              googleMapsClient.geocode({
                  address: results[0].propertyName + ', ' + results[0].address + ', ' + results[0].cityName + ', ' + results[0].state + ', ' + results[0].country
                }, function(err, response) {
                  if (!err) {
                    //console.log(propertyname + ', ' + results[0].address + ', ' + results[0].cityName + ', ' + results[0].state + ', ' + results[0].country);
                    var latitude = response.json.results[0].geometry.location.lat;
                    var longitude = response.json.results[0].geometry.location.lng;
                    res.status(200).send({propertyname: propertyname , address: results , lat : latitude , long : longitude});
                  }
                  else{
                    console.log(errors);
                    res.status(500).send({ error : errors });
                  }
              });
            }
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.post('/api/roombyid/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var roomid = req.body;
      //console.log(JSON.stringify(roomid));
      if(cid != '' && cid != undefined && cid != null){
        
        con.query('SELECT * from `propertyRoom` where `roomID` = "' + roomid.roomid + '" AND customerID = ' + cid, function (error, results, fields) {
          if (error){
            res.status(500).send({ error : error });
          }else{
            res.status(200).send(JSON.stringify(results));
          }
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.post('/api/getbookings/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var email = req.body;
      if(cid != '' && cid != undefined && cid != null){
        console.log(email.emailid);
        var query = 'SELECT * from `manage_booking` where `email` = "' + email.emailid + '" AND customerID = ' + cid;
        //console.log(query);
        con.query(query, function (error, results, fields) {
          if (error){
            res.status(500).send({ error : error });
          }else{
            res.status(200).send(JSON.stringify(results));
          }
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.post('/api/getbooking/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var book = req.body;
      if(cid != '' && cid != undefined && cid != null){
        var query = 'SELECT * from `manage_booking` where `booking_id` = "' + book.bookingid + '" AND customerID = ' + cid;
        //console.log(query);
        con.query(query, function (error, results, fields) {
          if (error){
            res.status(500).send({ error : error });
          }else{
            res.status(200).send(JSON.stringify(results));
          }
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/getgallery/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
         //console.log(cid);
        con.query('SELECT propertyID FROM propertyTable where customerID = ' + cid, function (error, results, fields) {
          if (error){
            res.status(500).send({ error : error });
          }else{
            prop = results[0].propertyID;
            con.query('SELECT * FROM propertyImages where propertyID = ' + prop, function (error, results, fields) {
              if (error) {
                 res.status(500).send({ error : error });
              }else{
               res.end(JSON.stringify(results));
              }
            });
          }
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.get('/api/activitycontent/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      if(cid != '' && cid != undefined && cid != null){
         //console.log(cid);
         con.query('SELECT * FROM static_page_clientsub WHERE customerID = ' + cid, function (error, results, fields) {
           if (error) {
              res.status(500).send({ error : error });
            }else{
              res.status(200).send(JSON.stringify(results));
           }
           con.release();
         });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.post('/api/checkavailability/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var roomdetail = req.body.dataobj;
      var avaarr = [];
      var counter = 0;
      if(cid != '' && cid != undefined && cid != null){
        for(var i=0;i<roomdetail.checkdates.length;i++){
          var dd = new Date(roomdetail.checkdates[i]);
          var roomcol = dd.getDate();
          var query = 'SELECT `' + roomcol + '` FROM manage_inventory WHERE year = ' + dd.getFullYear() + ' AND month = ' + (dd.getMonth()+1) + ' AND customerID = ' + cid + ' AND room_id = ' + roomdetail.roomId + ' AND `' + roomcol + '` IS NOT NULL';
          con.query(query, function (error, results, fields) {
            if (!error) {
              if(results.length > 0){
                avaarr.push(JSON.stringify(results).split(':"')[1].split('"}')[0]);
              }else{
                avaarr.push('0');
              }
              if(avaarr.length == roomdetail.checkdates.length){
                if(avaarr.indexOf('0') != -1){
                  res.status(200).send({status: 'NOT AVAILABLE'});
                  console.log('release');
                  //con.release();
                }else{
                  res.status(200).send({status: 'AVAILABLE'});
                  console.log('release');
                  //con.release();
                }
              }
            }
            else{
              res.status(500).send({ error : error });
            }
          });
        }
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        //con.release();
      }
    }
  })
});

app.post('/api/checkrates/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var roomdetail = req.body.dataobj;
      var avaarr = [];
      var counter = 0;
      if(cid != '' && cid != undefined && cid != null){
        for(var i=0;i<roomdetail.checkdates.length;i++){
          var dd = new Date(roomdetail.checkdates[i]);
          var roomcol = dd.getDate();
          var query = 'SELECT `' + roomcol + '` FROM manage_rate WHERE year = ' + dd.getFullYear() + ' AND month = ' + (dd.getMonth()+1) + ' AND customerID = ' + cid + ' AND room_id = ' + roomdetail.roomId + ' AND `' + roomcol + '` IS NOT NULL';
          con.query(query, function (error, results, fields) {
            if (!error) {
              //console.log(results.length);
              if(results.length > 0){
                avaarr.push(JSON.stringify(results).split(':"')[1].split('"}')[0]);
              }else{
                avaarr.push('0');
              }
              if(avaarr.length == roomdetail.checkdates.length){
                res.status(200).send(avaarr);
              }
            }
            else{
              res.status(500).send({ error : error });
            }
            //con.release();
          });
        }
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        //con.release();
      }
    }
  })
});

app.post('/api/signuproomdata/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var roomdetail = JSON.parse(req.body.dataobj);
      if(cid != '' && cid != undefined && cid != null){
        con.query('SELECT * FROM `propertyImages` JOIN `propertyRoom` ON `propertyImages`.roomID = `propertyRoom`.roomID WHERE propertyRoom.roomID = ' + roomdetail.roomId, function (error, results, fields) {
          if (!error) {
            res.status(200).send(JSON.stringify(results));
          }else{
            res.status(500).send({ error : error });
          }
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});




app.post('/api/emailinquiry/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var email_id = req.body.email;
      var newdate = new Date();
      var rec_date = newdate.getFullYear() + '-' + (newdate.getMonth() + 1) + '-' + newdate.getDate();
      console.log(email_id);
      connection.query('INSERT INTO `newsletter` (customerID, email, recvDate) VALUES (?, ?, ?)',
       [cid, email_id, rec_date], function (error, results, fields) {
         if (error){
          if(error.code == 'ER_DUP_ENTRY'){
            res.status(200).send({ success: "Already saved" ,status: 'OK' });
            con.release();
          }else{
            console.log(error.code)
            res.status(500).send({ error: error });
            con.release();
          }
         }else{
            res.status(200).send({ success: "Email saved" ,status: 'OK' });
            con.release();    
         }
      });    
    }
  })
});



app.post('/api/registeruser/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var bookingdetail = req.body.dataobj;
      connection.query('INSERT INTO users (customerID, booking_id, name, email_id, mobile, status, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
       [cid, bookingdetail.bookingid.toString(), bookingdetail.name, bookingdetail.email, bookingdetail.mobile,bookingdetail.status, bookingdetail.password], function (error, results, fields) {
         if (error){
            console.log(error)
            res.status(500).send({ error: "Internal Server Error" });
            con.release();
         }else{
            res.status(200).send({ success: "User registered" ,status: 'OK' ,data: { success: "logged in" ,status: 'OK' ,name: bookingdetail.name, email: bookingdetail.email }});
            con.release();    
         }
      });    
    }
  })
});

app.post('/api/bookingstatusupdate/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var bookingdetail = req.body;
      connection.query('UPDATE `manage_booking` SET `status` = "' + bookingdetail.status + '" WHERE `booking_id` = "' + bookingdetail.bookingid + '"', function (error, results, fields) {
         if (error){
            res.status(500).send({ error: "Internal Server Error" });
            con.release();
         }else{
            res.status(200).send({ success: "status Updated successfully" ,status: 'OK' ,result : results });
            con.release();
         }
      });    
    }
  })
});

app.post('/api/loginuser/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var bookingdetail = req.body.dataobj;
      con.query('SELECT * FROM users where email_id = "' + bookingdetail.email + '"', function (error, results, fields) {
        if (error) {
          console.log('/api/loginuser   ............   ' + error);
        }else{
          if(results.length == 0){
            res.status(200).send({ success: "no email" ,status: 'OK' });
            con.release();
          }
          else{
            if(results[0].password == bookingdetail.password){
              res.status(200).send({ success: "logged in" ,status: 'OK' ,emailid: results[0].email_id ,name: results[0].name });
              con.release();
            }else{
              res.status(200).send({ success: "wrong password" ,status: 'OK' });
              con.release();
            }
          }
        }
      });
    }
  })
});

app.post('/api/sendotp/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var bookingdetail = req.body;
      console.log(bookingdetail.email);
      if(bookingdetail.email != ""){
        var val = Math.floor(1000 + Math.random() * 9000);
        con.query('INSERT INTO otpVerify (otp, email_id) VALUES (?, ?)', 
          [val, bookingdetail.email],
          function (error, results, fields) {
            if (!error){
              // setup email data with unicode symbols
              // let mailOptions = {
              //     from: '"Fred Foo 👻" <foo@example.com>', // sender address
              //     to: 'bar@example.com, baz@example.com', // list of receivers
              //     subject: 'Hello ✔', // Subject line
              //     text: 'Hello world?', // plain text body
              //     html: '<b>Hello world?</b>' // html body
              // };

              // // send mail with defined transport object
              // transporter.sendMail(mailOptions, (error, info) => {
              //     if (error) {
              //         return console.log(error);
              //     }
              //     console.log('Message sent: %s', info.messageId);
              //     // Preview only available when sending through an Ethereal account
              //     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

              //     // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
              //     // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
              // });
              sendgrid.send({
                  to: [bookingdetail.email],
                  from: 'support@',
                  subject: 'OTP Verification',
                  html: '<p>Your OTP is <b>' + val + '</b> </p>' 
                }, function (err) {
                  if (err) {
                    res.json({error:'Error in sending otp'});
                  } else {
                    res.json({success:'sucessful'});
                  }
              });
            }else{
              res.status(500).send({ error: "Internal Server Error" });
            }
          }
        );
      }else{
        res.status(200).send({error : "Not an email"});
      }
    }
  })
});

app.post('/api/confirmotp/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var bookingdetail = req.body;
      if(bookingdetail.email != "" && bookingdetail.otp != ""){
        connection.query('SELECT otp FROM otpVerify where email_id = "' + bookingdetail.email + '" ORDER BY id DESC', function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }else{
            //console.log(results[0].otp);
            if(results[0].otp == bookingdetail.otp){
              res.status(200).send({registered : 'success'});
            }else{
              res.status(200).send({registered : 'incorrect otp'});
            }
          }
        });
      }else{
        res.status(200).send({error : "Not an email"});
      }
    }
  })
});


app.post('/api/updateinventory/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var bookingdetail = req.body;
      var checkin = new Date(bookingdetail.checkin);
      var checkout = new Date(bookingdetail.checkout);
      checkout.setDate(checkout.getDate() - 1);
      var datearr = [];
      for(const date of datesBetween(checkin, checkout)){
        datearr.push(date);
      }
      //console.log(datearr)
      datearr.forEach(function(element,index) {
        //console.log(index);
        var roomcol = element;
        connection.query('SELECT `' + roomcol.getDate() + '` FROM manage_inventory WHERE year = ' + roomcol.getFullYear() + ' AND month = ' + (roomcol.getMonth()+1) + ' AND customerID = ' + cid + ' AND room_id = 25 AND `' + roomcol.getDate() + '` IS NOT NULL', function (error, results, fields) {
          if(results.length > 0){
            var updatedate = JSON.stringify(results).split('":"')[0].split('{"')[1];
            var oldinvent = parseInt(JSON.stringify(results).split('":"')[1].split('"}')[0]);
            if(oldinvent > 0){
              connection.query('UPDATE `manage_inventory` SET `' + updatedate + '` = "' + (oldinvent - 1) + '" WHERE year = ' + roomcol.getFullYear() + ' AND month = ' + (roomcol.getMonth()+1) + ' AND customerID = ' + cid + ' AND room_id = 25 AND `' + roomcol.getDate() + '` IS NOT NULL', function (error, results, fields) {
                if(!error){
                  if(index == (datearr.length-1)){
                    res.status(200).send({status : 'Inventory updated successfully'});
                  }
                }
              });
            }
          }
        });
      });
      //console.log('success');
    }
  })
});



app.post('/api/checkemail/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var bookingdetail = req.body;
      console.log(bookingdetail.email);
      if(bookingdetail.email != ""){
        connection.query('SELECT * FROM users where email_id = "' + bookingdetail.email + '"', function (error, results, fields) {
          if (error) {
            res.status(500).send({ error : error });
          }else{
            if(results.length == 0){
              res.status(200).send({registered : 'not registered'});
            }else{
              res.status(200).send({registered : 'already registered'});
            }
          }
        });
      }else{
        res.status(200).send({error : "Not an email"});
      }
    }
  })
});

app.post('/api/bookroomcontact/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var bookingdetail = req.body.dataobj;
      console.log(bookingdetail);
      if(cid != '' && cid != undefined && cid != null){
        connection.query('INSERT INTO inquiry (customerID, name, email, mobile, isd_code, inquiryType, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
         [cid, bookingdetail.name, bookingdetail.email, bookingdetail.mobile,bookingdetail.isd_code, bookingdetail.inquiryType, bookingdetail.message], function (error, results, fields) {
          if (error){
            res.status(500).send({ error: "Internal Server Error" });
          }else{
            res.status(200).send({ success: "Inquiry saved , We will contact you soon !" });
          } 
          con.release();
        });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

app.post('/api/bookroommain/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var bookingdetail = req.body.dataobj;
      if(cid != '' && cid != undefined && cid != null){
        console.log(bookingdetail);
        var datetime = new Date();
        var querydate = datetime.getFullYear() + '/' + datetime.getMonth() + '/' + datetime.getDate(); 
        con.query('INSERT INTO inquiry (recvDate, year, month, customerID, propertyID, roomId, propertyName, roomName, name, email, fromDate, toDate, mobile, isd_code, inquiryType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
          [querydate, datetime.getFullYear(), datetime.getMonth(), cid, bookingdetail.propertyid, bookingdetail.roomid, bookingdetail.propertyname, bookingdetail.roomname, bookingdetail.name, bookingdetail.email, bookingdetail.startdate, bookingdetail.enddate, bookingdetail.phone,bookingdetail.isd, bookingdetail.inquirytype],
          function (error, results, fields) {
            if (!error){
              console.log("Booking saved successfully.");
              res.status(200).send({ success: "Booking saved successfully."});
            }else{
              console.log('inquiry ..............' +error);
              res.status(500).send({ error: "Internal Server Error" });
            }
          }
        );
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  });
});


app.post('/api/bookroomhome/:id?', function (req, res){
  connection.getConnection(function(err,con){
    if(err){
      console.log('ERROR OCCURED !  ' + err);
    }
    else{
      var cid = req.query.customerid;
      var bookingdetail = req.body.dataobj;
      var roomdata;
      if(cid != '' && cid != undefined && cid != null){
        con.query('SELECT roomType FROM propertyRoom WHERE roomID = ' + bookingdetail.roomId, function (error, results, fields) {
          if (!error) {
            roomdata = JSON.stringify(results).split('":"')[1].split('"}')[0];
            var datetime = new Date();
            var bookid = uniqid('bo_');
            var refid = uniqid('ref_');
            var querydate = datetime.getFullYear() + '/' + datetime.getMonth() + '/' + datetime.getDate(); 
            con.query('INSERT INTO inquiry (recvDate, year, month, customerID, propertyID, roomId, propertyName, roomName, name, email, fromDate, toDate, mobile, isd_code, inquiryType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
              [querydate, datetime.getFullYear(), datetime.getMonth(), cid, bookingdetail.propertyID, bookingdetail.roomId, bookingdetail.propertyName, roomdata, bookingdetail.name, bookingdetail.email, bookingdetail.fromDate, bookingdetail.toDate, bookingdetail.mobile,bookingdetail.isd_code, bookingdetail.inquiryType],
              function (error, results, fields) {
                if (!error){

                  con.query('INSERT INTO manage_booking (reference_id, status, booking_id, date, start_year, start_month, customerID, prop_id, room_enquired, property_enquired, name, email, start_date, end_date, phone, Grant_total, avg_price, gst_amt, payable_amt, discount, discount_value, booking_amt, nights) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                    [refid, 'Inactive Booking', bookid, querydate, datetime.getFullYear(), datetime.getMonth(), cid, bookingdetail.propertyID, bookingdetail.roomId, bookingdetail.propertyName, bookingdetail.name, bookingdetail.email, bookingdetail.fromDate, bookingdetail.toDate, bookingdetail.mobile, bookingdetail.total_amt, bookingdetail.average_price, bookingdetail.gst, bookingdetail.payable_amt, bookingdetail.discount, bookingdetail.discount_value, bookingdetail.booking_amt, bookingdetail.nights],
                    function (error, results, fields) {
                      if (!error){
                        res.status(200).send({ success: "Booking saved successfully." , booking_id : bookid});
                      }else{
                        console.log('manage_booking ..............' +error);
                        res.status(500).send({ error: "Internal Server Error" });
                      }
                    }
                  );
                }else{
                  console.log('inquiry ..............' +error);
                  res.status(500).send({ error: "Internal Server Error" });
                }
              }
            );
          }else{
            res.status(500).send({ error: "Internal Server Error" });
          }
       });
      }
      else{
        res.status(500).send({ message: 'Customer-ID is not provided' });
        con.release();
      }
    }
  })
});

//app.use(express.static(path.resolve(__dirname,'./react_spa/build')));

// app.get('/api/auth',function(req, res){
//   var auth = req.headers['x-access-token'];
//   if(auth == con.authtoken){
//     var token = jwt.sign({ id: con.customerid }, con.secret, {
//       expiresIn: 86400 // expires in 24 hours
//     });
//    console.log(token);
//    res.json({'description': 'Sending the Access Token','accessToken': token});
//   }
//   else{
//     res.json({'description': 'Unauthorized User'});
//   }
// });

app.get('*',function(req, res){
  // var token = jwt.sign({ id: con.customerid }, con.secret, {});
  console.log('yes it is working');
  res.json({'working' : 'yes it is working'});
  //res.sendFile(path.resolve(__dirname,'./react_spa/build','index.html'));
});

// app.get('/',function(req, res){
//   connection.getConnection(function(err,con){
//     if(err){
//       console.log('ERROR OCCURED !  ' + err);
//     }
//     else{
//       con.query('SELECT * from city_url',function(error, records, fields){
//         if(!error){
//           res.send(records)
//         }
//         con.release();
//       })
//     }
//   })
// })

