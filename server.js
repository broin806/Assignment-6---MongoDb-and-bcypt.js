/************************************************************************* * 
 * BTI325– Assignment 6 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
 * No part * of this assignment has been copied manually or electronically from any other source * 
 * (including 3rd party web sites) or distributed to other students. * * Name: Broinson Jeyarajah 
 * Student ID: 101501229 Date:  * 2020-12-11 * Your app’s URL (from Cyclic) : https://chartreuse-green-magpie-tie.cyclic.app
 * 
*************************************************************************/

//MongoDB (user registration & login functionalilty)

//REFERENCES 
//https://stackoverflow.com/questions/33355528/filtering-an-array-with-a-function-that-returns-a-promise
//https://www.folkstalk.com/2022/07/how-to-filter-array-objesct-in-express-node-js-with-code-examples-3.html
//https://stackoverflow.com/questions/10987452/handlebars-js-each-data-nested-in-if-data and WEEK 6 NOTES 
//Week 7 references 


var data_service  = require('./data-service.js')
var dataServiceAuth = require('./data-service-auth.js');
const clientSessions = require("client-sessions");
var express = require("express");
var app = express(); //express is a function
var path = require('path'); 
var fs = require('fs');
var HTTP_PORT = process.env.PORT || 8080;  
var multer = require('multer'); //required module
const bodyParser = require("body-parser"); 
var exphbs = require('express-handlebars');


// Setup client-sessions
app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "This is Assignment 6", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));


  
app.engine('.hbs',exphbs.engine({ extname:'.hbs', defaultLayout:'main', 
//Handlebars custom "helper"
helpers:{ navLink:function(url, options){
  return '<li' + ((url==app.locals.activeRoute)? ' class="active"':'')
  +'><a href="'+url+'">'+options.fn(this)+'</a></li>'
},
//Handlebars custom "helper"
equal:function(lvalue, rvalue, options){
    if(arguments.length<3)
        throw new Error("Handlerbars Helper equal needs 2 parameters");
    if(lvalue != rvalue){
        return options.inverse(this);
    }else{
        return options.fn(this);
    }
}
}
})); 



app.set('view engine', '.hbs'); 


// const HTTP_PORT = process.env.PORT || 8080;

//"static" middleware for css/site.css 
app.use(express.static('public'));



// function which triggers the http server to listen for requests 
function onHttpStart(){
  console.log("Express http server listening on: " + HTTP_PORT);
}


//defining a storage variable using "multer.diskStorage"
var storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
}); 

// //body-parser
// //handle form data without file upload.
// app.use(express.json());
// app.use(express.urlencoded({extended: true}));


//Define an "upload" variable as multer({ storage: storage });
const upload = multer({ storage: storage });
app.use(bodyParser.urlencoded({extended:true}));


//Fixing the Navigation Bar to Show the correct "active" item
app.use(function(req,res,next){
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
  });

  app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
    });
  
    function ensureLogin(req, res, next) {
      if (!req.session.user) {
        res.redirect("/login");
      } else {
        next();
      }
    }
  
  


//HOME AND ABOUT ROUTE 

 // directs to the home route
app.get("/", (req, res)=>{ 
    res.render("home");
   // res.sendFile(path.join(__dirname,"/views/home.html")); //takes the address to home.html
});


// app.get("/home", (req, res)=>{ 
//   res.render(path.join(__dirname,"/views/home.hbs")); //takes the address to home.hbs
// });

//route that returns the about page 
app.get("/about", (req,res)=>{ 
    res.render("about");
    //res.sendFile(path.join(__dirname,"/views/about.html")); //takes the address to about.html
  }); 



  //-----------ADDITIONAL ROUTES 
//Part 4: Adding New Routes to query "Employees"
//responds to employees page's get requests
app.get("/employees",ensureLogin,  (req,res)=>{ 

  if(req.query.status){ //if query string is for status info
  ///employees?status=value
  data_service.getEmployeesByStatus(req.query.status).then((data)=> { 
    if(data.length>0){//condition that only renders "employees"
    res.render("employees", {employees:data});
    }
    else{
      res.render("employees",{ message: "no results" });
    }
  }).catch(()=> //error has shown before if promises are rejected
        res.render("employees",{ message: "no results" }))
        //console.log(err);
  }  
  
  else if (req.query.department){ //if query string is for department info
    ////employees?department=value
    data_service.getEmployeesByDepartment(req.query.department).then((data)=>{ 
      if(data.length>0){//condition that only renders "employees"
        res.render("employees", {employees:data});
        }
        else{
          res.render("employees",{ message: "no results" });
        }
      }).catch(()=> //error has shown before if promises are rejected
            res.render("employees",{ message: "no results" }))
            //console.log(err);
      }  
  
    else if (req.query.manager){ //if query string is for managers info
      ////employees?manager=value
      data_service.getEmployeesByManager(req.query.manager).then((data)=>{ 
        res.render("employees", {employees:data});//access the data from the function and send response back to client. *JSON String*
          }).catch(()=>{ 
            res.render({message : "no results"});
            //console.log(err); 
        })
  
    }else{ //REQUEST DOESNT CONTAIN STRING and return(s) all employees without filters using *JSON String*
        data_service.getAllEmployees().then((data)=>{ 
          res.render("employees", {employees:data});//access the data from the function and send response back to client. 
            }).catch(()=>{ 
              res.render({message : "no results"});
              //console.log(err);
     });
    }
  })


  app.get("/employee/:empNum",ensureLogin, (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};

    data_service.getEmployeesByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error 
    }).then(data_service.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"

        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching 
        // viewData.departments object

        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }

    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });
});
  

//  //responds to managers page's get requests
//  app.get("/managers", (req,res)=>{ 
//   data_service.getManagers().then((data)=>{ //Makes the call to the respective get() method to fetch data
//       res.json(data); //access the data from the function and send response back to client. 
//   })
//   .catch((err)=>{ 
//     res.json({"message" : err});
//       //console.log(err);

//   })

// }) 


  //responds to departments page's get requests
  app.get("/departments", ensureLogin, (req,res) => { 
    data_service.getDepartments().then((data)=>{ //Makes the call to the respective get() method to fetch data
      res.render("departments", {departments: data});//access the data from the function and send response back to client. 
      }).catch(()=>{ 
        res.render({message : "no results"});
        //console.log(err);
  
    })
  
  }) 


//responds to addEmployees get requests
app.get("/employees/add",ensureLogin,  (req,res)=>{ 
  // res.render("addEmployee");  
  //res.sendFile(path.join(__dirname,"/views/addEmployee.html"));
  data_service.getDepartments()
  //if getDepartments() promise is rejected
  .then(data => res.render("addEmployee", {departments: data}))
  .catch(err => res.render("addEmployee", {departments: []})); //send empty array 
});


//responds to addImages get requests
app.get("/images/add",ensureLogin, (req,res)=>{  
  res.render("addImage");
  // res.sendFile(path.join(__dirname,"/views/addImage.html"));
}); 


 
 //Adding the "Post" route
 app.post("/images/add",ensureLogin, upload.single("imageFile"), function(req, res){
   res.redirect("/images") //redirects to route "/image"
 });



 //Adding "Get" route /images using the "fs" module
app.get("/images",ensureLogin, (req,res) => {
  fs.readdir("./public/images/uploaded", function(err, items){ //fs.readdir method (display array of images)
   // res.json(items); 
   res.render("images", {data: items, title: "Images"}); 
 })
 })


//route makes a call to the (promise-driven) function from the data-service.js module
app.post("/employees/add",ensureLogin, function(req,res){
 //redirects to /employees
 data_service.addEmployee(req.body)
 res.redirect('/employees');
});


app.post("/employee/update",ensureLogin,(req,res)=>{ //Post route 
  // console.log(req.body);
   data_service.updateEmployee(req.body).then(()=>{
       res.redirect("/employees");
   });
});


//responds to add departments get requests
app.get("/departments/add",ensureLogin, (req,res)=>{ 
  res.render("addDepartment");  
  //res.sendFile(path.join(__dirname,"/views/addEmployee.html"));
});



//route makes a call to the (promise-driven) function from the data-service.js module
app.post("/departments/add",ensureLogin, function(req,res){
  //redirects to /departments
  data_service.addDepartment(req.body).then(()=>{
  res.redirect('/departments'); //directs to the departments 
  })
 });


 app.post("/department/update",ensureLogin,(req,res)=>{ //Post route 
  // console.log(req.body);
   data_service.updateDepartment(req.body).then(()=>{
       res.redirect("/departments");
   });
}); 


app.get("/department/:departmentId",ensureLogin, (req, res) =>{
  data_service.getDepartmentsById(req.params.departmentId) //parameter value
  //render a department view and pass data from promise
  .then((data) => {res.render("department", { department: data })})

  //if data is undefined
  .catch(err => res.status(404).send("Department not found"))
});



app.get('/employees/delete/:empNum',ensureLogin, (req, res) => {
  //invoke deleteEmployeeByNum(empNum) data-service method.
  data_service.deleteEmployeeByNum(req.params.empNum)

  .then((data) => res.redirect("/employees")) //redirect to user "/employees" view
  .catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"))
})


app.get("/login", function(req, res) {//login route 
  res.render('login');  
});


app.get("/register", function(req, res) {//register route 
  res.render('register'); 
}); 

app.post("/register", function(req, res) { //POST register route
  dataServiceAuth.registerUser(req.body)
  .then(() => res.render('register', { successMessage: "User created"}))
  .catch((err) => res.render('register', { errorMesssag: err, userName: req.body.userName }));
});

// post for /login
app.post("/login", function(req, res) {
  req.body.userAgent = req.get('User-Agent');

  dataServiceAuth.checkUser(req.body).then(function(user) { 
      req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory
      }

      res.redirect('/employees');
  }) //ERROR message
      .catch((err) => res.render('login', { errorMesssage: err, userName: req.body.userName }));
  });


app.get("/logout", function(req, res) { //logout route
  req.session.reset(); 
  res.redirect('/');
});

app.get("/userHistory", ensureLogin, function (req, res) {
  res.render('userHistory'); //userHistory route
}); 



  // data_service.getAllEmployees().then((data)=>{ //Makes the call to the respective get() method to fetch data
  //   res.json(data);//access the data from the function and send response back to client. 

  // }).catch((err)=>{
  // res.json({"message" : err});
  // //console.log(err);


app.use((req,res)=>{ //404 error message
  res.status(404).send("Page Not Found");
});

//setup http server to listen on HTTP_PORT


data_service.initialize()
.then(dataServiceAuth.initialize)
.then(function(){app.listen(HTTP_PORT, function(){
console.log("app listening on: " + HTTP_PORT)});
}).catch(function(err){ 
  console.log("unable to start server: " + err);
}); 

