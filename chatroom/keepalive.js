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
