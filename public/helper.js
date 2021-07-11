export default {

    // Check for availability of user media
    userMediaAvailable() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    },

    // Returns user media if available
    getUserFullMedia() {
        if (this.userMediaAvailable()) {
            return navigator.mediaDevices.getUserMedia({
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
        } else {
            throw new Error('User media not available');
        }
    },

    // Adjust Video Grids when new user adds or disconnects
    adjustGrid() {
        let totalUsers = document.getElementsByTagName("video").length;
        let elements = document.getElementsByTagName("video");
        if (totalUsers <= 1) {
            elements[0].style.maxWidth = "37rem"
        }
        if (totalUsers > 1) {
            if (elements[0].style.removeProperty) {
                elements[0].style.removeProperty('max-width');
            } else {
                elements[0].style.removeAttribute('max-width');
            }
            for (let i = 0; i < totalUsers; i++) {
                elements[i].classList.add("col-3");
                if (totalUsers >= 4) {
                    elements[i].style.maxHeight = "17rem"
                } else if (totalUsers >= 3) {
                    elements[i].style.maxHeight = "21rem"
                } else if (totalUsers >= 2) {
                    elements[i].style.maxHeight = "25rem";
                }
            }
        }
    },

    // PLay the paused video when user clicks on video button
    setStopVideo() {
        const text = `<i class = "fa fa-video"></i>`
        document.getElementById('playPauseVideo').innerHTML = text;
        document.getElementById('playPauseVideo').setAttribute("title", "Pause Video")
    },

    // Pause video
    setPlayVideo() {
        const text = `<i class = "fas fa-video-slash"></i>`
        document.getElementById('playPauseVideo').innerHTML = text;
        document.getElementById('playPauseVideo').setAttribute("title", "Play Video")
    },

    // Unmute user
    setMute() {
        const text = `<i class = "fa fa-microphone"></i>`
        document.getElementById('muteButton').innerHTML = text;
        document.getElementById('muteButton').setAttribute("title", "Mute");
    },

    // Mute user
    setUnmute() {
        const text = `<i class = "fas fa-microphone-slash"></i>`
        document.getElementById('muteButton').innerHTML = text;
        document.getElementById('muteButton').setAttribute("title", "Unmute")
    },

    // Show chat window
    Showchat(e) {
        e.classList.toggle('active')
        document.body.classList.toggle('showchat')
    },

    // Play chat sound when msg received
    playChatSound() {
        const chatSound = document.getElementById('chatAudio');
        chatSound.play();
    },

    // Change state of msg icon if user have new msgs
    has_new(state) {
        let e = document.getElementById('chat_btn');
        if (state) {
            e.children[0].classList.add('text-danger');
            e.children[0].classList.remove('text-white');
        } else {
            e.children[0].classList.add('text-white');
            e.children[0].classList.remove('text-danger');
        }
    },

    // Saves chat
    saveChatToFile() {

        var userInput = document.getElementById("all_msgs");

        var save = userInput.textContent.toString();
        var blob = new Blob([save], {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, "Chat.txt");
    },

    // Screen Share
    shareScreen() {
        if (this.userMediaAvailable()) {
            return navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always"
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
        } else {
            throw new Error('User media not available');
        }
    },

    // Change share screen button css when user clicks
    toggleShareIcons(share) {
        let shareIconElem = document.querySelector('#share-screen');

        if (share) {
            shareIconElem.setAttribute('title', 'Stop sharing screen');
            shareIconElem.children[0].classList.add('text-primary');
            shareIconElem.children[0].classList.remove('text-white');
        } else {
            shareIconElem.setAttribute('title', 'Share screen');
            shareIconElem.children[0].classList.add('text-white');
            shareIconElem.children[0].classList.remove('text-primary');
        }
    },

    // Disable the screen share button when screen is being shared so that user can only use stop sharing option made avalaible by browser
    toggleScreenBtnDisabled(x) {
        if (x === true) {
            document.getElementById('share-screen').style.pointerEvents = 'none';
        } else {
            document.getElementById('share-screen').style.pointerEvents = 'auto';
        }
    },

    // Change state of a element with given id depending on state
    toggleModal(id, show) {
        let el = document.getElementById(id);

        if (show) {
            el.style.display = 'block';
            el.removeAttribute('aria-hidden');
        } else {
            el.style.display = 'none';
            el.setAttribute('aria-hidden', true);
        }
    },

    // CSS change for record button when clicked
    toggleRecordingIcons(isRecording) {
        let e = document.getElementById('record');

        if (isRecording) {
            e.setAttribute('title', 'Stop recording');
            e.children[0].classList.add('text-danger');
            e.children[0].classList.remove('text-white');
        } else {
            e.setAttribute('title', 'Record');
            e.children[0].classList.add('text-white');
            e.children[0].classList.remove('text-danger');
        }
    },

    // Save recorded stream
    saveRecordedStream(stream, user) {
        let blob = new Blob(stream, {
            type: 'video/webm'
        });

        let file = new File([blob], `${ user }-${ moment().unix() }-record.webm`);

        saveAs(file);
    },

    // Check whether the user gives a valid name for himself/herself
    checkInput() {
        let value = $("#userName").val()
        if (value.trim().length) {
            return value.trim();
        } else return false;

    },

    // Speaks text, when a user leaves a announcement is made to everyone
    speakText(msg) {
        const Msg = new SpeechSynthesisUtterance();
        Msg.text = msg;
        window.speechSynthesis.speak(Msg);
    },

}