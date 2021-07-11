export default{


    // Check for availability of user media
    userMediaAvailable() {
        return !!( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia );
    },
 
    // Returns user media if available
    getUserFullMedia() {
        if ( this.userMediaAvailable() ) {
            return navigator.mediaDevices.getUserMedia( {
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            } );
        }

        else {
            throw new Error( 'User media not available' );
        }
    },

    adjustGrid(){
        let totalUsers = document.getElementsByTagName("video").length;
        let elements =  document.getElementsByTagName("video");
        // if(totalUsers === 1) {
        //     elements[0].style.maxHeight = "400px";
        //     elements[0].style.maxWidth = "600px";
        // }
        if(totalUsers <=1 ) {elements[0].style.maxWidth = "600px"}
         if (totalUsers > 1) {
            if (elements[0].style.removeProperty) {
                elements[0].style.removeProperty('max-width');
            } else {
                elements[0].style.removeAttribute('max-width');
            }



            for (let i = 0; i < totalUsers; i++) {
               
                elements[i].classList.add("col-4");
    
    
                if(totalUsers >=4){
                    elements[i].style.maxHeight = "300px"
                } 
    
                else if(totalUsers >=3){
                    elements[i].style.maxHeight = "350px"
                }
    
                else if(totalUsers >= 2){
                    elements[i].style.maxHeight = "400px";
                }
                // elements[i].style.width = 100 / totalUsers + "%";
                //adjusting width of videos acc to no of users
                //this fits all video in one line evenly dividing their widths.
            }
        }
    },
   

    setStopVideo() {
        const text = `<i class = "fa fa-video"></i>`
        document.getElementById('playPauseVideo').innerHTML = text;
        document.getElementById('playPauseVideo').setAttribute("title","Pause Video")
    },
    
    setPlayVideo(){
        const text = `<i class = "fas fa-video-slash"></i>`
        document.getElementById('playPauseVideo').innerHTML = text;
        document.getElementById('playPauseVideo').setAttribute("title","Play Video")
    },

    setMute() {
        const text = `<i class = "fa fa-microphone"></i>`
        document.getElementById('muteButton').innerHTML = text;
        document.getElementById('muteButton').setAttribute("title","Mute");
    },
    
    setUnmute(){
        const text = `<i class = "fas fa-microphone-slash"></i>`
        document.getElementById('muteButton').innerHTML = text;
        document.getElementById('muteButton').setAttribute("title","Unmute")
    },
    
    Showchat(e) {
        e.classList.toggle('active')
        document.body.classList.toggle('showchat')
    },
    
    playChatSound(){
        const chatSound = document.getElementById('chatAudio');
        chatSound.play();
    },

    has_new(state){
        let e = document.getElementById('chat_btn');
        if(state){
            e.children[0].classList.add( 'text-danger' );
            e.children[0].classList.remove( 'text-white' );
        }
        else{
            e.children[0].classList.add( 'text-white' );
            e.children[0].classList.remove( 'text-danger' );
        }
    },

    saveChatToFile() {

        var userInput = document.getElementById("all_msgs");
       
        var save = userInput.textContent.toString();
        // console.log(save);
        // var x = document.getElementById("all_msgs").textContent;
        // console.log(x);
        var blob = new Blob([save], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "Chat.txt");
    },
    
    speakText(msg) {
        const Msg = new SpeechSynthesisUtterance();
        Msg.text = msg;
        window.speechSynthesis.speak(Msg);
    },

    shareScreen() {
        if ( this.userMediaAvailable() ) {
            return navigator.mediaDevices.getDisplayMedia( {
                video: {
                    cursor: "always"
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            } );
        }

        else {
            throw new Error( 'User media not available' );
        }
    },

    toggleShareIcons( share ) {
        let shareIconElem = document.querySelector( '#share-screen' );

        if ( share ) {
            shareIconElem.setAttribute( 'title', 'Stop sharing screen' );
            shareIconElem.children[0].classList.add( 'text-primary' );
            shareIconElem.children[0].classList.remove( 'text-white' );
        }

        else {
            shareIconElem.setAttribute( 'title', 'Share screen' );
            shareIconElem.children[0].classList.add( 'text-white' );
            shareIconElem.children[0].classList.remove( 'text-primary' );
        }
    },
     
    toggleScreenBtnDisabled( x ) {
        // console.log('hey');
        if ( x === true ) {
            document.getElementById('share-screen').style.pointerEvents = 'none';
            // document.getElementById('share-screen').setAttribute('disabled', 'disabled');
            console.log('bndnow');
         } else {
            document.getElementById('share-screen').style.pointerEvents = 'auto';
            console.log('open');
         }
        // document.getElementById( 'share-screen' ).disabled = x;
    },

    
    toggleModal( id, show ) {
        let el = document.getElementById( id );

        if ( show ) {
            el.style.display = 'block';
            el.removeAttribute( 'aria-hidden' );
        }

        else {
            el.style.display = 'none';
            el.setAttribute( 'aria-hidden', true );
        }
    },

    toggleRecordingIcons( isRecording ) {
        let e = document.getElementById( 'record' );

        if ( isRecording ) {
            e.setAttribute( 'title', 'Stop recording' );
            e.children[0].classList.add( 'text-danger' );
            e.children[0].classList.remove( 'text-white' );
        }

        else {
            e.setAttribute( 'title', 'Record' );
            e.children[0].classList.add( 'text-white' );
            e.children[0].classList.remove( 'text-danger' );
        }
    },

    saveRecordedStream( stream, user ) {
        let blob = new Blob( stream, { type: 'video/webm' } );

        let file = new File( [blob], `${ user }-${ moment().unix() }-record.webm` );

        saveAs( file );
    },

    checkInput(){
        let value =  $("#userName").val()
        // document.getElementById("userName").val(); 
        
        if( value.trim().length ) {
            console.log(value.trim());
            return value.trim();
        }
        else return false;
        
    },





}