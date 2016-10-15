# Chatroom with Logic Clock

## Introduction
This application is similar as the chatroom in branch master, the only difference is we added a Lamport logic clock in this version. I will use a scenario to explain why we introduce it.
```
We have three memebers A,B and C, they all broadcast messages to each other, when B said "how are you everybody?" 
and C received this message and replied "I'am fine, thank you B!", but for some reasons, the connection between 
A and B is not very good, A received firstly C's message then B's.
```
Under this circumstances, in the window of A, C's message will be showed before B's, so this is not causal. To solve this problem, I implemented the Lamport logic clock. Preciously, I changed a little bit the Lamport logical clock, Lamport logical clock works well with well in a fixed distributed system, but as our members log in and log out frequently, the value of ack changed too fast, we can't be blocked too long by the first element of FIFO, if the message has been generated over 1 second, we will show it anyway.
