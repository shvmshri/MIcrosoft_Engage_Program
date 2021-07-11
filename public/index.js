import help from "./helper.js";
const socket = io("/"); //visiting root route makes a socket connection

// DOM
const videoGrid = document.getElementById("video-grid");
const chatInputs = document.getElementById("msg");
const all_messages = document.getElementById("all_msgs");
const leaveMeet = document.getElementById("leave-meeting");
const chat_window = document.getElementById("msg_window");

var myVideo = document.createElement("video"); //made a video element to append in doc 
myVideo.muted = true;


// PEER CONNECTIONS
// const peer = new Peer(undefined, {
//     host: 'videochat2001.herokuapp.com',
//     port: '443',
//     path: '/',
// })

const peer = new Peer(undefined, {
    host: 'localhost',
    port: '3001',
    path: '/',
})

// PEER CONNECTION TO PEER SERVER
peer.on('open', id => {
    console.log(id);
    currentuserId = id;
    socket.emit('join-room', room_id, id)
});

// INITIAL STATES
var myName = "";
var myVideostream;
var currentuserId;
var pendingMsg = 0;
var peers = {};
var screen = '';
var record = '';
var recordedStream = [];
var mediaRecorder = '';
var currentPeer = [];
var namesAndIds = {};


// VIDEO AND AUDIO EXCHANGE
help.getUserFullMedia().then((stream) => {
    myVideostream = stream;
    addvideoStream(myVideo, stream, 'Me');
    console.log('got localmediastream');

    // PEER RECEIVING CALL
    peer.on('call', (call) => {
        console.log('call recievd');
        call.answer(stream)
        //we will answer a coming call by giving our stream.//yahna we can ring popup to answer or not using socket.io
        console.log('call anserwred');
        console.log(call.peer);

        peers[call.peer] = call;
        currentPeer.push(call.peerConnection);
        const video = document.createElement('video');


        call.on('stream', (comingVideoStream) => { //jisne call kia tha uski stream add krdi in video grid
            console.log('got remotestream too! yay');
            console.log(comingVideoStream);
            addvideoStream(video, comingVideoStream,call.peer); //pass name of the user too if want
        });
        
        call.on('close', () => {
            video.remove();
            help.adjustGrid();
            //window.refresh
        });



    });

    // NEW PEER CONNECTED
    socket.on('user-connected', (userid) => {
        console.log("New user connected...")
        setTimeout(connectNewUser, 1000, userid, stream);
    });


    // USER DISCONNECTED
    socket.on('user-disconnected', (userid) => {
        if (peers[userid]) {peers[userid].close();delete peers[userid];}
        console.log(namesAndIds[userid]);
        help.speakText(`${namesAndIds[userid]} left`);
        if(namesAndIds[userid]) {delete namesAndIds[userid];}
        
        // Jisne call ki thi voh leave krta h toh pnga h abhi 
    });

}).catch((e) => {
    console.error(`stream error: ${ e }`);
});


// Names of the peers

socket.on('nameReceived',(names)=>{
    if(!(names.id in namesAndIds) ){
    namesAndIds[names.id] = names.name;}
    console.log(namesAndIds);
    socket.emit('nameSend',{
        name: myName,
        id: currentuserId,
    });
})

socket.on('nameSended',(names)=>{
    if(!(names.id in namesAndIds) ){
        namesAndIds[names.id] = names.name;}
})


// CHAT

socket.on('createMessage', (message) => {
    console.log(message);
    let li = document.createElement('li');
    if (message.user != currentuserId) {
        li.classList.add('otherUser');
        //this is for keeping the css different.
        li.innerHTML = `<div><b>${namesAndIds[message.user]}:</b><p>${message.msg}</p></div>` +"\n";
    } else {
        li.classList.add('Me');
        li.innerHTML = `<div><b>Me: </b><p>${message.msg}</p></div>` + "\n";
    }
    all_messages.append(li);
    chat_window.scrollTop = chat_window.scrollHeight;
    if (message.user != currentuserId) {
        pendingMsg++;
        help.playChatSound();
        help.has_new(true);
        document.getElementById('chat_btn').classList.add('has_new');
        // document.getElementById(
        //     'chat_btn'
        // ).children[1].innerHTML = `Chat (${pendingMsg})`;
    }
});


document.addEventListener('keypress', (e) => {
    //sending msgs vis enter key
    if (e.key === 'Enter' && chatInputs.value != '') {
        socket.emit('message', {
            msg: chatInputs.value,
            user: currentuserId,
        });
        chatInputs.value = '';
    }
});

document.getElementById('sendMsg').addEventListener('click', (e) => {
    // via mouse click on button
    if (chatInputs.value != '') {
        socket.emit('message', {
            msg: chatInputs.value,
            user: currentuserId,
        });
        chatInputs.value = '';
    }
});

chatInputs.addEventListener('focus', () => {
    help.has_new(false);
    document.getElementById('chat_btn').classList.remove('has_new'); //isse chat pe jo dot aata, it is removed but only when the box jisme msg type krte h get focus.
    pendingMsg = 0;
    // document.getElementById('chat_btn').children[1].innerHTML = `Chat`;
});



// Helpers

//Save My stream


// Add stream to grid
const addvideoStream = (videoT1, stream, U_id = "") => {
    //adding video elemnt and stream to the html and increasing total users.

    videoT1.srcObject = stream;
    videoT1.id = U_id;
    videoT1.class = "Video";
    videoT1.title = U_id;
    videoT1.addEventListener("loadedmetadata", () => {
        //only when all the meta data is loaded , stream has arrived we play the video.
        videoT1.play();
    });
    videoGrid.append(videoT1);
    help.adjustGrid();
};

// Calling the new user connected and adding it to our grid and peers array.
const connectNewUser = (userid, streams) => {
    var call = peer.call(userid, streams);
    console.log('made call');
    var video = document.createElement("video");
    call.on("stream", (comingVideoStream) => {
        // console.log(comingVideoStream);
        console.log('call answered! by ');
        console.log(userid);
        addvideoStream(video, comingVideoStream, userid);
        console.log('got remotestream too! yay');
    });
    call.on('close', () => {
        video.remove();
        help.adjustGrid();
        //window.refresh
    });
    peers[call.peer] = call;
    currentPeer.push(call.peerConnection);
    console.log(call.peer);
    console.log(peers);


    //peers is actually the array of calls for a particular peer to all other.
};

// Share screen

const stopSharingScreen=()=>{
    help.toggleShareIcons( false );
    help.toggleScreenBtnDisabled(false);
    let videoTrack = myVideostream.getVideoTracks()[0];
    currentPeer.forEach((value)=>{
        let sender = value.getSenders().find(function(s){
            return s.track.kind == videoTrack.kind; 
        })
        sender.replaceTrack(videoTrack);
    })

}

// recording

const startRecording = ( stream )=> {
    mediaRecorder = new MediaRecorder( stream, {
        mimeType: 'video/webm;codecs=vp9'
    } );

    mediaRecorder.start( 1000 );
    help.toggleRecordingIcons( true );

    mediaRecorder.ondataavailable = function ( e ) {
        recordedStream.push( e.data );
    };

    mediaRecorder.onstop = function () {
        help.toggleRecordingIcons( false );

        help.saveRecordedStream( recordedStream, currentuserId );

        setTimeout( () => {
            recordedStream = [];
        }, 3000 );
    };

    mediaRecorder.onerror = function ( e ) {
        console.error( e );
    };
}

// TOGGLE BUTTONS
// video
document.getElementById('playPauseVideo').addEventListener('click', (e) => {
    e.preventDefault();

    let enabled = myVideostream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideostream.getVideoTracks()[0].enabled = false;
        help.setPlayVideo();
    } else {
        help.setStopVideo();
        myVideostream.getVideoTracks()[0].enabled = true;
    }
});

// audio

document.getElementById('muteButton').addEventListener('click', (e) => {
    e.preventDefault();
    let enabled = myVideostream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideostream.getAudioTracks()[0].enabled = false;
        help.setUnmute();
    } else {
        myVideostream.getAudioTracks()[0].enabled = true;
        help.setMute();
    }


});

// chat
document.getElementById('chat_btn').addEventListener('click',(e) => {
    let el = document.getElementById('chat_btn');
    help.Showchat(el);
});

document.getElementById('save_chat').addEventListener('click',(e)=>{
  help.saveChatToFile();
})

// Participants
document.getElementById('Participants').addEventListener('click',(e)=>{

    document.getElementById("roomLink").value = window.location.href;

var keys = Object.keys(namesAndIds);
var myList = '<tr>';

keys.forEach((key, index) => {
    console.log(`${key}: ${namesAndIds[key]}`);
    // myList += '<th scope="col">'+key+'</th>';
    myList += '<th scope="col">'+namesAndIds[key]+'</th>';
    myList += '</tr>';
});

document.getElementById('users_body').innerHTML = myList;
help.toggleModal('participants_div',true);
console.log(myList);
});

document.getElementById('video-grid').addEventListener('mouseover',function(event){
if(event.target.tagName == "VIDEO")
{   
    let id = event.target.getAttribute('id');
    if(id === "Me") {
        event.target.setAttribute("title",myName);
    }
    else{
        event.target.setAttribute("title",namesAndIds[id]);
    }
    
    console.log(event.target.id);
}

});


document.getElementById('close_participants').addEventListener('click',(e)=>{
    help.toggleModal('participants_div',false);
});




// Invite people
document.getElementById('show_invite').addEventListener('click',(e)=>{
    document.getElementById('Participants').click();
})

document.getElementById('copyToClipboard').addEventListener('click',(e)=>{
    var copytext = document.getElementById("roomLink");

    copytext.select();
    copytext.setSelectionRange(0, 99999);
    document.execCommand("copy");
    
    document.getElementById('copyToClipboard').classList.add("fa-clipboard-check");
    document.getElementById('copyToClipboard').classList.remove("fa-clipboard");

    setTimeout(() => {
        document.getElementById('copyToClipboard').classList.add("fa-clipboard");
        document.getElementById('copyToClipboard').classList.remove("fa-clipboard-check");
    }, 500);
   
});

// Share Screen

document.getElementById('share-screen').addEventListener('click',(e)=>{
    e.preventDefault();
    help.shareScreen().then((stream)=>{
        help.toggleShareIcons( true );
        help.toggleScreenBtnDisabled(true);
        //save my screen stream
        screen = stream;
         //share the new stream with all partners
         let videoTrack = stream.getVideoTracks()[0];
        
        currentPeer.forEach((value)=>{
            let sender = value.getSenders().find(function(s){
                return s.track.kind == videoTrack.kind; 
            })
            sender.replaceTrack(videoTrack);
        })
       
        videoTrack.addEventListener( 'ended', () => {
            stopSharingScreen();
        } );

    });
    });

// Record

document.getElementById( 'record' ).addEventListener( 'click', ( e ) => {
    /**
     * Ask user what they want to record.
     * Get the stream based on selection and start recording
     */
    if ( !mediaRecorder || mediaRecorder.state == 'inactive' ) {
        help.toggleModal( 'recording-options-modal', true );
    }

    else if ( mediaRecorder.state == 'paused' ) {
        mediaRecorder.resume();
    }

    else if ( mediaRecorder.state == 'recording' ) {
        mediaRecorder.stop();
        
        let tracks = record.getTracks();

        tracks.forEach(track => track.stop());


    }
} );

//When user choose to record screen
document.getElementById( 'record-screen' ).addEventListener( 'click', () => {
    help.toggleModal( 'recording-options-modal', false );

    if ( record && record.getVideoTracks().length ) {
        startRecording( record );
    }

    else {
        help.shareScreen().then( ( screenStream ) => {
            record = screenStream;
            startRecording( screenStream );
        } ).catch( () => { } );
    }
} );

 //When user choose to record own video
document.getElementById( 'record-video' ).addEventListener( 'click', () => {
    help.toggleModal( 'recording-options-modal', false );

    if ( myVideostream && myVideostream.getTracks().length ) {
        startRecording( myVideostream );
    }

    else {
        help.getUserFullMedia().then( ( videoStream ) => {
            startRecording( videoStream );
        } ).catch( () => { } );
    }
} );

document.getElementById( 'closeModal' ).addEventListener( 'click', () => {
    help.toggleModal( 'recording-options-modal', false );

} );

// Taking name of the user

document.getElementById('submitName').addEventListener('click',()=>{
    let value = help.checkInput();
    if(value){
     myName = value;
     $('#myModal').modal('hide');
     namesAndIds[currentuserId] = value;
     socket.emit('name',{
         name: value,
         id: currentuserId,
     });
    }
    console.log(value);
});