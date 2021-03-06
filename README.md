# Chatroom

## Introduction
The goal of this program is to create a chatroom from one browser tab to another, using the RTCDataChannel of the WebRTC HTML5 API. Once a user connected to our chatroom, he/she can consult the online user list, broadcast his/her message, and send a message to a specific user, when a new user comes in or a connected user gets out, everybody in the room will receive a notification. This program will also periodically detect the internet connection, to avoid a member uses a broken peer. The program contains following parts.
- **chatroom.html**,**chatroom.css**: interface of chatroom
- **chatroom.js**: functions run in back_end
- **keepalive.js**: provide a function to detect internet connection

## Prerequisites
Mozilla Firefox 42 or Google Chrome 46 or later

## Attention
Because we did not implement a process of registration, so we can not avoid the risk of duplicated name. Please enter different names to test.

## How to use
- Open `/chatroom/chatroom.html` in your browser(make sure the files in your `localhost/` path), in the head of this page, enter a unique name 'xxx', click `ConnecToRoom`, if you have successfully logged in, you will see `WELCOME: xxx` in the page.
- Click the button `GetOnLineList` to see all online users.
- Write a message in the text area on the line of the button 'broadcast', click `broadcast`, the message will be sent to everyone in the room.
- Fill a user name 'xxx' after `To`, and write a message in the text area on the line of the button 'send', click `send`, the message will be sent to 'xxx'.
- Every time a member comes in or gets out, everyone in the room will receive a notification.

## PS
- in branch 'develop'(we now in branch master), I have implemented a similar chatroom application with Lamport logic clock, all the basic functions and interface are same as the one in branch master,but It can make sure that all the message we show will be causal.
- Answer for Question 2 is [here](Q2.md)
