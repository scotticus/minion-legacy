// This is where it all goes :)

var monstersDB = new Firebase("https://minion2.firebaseio.com/monsters");

monstersDB.on('value', function(snapshot) {
  console.log(snapshot.val());
}, function(errorObj) {
  console.log("The read failed: " + errorObj.code);
});