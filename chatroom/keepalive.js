// provide a function Test_Connection to detect internent connection
// if we put our chatroom application on internet, the best way to detect
// internet connection is to use ajax to request our own website.
// As we test locally, the ajax will never return false

function doNotConnectFunction() {
  alert("Internet disconnected");
  window.location.reload();
}
//test internet connectiong using a image online
var Test_Connection = function(){
  var i = new Image();
  i.onerror = doNotConnectFunction;
  // escape(Date()) can not be ignored, otherwise the browser will load the image from local cache.
  i.src = 'http://gfx2.hotmail.com/mail/uxp/w4/m4/pr014/h/s7.png?d=' + escape(Date());
}
