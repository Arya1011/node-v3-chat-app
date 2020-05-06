const express=require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const Filter=require('bad-words');
const { generateMessage,generateLocationMessage }=require('./utils/messages');                                               //This will serve as  a constructor which will create the object that has to be passed into the message event
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users');

const app=express();
const server=http.createServer(app);                                                                        //Express does it behind the scenes anyways we are just refactoring how we set up our server(ie., we are using our own server)
const io=socketio(server);                                                                                  //This line of code helps us link the socketio library with our server which we have created(bydefault waala express server cannot be passed here since we dont have access to that so we createed our own server)

const port=process.env.PORT || 3000;

const publicDirectoryPath=path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));


io.on('connection',(socket)=>{                                                                              //socket object will contain info about the connection                                                                            //Just  ahndler that will be run when a particular event take splace
    console.log('New Websocket connection');
    
    socket.on('join',({username,room},callback)=>{
         
        const {error,user}=addUser({id:socket.id,username,room})

        if(error){
            return callback(error);                                                                             //If any error occurs so we use callback to return the error to the client
        }
        
        socket.join(user.room);                                                                                      //Any events emitted will be specific to this room only
         
         socket.emit('message',generateMessage('Admin','Welcome!'));                                                              //message event is being emitted multiple times so we can use a function which returns an object which will contain the message text and the timestamp
         socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`));                                       //broadcast sends a message to all other connections other than the one calling it,to() will restrict it only to the members of the specific chat-room
         io.to(user.room).emit('roomData',{
             room: user.room,
             users: getUsersInRoom(user.room)
         })
         callback();                                                                                            //In case of no error we use the callback w/o args
    })

    socket.on("sendMessage",(message,callback)=>{                                                               //callback() will be the function which will be used for acknowledgement of the event
        
        const user=getUser(socket.id);
        
        const filter=new Filter();
 
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed');
        }

        io.to(user.room).emit('message',generateMessage(user.username,message)); 
        callback('Delivered'); 
  })

    socket.on('disconnect',()=>{ 
           const user= removeUser(socket.id)                                                                                        //Whenever we disconnect a client we use socket.on and not io.on
           
           if(user){
             io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`));
             io .to(user.room).emit('roomData',{
                 room:user.room,
                 users:getUsersInRoom(user.room)
             })
            } 
    })

    socket.on('sendLocation',(coords,callback)=>{
           const user=getUser(socket.id);
           io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
           callback(); 

  })

 
})

server.listen(port,()=>{
console.log("Server is up on port "+ port);
})