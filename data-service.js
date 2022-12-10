//Declared globally and file reading operation
var departments = []; 
var employees = [];
//const fs = require('fs');


const Sequelize = require('sequelize');


//POSTGRES db 
var sequelize = new Sequelize('ivcsrfpt', 'ivcsrfpt', 'bztlT6fY-q4Jt4xgRUnsb7ucVtD9X6nv', {
  host: 'peanut.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
  ssl: true
  },
  query:{raw: true} 
}); 

sequelize.authenticate().then(()=> console.log('Connection success.')) 
.catch((err)=>console.log("Unable to connect to DB.", err));

//Define Employee Model 
var Employee = sequelize.define('Employee', {
  employeeNum: {
      type:Sequelize.INTEGER,
      primaryKey:true,
      autoIncrement:true
  },
  firstName:Sequelize.STRING,
  lastName:Sequelize.STRING,
  email:Sequelize.STRING,
  SSN:Sequelize.STRING,
  addressStreet:Sequelize.STRING,
  addressCity:Sequelize.STRING,
  addressState:Sequelize.STRING,
  addressPostal:Sequelize.STRING,
  martialStatus:Sequelize.STRING,
  isManager:Sequelize.BOOLEAN,
  employeeManagerNum:Sequelize.INTEGER,
  status:Sequelize.STRING,
  department:Sequelize.INTEGER,
  hireDate:Sequelize.STRING,
});

//Define Department Model
var Department = sequelize.define('Department',{
  departmentId:{
      type:Sequelize.INTEGER,
      primaryKey:true,
      autoIncrement:true
  },
  departmentName: Sequelize.STRING
});


exports.initialize = function() //read the corrresponding file 
{
  return new Promise((resolve, reject) => {
    sequelize.sync()
    .then(() => resolve())
    .catch(() => reject("unable to sync the database"));
});
};


//exported getAllEmployees() function
exports.getAllEmployees = function(){ //invoke Employee.findAll() function 
  return new Promise((resolve, reject) => {
    Employee.findAll()
    .then(()=>resolve(Employee.findAll()))
    .catch(()=>reject("no results returned")) 
});
}; 


  // //exported getManagers() function
  // exports.getManagers = function() {
  //   return new Promise((resolve, reject)=>{
  //             reject()
  //       });
  // }

//exported getDepartments() function
exports.getDepartments = function(){ //function will invoke the Department.findAll() function
  return new Promise((resolve, reject)=>{
    Department.findAll().then(()=>resolve(Department.findAll()))
    .catch(()=>reject("no results returned and error occoured"))
});
}; 


//Adding "addEmployee" function within data-service.js with export property
exports.addEmployee = function(employeeData){
  return new Promise((resolve,reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;

    for (info in employeeData) { //iterate over properties in employeeData set 
        if (info == "") //set to null 
        info = null
    }
    Employee.create(employeeData).then(resolve(Employee.findAll()))
    .catch(reject("unable to create employee"))
})
}; 	
        

//PART 5: Updating "data-service.js" to support the new "Employees" routes
//getEmployeesByStatus(status) - returns a promise 

exports.getEmployeesByStatus = function(status){//filter the results by "status"
  return new Promise((resolve, reject) => {
    Employee.findAll({ //value passed through function, "Full Time" or "Part Time"
        where:{ status: status }})
    .then(()=>resolve(Employee.findAll({ where:{status: status}})))
    .catch(()=>reject("no results returned")) 
})
};


//getEmployeesByDepartment(department) - returns a promise 

exports.getEmployeesByDepartments = function(){//filter the results by "department"
  return new Promise((resolve, reject)=>{
    Employee.findAll({
  where:{departmentId: id}}).then(()=>resolve(Department.findAll({
 where:{departmentId: id}})))
  .catch(()=>reject("no results returned")) 
})
};

//getEmployeesByManagers(managers) - returns a promise 

exports.getEmployeesByManager = function(manager){ // function will invoke the Employee.findAll() function.
  return new Promise((resolve, reject) => {
  Employee.findAll({
    where:{employeeManagerNum: manager}}) //filter the results by "employeeManagerNum"
    .then(()=>resolve(Employee.findAll({ where:{employeeManagerNum: manager}})))
    .catch(()=>reject("no results returned")) 
});
}


//getEmployeeByNum(num) - returns a promise 

exports.getEmployeesByNum = function(num) //will invoke the Employee.findAll() function
{
  return new Promise((resolve, reject) => { 
    Employee.findAll({
 where:{ employeeNum: num }})
    .then(data => resolve(data))//invoke resolve method for promise with data[0]
    .catch("no results returned")
  })
};

// Search through the "employees" array for an employee with an employeeNum
exports.updateEmployee = function(employeeData){
  return new Promise((resolve, reject) => {
  employeeData.isManager = (employeeData.isManager) ? true : false;
  
  for (info in employeeData) { //iterate over properties in employeeData set 
    if (info == "") //set to null 
    info = null;
  }
    //invoke Employee.update() function and filter  operation by "employeeNum"
      Employee.update(employeeData, 
      {where: {employeeNum : employeeData.employeeNum}}) //filtered "employeeNum"
      .then(()=>resolve(Employee.update(employeeData,
      {where: {employeeNum:employeeData.employeeNum}}) ))
      .catch(()=>reject("unable to update employee"))
  });
};


// Search through the "department" array for an department 
exports.addDepartment = function(departmentData){
  return new Promise((resolve, reject) => {
  for (info in departmentData) { //iterate over properties in departmentData set 
    if (info == "") //set to null 
    info = null;
}
    Department.create(departmentData).then(() => resolve()) //if operation was success, invoke resolve method
   .catch(()=>reject("unable to create departments")) 
   });
  };
  

  
// update through the "department" array for an department 
exports.updateDepartment = function(departmentData){
  return new Promise((resolve, reject) => {
  for (info in departmentData) { //iterate over properties in departmentData set 
    if (info == "") //set to null 
    info = null;
}
  //invoke Department.update() function and filter  operation by "departmentId"
  Department.update(departmentData, 
    {where: {departmentId : departmentData.departmentId}}) //filtered "departmentId"
    .then(()=>resolve(Department.update(departmentData,
      {where:{departmentId:departmentData.departmentId}})))//departmentID is filtered with the departmentData
    .catch(()=>reject("unable to update department"))
    });
};


exports.getDepartmentsById = function(id) //will invoke the Department.findAll() function
{
  return new Promise((resolve, reject) => { 
    Department.findAll({
 where:{ departmentId: id }})
    .then(resolve(Department.findAll)({ where: {departmentId: id}}))
    //.then(data => resolve(data))//invoke resolve method for promise with data[0]
    .catch("no results returned")
  })
}; 


//DELETE FUNCTIONS 
exports.deleteEmployeeByNum = function(empNum)  { 
  return new Promise((resolve,reject) => {
      Employee.destroy({ //deletes employees for a certain employee
          where: {
              employeeNum: empNum}})
              //"resolves" if the Employee was deleted ("destroyed").
      .then(()=>resolve(Employee.destroy({where: {employeeNum:empNum}}))) 
      .catch(()=>reject("unable to delete employees"))
  })
}; 

