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
const peer = new Peer(undefined, {
    host: 'videochat2001.herokuapp.com',
    port: '443',
    path: '/',
})

// PEER CONNECTION TO PEER SERVER
peer.on('open', id => {
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

    // PEER RECEIVING CALL
    peer.on('call', (call) => {
        call.answer(stream)
        //we will answer a coming call by giving our stream
        peers[call.peer] = call;
        currentPeer.push(call.peerConnection);
        const video = document.createElement('video');
        call.on('stream', (comingVideoStream) => {
            // Add video of the calling peer in the video grid
            addvideoStream(video, comingVideoStream, call.peer);
        });
        call.on('close', () => {
            video.remove();
            help.adjustGrid();
        });
    });

    // NEW PEER CONNECTED
    socket.on('user-connected', (userid) => {
        setTimeout(connectNewUser, 1000, userid, stream);
    });


    // USER DISCONNECTED
    socket.on('user-disconnected', (userid) => {
        if (peers[userid]) {
            peers[userid].close();
            delete peers[userid];
        }
        help.speakText(`${namesAndIds[userid]} left`);
        if (namesAndIds[userid]) {
            delete namesAndIds[userid];
        }
    });

}).catch((e) => {
    console.error(`stream error: ${ e }`);
});


// Names of the peers
// namesAndIds is a object storing ids and names of the peers

// Name received when a new user joined
socket.on('nameReceived', (names) => {
    if (!(names.id in namesAndIds)) {
        namesAndIds[names.id] = names.name;
    }
    socket.emit('nameSend', {
        name: myName,
        id: currentuserId,
    });
})

// Send name to the users joined new
socket.on('nameSended', (names) => {
    if (!(names.id in namesAndIds)) {
        namesAndIds[names.id] = names.name;
    }
})


// CHAT

// Adding new message to the list
socket.on('createMessage', (message) => {
    let li = document.createElement('li');
    if (message.user != currentuserId) {
        li.classList.add('otherUser');
        //this is for keeping the css different.
        li.innerHTML = `<div><b>${namesAndIds[message.user]}:</b><p>${message.msg}</p></div>` + "\n";
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
    }
});

// Send msg via enter key
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && chatInputs.value != '') {
        socket.emit('message', {
            msg: chatInputs.value,
            user: currentuserId,
        });
        chatInputs.value = '';
    }
});

// Send msg via button icon
document.getElementById('sendMsg').addEventListener('click', (e) => {
    if (chatInputs.value != '') {
        socket.emit('message', {
            msg: chatInputs.value,
            user: currentuserId,
        });
        chatInputs.value = '';
    }
});

// When the chat input box is focussed by the user , this shows user have read the new msgs and hence removing the css for new_msgs
chatInputs.addEventListener('focus', () => {
    help.has_new(false);
    document.getElementById('chat_btn').classList.remove('has_new');
    pendingMsg = 0;
});



// HELPERS

// Add stream to grid
const addvideoStream = (videoT1, stream, U_id = "") => {
    //adding video element and stream to the html and increasing total users.
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
    var video = document.createElement("video");
    call.on("stream", (comingVideoStream) => {
        addvideoStream(video, comingVideoStream, userid);
    });
    call.on('close', () => {
        video.remove();
        help.adjustGrid();
    });
    peers[call.peer] = call;
    currentPeer.push(call.peerConnection);
    //peers is actually the array consisting of call connections for a particular peer to all other.
};


// Share screen
const stopSharingScreen = () => {
    help.toggleShareIcons(false);
    help.toggleScreenBtnDisabled(false);
    let videoTrack = myVideostream.getVideoTracks()[0];
    currentPeer.forEach((value) => {
        let sender = value.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack);
    })

}

// Recording
const startRecording = (stream) => {
    mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
    });
    mediaRecorder.start(1000);
    help.toggleRecordingIcons(true);
    mediaRecorder.ondataavailable = function (e) {
        recordedStream.push(e.data);
    };
    mediaRecorder.onstop = function () {
        help.toggleRecordingIcons(false);
        help.saveRecordedStream(recordedStream, currentuserId);
        setTimeout(() => {
            recordedStream = [];
        }, 3000);
    };
    mediaRecorder.onerror = function (e) {
        console.error(e);
    };
}


// TOGGLE BUTTONS

// Toggle between play video and pause video
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

// Changing title of the video tag to name of the user whose video is being displayed in that tag.
document.getElementById('video-grid').addEventListener('mouseover', function (event) {
    if (event.target.tagName == "VIDEO") {
        let id = event.target.getAttribute('id');
        if (id === "Me") {
            event.target.setAttribute("title", myName);
        } else {
            event.target.setAttribute("title", namesAndIds[id]);
        }
    }

});


// Toggling audio
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

// When chat button is pressed , showing the chat
document.getElementById('chat_btn').addEventListener('click', (e) => {
    let el = document.getElementById('chat_btn');
    help.Showchat(el);
});

// Calling helper function if user asks to save chat
document.getElementById('save_chat').addEventListener('click', (e) => {
    help.saveChatToFile();
})

// If user ask for particpants
document.getElementById('Participants').addEventListener('click', (e) => {
    // Share invite includes the current window link
    document.getElementById("roomLink").value = window.location.href;
    // Participants are found using namesAndIds object
    var keys = Object.keys(namesAndIds);
    var myList = '<tr>';
    // All participants then added to the list to render on website
    keys.forEach((key, index) => {
        myList += '<th scope="col">' + namesAndIds[key] + '</th>';
        myList += '</tr>';
    });
    document.getElementById('users_body').innerHTML = myList;
    help.toggleModal('participants_div', true);
});

// Close participants div
document.getElementById('close_participants').addEventListener('click', (e) => {
    help.toggleModal('participants_div', false);
});


// Invite people opens the same div as participants
document.getElementById('show_invite').addEventListener('click', (e) => {
    document.getElementById('Participants').click();
})

// Copytoclipboard
document.getElementById('copyToClipboard').addEventListener('click', (e) => {
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
document.getElementById('share-screen').addEventListener('click', (e) => {
    e.preventDefault();
    help.shareScreen().then((stream) => {
        help.toggleShareIcons(true);
        help.toggleScreenBtnDisabled(true);
        //save my screen stream
        screen = stream;
        //share the new stream with all partners
        let videoTrack = stream.getVideoTracks()[0];

        // Replace my video track to screen stream
        currentPeer.forEach((value) => {
            let sender = value.getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind;
            })
            sender.replaceTrack(videoTrack);
        })
        videoTrack.addEventListener('ended', () => {
            stopSharingScreen();
        });

    });
});

// Record
document.getElementById('record').addEventListener('click', (e) => {
    /**
     * Ask user what they want to record.
     * Get the stream based on selection and start recording
     */
    if (!mediaRecorder || mediaRecorder.state == 'inactive') {
        help.toggleModal('recording-options-modal', true);
    } else if (mediaRecorder.state == 'paused') {
        mediaRecorder.resume();
    } else if (mediaRecorder.state == 'recording') {
        mediaRecorder.stop();
        let tracks = record.getTracks();
        tracks.forEach(track => track.stop());
    }
});

//When user choose to record screen
document.getElementById('record-screen').addEventListener('click', () => {
    help.toggleModal('recording-options-modal', false);
    if (record && record.getVideoTracks().length) {
        startRecording(record);
    } else {
        help.shareScreen().then((screenStream) => {
            record = screenStream;
            startRecording(screenStream);
        }).catch(() => {});
    }
});

//When user choose to record own video
document.getElementById('record-video').addEventListener('click', () => {
    help.toggleModal('recording-options-modal', false);
    if (myVideostream && myVideostream.getTracks().length) {
        startRecording(myVideostream);
    } else {
        help.getUserFullMedia().then((videoStream) => {
            startRecording(videoStream);
        }).catch(() => {});
    }
});

// Close record modal
document.getElementById('closeModal').addEventListener('click', () => {
    help.toggleModal('recording-options-modal', false);

});

// Taking name of the user joined
document.getElementById('submitName').addEventListener('click', () => {
    let value = help.checkInput();
    if (value) {
        myName = value;
        $('#myModal').modal('hide');
        namesAndIds[currentuserId] = value;
        socket.emit('name', {
            name: value,
            id: currentuserId,
        });
    }
});