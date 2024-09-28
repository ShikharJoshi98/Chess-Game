const { createServer } = require("http");
const { Server } = require("socket.io");
const PORT =3000;
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["*"]
    },
  });

let totalPlayers =0;
let players = {};
let waiting ={10: [], 15:[], 20:[]};
let matches ={10: [], 15:[], 20:[]};

function removeSocketFromWaitingPeriod(socket){
  const foreachloop=[10,15,20];
  foreachloop.forEach((element) => {
   const index = waiting[element].indexOf(socket);
   if(index>-1){
    waiting[element].splice(index,1); 
   }
   }
  )
  
}

function fireTotalPlayers(){
    io.emit('total_players_count_change', totalPlayers);
}
function fireOnDisconnect(){
    removeSocketFromWaitingPeriod(socket.id);
    totalPlayers--;
    fireTotalPlayers();
}

function initialSetupMatch(opponentId,socketId){
    players[opponentId].emit('match_made','w');
    players[socketId].emit('match_made','b');
}
function handlePlayRequest(socket, time){
  
  if(waiting[time].length>0){
   const opponentId = waiting[time].splice(0,1)[0];
   matches[time].push({
       [opponentId] : socket.id
   });
     initialSetupMatch(opponentId, socket.id );
    return ;
  }

  if(!waiting[time].includes(socket.id)){    
  waiting[time].push(socket.id);
  }
}
function fireOnConnected(socket){
    socket.on('want_to_play', (timer)=>{
      handlePlayRequest(socket,timer);
    })
    totalPlayers++;
    fireTotalPlayers();
}

io.on("connection", (socket) => {
    players[socket.id] = socket;
    fireOnConnected(socket);
    socket.on('disconnect', ()=>fireOnDisconnect(socket));
})

io.on("connection", (socket) => {
  console.log(socket.id);
});

httpServer.listen(PORT, function(){
    console.log("Your server is running at " + PORT)
});