# Microsoft_Engage_Program

[Check it out here](https://arcane-wave-79048.herokuapp.com/)

### Usage

Webapp is hosted on heroku : [Clone](https://arcane-wave-79048.herokuapp.com/)

For local setup : Download the zip file of the project and uncomment the local peerserver setup in server.js and in index.js. Also, comment out the heroku peer connection setup in index.js 
Now, run the following commands:

-To install all the dependencies:
npm install 

-To start the server:

nodemon server.js 
or
node server.js


### Description
This is a clone of Video Chat Application providing the following functionalities:
- No account is required.
- Mutiple rooms
- Audio and Video streaming in real time
- Chat feature along with option to save your chats so that you can continue the conversation after meeting ends.
- Screen Sharing
- Record option (Record your own video or your screen) and save it your system storage.
- Shows names of all the participants present.
- Add participant button to share link.

Connections are made peer to peer using webrtc API

### It is built using
- For backend : Node.js, Expree.js
- For making peer to peer connections : PeerJS (It is a wrapper for WebRTC peer-to-peer data, displaymedia, audio, video calls)
- For real time communication : socket.io (It is a wrapper for Websockets)
- For frontend : CSS, Bootstrap, Javascript
- For deployment : Heroku
- For version control : Git

