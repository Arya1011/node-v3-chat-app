const socket=io();                                                                              //This function is available only because we have loaded in the socket client 

//Elements(These elements will be disabled or enabled when a particular task has been completed or is pending)

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');
const $sendlocationButton=document.querySelector('#send-location');
const $messages=document.querySelector('#messages');                                             //Location where we wish to render our template
//const value=document.querySelector('input');

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML;
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;
//Options

const { username,room }=Qs.parse(location.search,{ignoreQueryPrefix:true});                                               //This gives back an object with properties which are equal to the properties of the query string

//socket created above will be a object which will establish duplex connection bwn client and the server

const autoScroll=()=>{
     //Get the new message Element
     const $newMessage=$messages.lastElementChild;

     //Height of the new message
     const newMessageStyles=getComputedStyle($newMessage);
     const newMessageMargin=parseInt(newMessageStyles.marginBottom);
     const newMessageHeight=$newMessage.offsetHeight + newMessageMargin;

    //console.log(newMessageStyles);
    //console.log(newMessageMargin);

    //Visible Height

    const visibleHeight=$messages.offsetHeight;

    //Height of messages container
    const containerHeight=$messages.scrolllHeight;

    //How far have i scrolled
    const scrollOffset=$messages.scrollTop + visibleHeight;

    if(containerHeight-newMessageHeight <= scrollOffset){
            $messages.scrollTop=$messages.scrollHeight;
    }


}

socket.on('message',(message)=>{
    console.log(message);
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html); 
    autoScroll();
})


socket.on('locationMessage',(message)=>{
    console.log(message);
    const html=Mustache.render(locationMessageTemplate,{
         username:message.username,
         url:message.url,
         createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('roomData',({room,users})=>{
      const html=Mustache.render(sidebarTemplate,{
          room,
          users
      })
      document.querySelector('#sidebar').innerHTML=html;
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
         
    $messageFormButton.setAttribute('disabled','disabled');                                                  //Disable the form till message delivered
    const message=e.target.elements.message.value;                                                           //Alternative way of selecting an element
    
    socket.emit('sendMessage',message,(error)=>{
    $messageFormButton.removeAttribute('disabled');                                        //Enable the form after sendMessage has been called
    $messageFormInput.value='';                                                            //Making input value blank after message has been delivered
    $messageFormInput.focus();

    if(error){
        return console.log(error);
    }
    console.log('Message Delivered');

    });
})



document.querySelector('#send-location').addEventListener('click',()=>{
       
         if(!navigator.geolocation){
             return alert('Geolocation is not supported by your browser');
         }
      $sendlocationButton.setAttribute('disabled','disabled');
      navigator.geolocation.getCurrentPosition((position) =>{                                                                       //position object contains all the info we get from the fucntion call                                   

                socket.emit('sendLocation',{
                        latitude: position.coords.latitude,
                        longitude:position.coords.longitude
               },()=>{
                   console.log('Location Shared');
                   $sendlocationButton.removeAttribute('disabled');

               })
      })

})

socket.emit('join',{username,room},(error)=>{
       if(error) {
            alert(error);
            location.href='/'                                                                                                           //Sends them to root of the site ie., the join home-page
       }
});






