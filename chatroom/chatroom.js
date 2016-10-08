function startCommunication(yourname) {
  var webrtc = new SimpleWebRTC({
      // the id/element dom element that will hold "our" video
      localVideoEl: '',
      // the id/element dom element that will hold remote videos
      remoteVideosEl: '',
      // immediately ask for camera access
      autoRequestMedia: false,
      enableDataChannels: true,

      //change the name here for different user.
      nick: yourname
  });




  // we have to wait until it's ready
  webrtc.on('connectionReady', function (sessionId) {


      webrtc.joinRoom('testroom');


      //this is for event broadcast, write in message textarea, click this button,
      // all the people will heard
      $('#broadcast').click(function () {
          var msg = $('#text').val();
          console.log(msg);
          if(msg == ""){
            alert("Can't send NULL message");
          }
          else{
            webrtc.sendToAll('chat', { message: msg, nick: webrtc.config.nick });
            $('#messages').append('<br>You:<br>' + msg + '\n');
            //empty the textarea
            $('#text').val('');
          }
      });

      //this is for sending a message to a speific person
      //first fill the area username, then write in message area
      //click send to the user you want to contact
      $('#send').click(function () {
          var msg = $('#textTonick').val();
          console.log(msg);
          var partner_name = $('#username').val();
          //in case to avoid misoperation
          if(msg == "" || partner_name == ""){
            alert("Can't send null message or send message to nobody");
          }
          else{

            var peers = webrtc.getPeers();

            peers.some(function(peer){
                if(typeof(peer.nick) != "undefined"){
                  if(peer.nick == partner_name){
                  //broadcast the sentence to all
                  peer.send('chat', { message: msg, nick: webrtc.config.nick});
                  $('#messages').append('<br>You:<br>' + msg + '\n');
                  //empty the textarea
                  $('#textTonick').val('');
                  //add return to avoid some redundances peers
                  return true;
                  }
                }
            });
          }

      });


      //click this button to get list of users who are online now!
      $('#get_online_user').click(function (){
        $('#userlist').val('').empty();
        $('#userlist').append('<br>User Online<br>\n');
          //get all peers, then find the peer who has the nickname we want
          var peers = webrtc.getPeers();
          peers.forEach(function (peer) {
          if(typeof(peer.nick) != "undefined"){
          $('#userlist').append(peer.nick + '\n');
          }
        });
      });


      //we must wait for a moment to make sure that peers are connected
      // here we wait 800milliseconds
      setTimeout(function(){
        webrtc.sendToAll('arrive', {nick: webrtc.config.nick });
      }, 800);
  });

  //For Text Chat ------------------------------------------------------------------
  // Await messages from others
  webrtc.connection.on('message', function (data) {
      if (data.type === 'chat') {
          console.log('chat received', data);
          $('#messages').append('<br>' + data.payload.nick + ':<br>' + data.payload.message+ '\n');
      }
      if (data.type === 'leave') {
          console.log('leave received', data);
          $('#messages').append('<br>' + data.payload.nick + " is leaving this room"+'<br>'+'\n');
      }
      if (data.type === 'arrive') {
          console.log('arrive received', data);
          $('#messages').append('<br>' + data.payload.nick + " is comming in this room"+'<br>'+'\n');
      }
  });

  // notify console that a new peer created
   webrtc.on('createdPeer', function (peer) {
     console.log('createdPeer', peer);

  });

  // when we close or refresh the tab, we notify everybody in the room that i am leaving.
  // and shut down the connection
  window.onunload = function(){
    webrtc.sendToAll('leave', {nick: webrtc.config.nick });
    webrtc.leaveRoom();
  }

  // test internet connection every 5seconds
  setInterval(Test_Connection,5000);


}
