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

  // initial logic clock to 0
  var logic_clock = 0;


  //format [message,clock,ack,nick,timestamp]
  var FIFO = new Array();

  //the sleep method in js, because setTimeout() is a function asynchronous
  //but!!! this is a busy loop, the cpu is not really sleeping, but this is
  //the only way I found to sleep a js application
  function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


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
            logic_clock = logic_clock + 1;
            var date = new Date();
            webrtc.sendToAll('broadcast', { message: msg, nick: webrtc.config.nick, clock: logic_clock, timestamp: date.getTime()});
            //add our own message to FIFO, wait to be listed and confirmed
            FIFO[FIFO.length] = [msg, logic_clock, 0, webrtc.config.nick, date.getTime()];
            //receive the message from myself
            logic_clock = logic_clock + 1;
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


      //it takes time to build the connections, so we can‘t send the message directly
      // here we wait 800milliseconds
      setTimeout(function(){
        webrtc.sendToAll('arrive', {nick: webrtc.config.nick });
      }, 800);
  });

  //For Text Chat ------------------------------------------------------------------
  // Await messages from others
  webrtc.connection.on('message', function (data) {
      if (data.type === 'broadcast') {
          console.log('chat received', data);
          var flag = false;
          for (var i = 0; i < FIFO.length; i++) {
                //if we have already received the acks of this message
                if(data.payload.clock == FIFO[i][1]&&FIFO[i][3] == data.payload.nick){

                    FIFO[i][0] = data.payload.message;
                    FIFO[i][2]+= 1;
                    FIFO[i][4] = data.payload.timestamp;
                  flag = true;
                }
          }
          //if this is the first time we received this message, we put it into local FIFO 
          if(flag == false){
            FIFO[FIFO.length] = [data.payload.message, data.payload.clock, 1, data.payload.nick, data.payload.timestamp];
          }

          // very important procedure, ordered the messages by logic clock
          FIFO.sort(function(x, y){
              return x[1] - y[1];
          });
         webrtc.sendToAll('ACK', {nick: data.payload.nick, clock: data.payload.clock});

         //when we receive a new message, we have to update our own logic clock, it will be 1 plus max between local logic clock and message send's logic clock
         logic_clock = Math.max(data.payload.clock, logic_clock)+1;
         var date = new Date();

         //if we do not have enough ack, but this message is generated 1second before, we show it anyway
         //in this situation, it means some users are disconnected or more users loged in after the send broadcast the message
         //either way, we can not block our whole message tube
         if( (FIFO[0] != "undefined" && FIFO[0] != null && FIFO[0][2] >= webrtc.getPeers().length)
           || (date.getTime() - FIFO[0][4] > 1000)
         ){
           // if the message is "", it means we never received the message, we just received the ACK of this message, so we neglect it.
           // and we always show the message from the head of FIFO
           if(FIFO[0][0] != ""){
              $('#messages').append('<br>' + FIFO[0][3] + ':<br>' + FIFO[0][0]+ '\n');
           }
           FIFO.shift();
         }


      }
      if (data.type === 'ACK') {
          console.log('chat received', data);
          var flag = false;
          for (var i = 0; i < FIFO.length; i++) {
                if(data.payload.clock == FIFO[i][1] && data.payload.nick == FIFO[i][3]){
                    FIFO[i][2] += 1;
                  flag = true;
                }
          }
          var date = new Date();
          if(flag == false){
            FIFO[FIFO.length] = ["", data.payload.clock, 1, data.payload.nick, date.getTime()];
          }
          //test ack number >= number of peers
          //>=: because there is a scenario that when a member give a ACK and leave, then our ack can bigger than peers.
          var date = new Date();
          if( (FIFO[0] != "undefined" && FIFO[0] != null && FIFO[0][2] >= webrtc.getPeers().length)
            || (date.getTime() - FIFO[0][4] > 1000)
          ){
          // if the message is "", it means we never received the message, we just received the ACK of this message, so we neglect it.
           // and we always show the message from the head of FIFO
            if(FIFO[0][0] != ""){
               $('#messages').append('<br>' + FIFO[0][3] + ':<br>' + FIFO[0][0]+ '\n');
            }
            // cut the first element
            FIFO.shift();
          }

      }
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


  //scenario to test, commented all the following code if you do not want to test
  //everyone broadcast his logic clock, so we can see the order of message, the number of new message will always >= older number
  //so the message will be causal

  setInterval(function(){
    var date = new Date();
    logic_clock = logic_clock + 1;
    webrtc.sendToAll(
    'broadcast', { message: logic_clock, nick: webrtc.config.nick, clock: logic_clock, timestamp: date.getTime()});
    FIFO[FIFO.length] = [logic_clock,logic_clock,0,webrtc.config.nick, date.getTime()];
    logic_clock = logic_clock + 1;
    },
    5000);

}
