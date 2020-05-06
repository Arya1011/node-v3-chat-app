const users=[];                                                              //We will store users in this array

//addUser,removeUser,getUser,getUsersInRoom

const addUser=({id,username,room})=>{
         //Clean the data
         username=username.trim().toLowerCase();
         room=room.trim().toLowerCase();

         //Validate the data
         if(!username || !room){
            return {
                error: 'Username and room are required'
            }
         }

         //Check for existing user
        const existingUser=users.find((user)=>{
                return user.room===room && user.username===username     
        })

        //Validate username
        if(existingUser){
            return{
                error:'Username is in use already'
            }
        }

        //Store user
        const user={id,username,room};
        users.push(user);
        return {user};
}

const getUser=(id)=>{
     return users.find((user)=>user.id===id);
}

// const getUsersInRoom=(room)=>{
//      const roomMembers=users.filter((user)=>{
//            return user.room===room.toLowerCase();
//      })
//      if(Array.isArray(roomMembers) && roomMembers.length){
//          return roomMembers;
//      }else{
//          return [];
//      }
// }

const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase();
     return users.filter((user)=>{
         return user.room===room
     })
}

const removeUser=(id)=>{
      const index=users.findIndex((user)=>{
          return user.id===id;
      })

      if(index!==-1){
          return users.splice(index,1)[0];                                                                                 //splice returns an array,splice(index,1)[0] helps get the user object of the deleted user in the array
      }
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}