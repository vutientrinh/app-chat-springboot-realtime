'use strict'
var userNamePage = document.querySelector("#username-page");
var chatpage = document.querySelector("#chat-page");
var usernameForm = document.querySelector("#usernameForm");
var messageForm = document.querySelector("#messageForm");
var messageInput = document.querySelector("#message");
var messageArea = document.querySelector("#messageArea");
var connectingElement = document.querySelector(".connecting");

var stompClient = null;
var username = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event){
    username = document.querySelector('#name').value.trim();
    if(username){
        userNamePage.classList.add('hidden');
        chatpage.classList.remove('hidden');
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({},onConnected, onError);

    }
    event.preventDefault();
}
function onConnected(){
    stompClient.subscribe('/topic/public',onMessageReceived);
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )
    connectingElement.classList.add('hidden');
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function sendMessage(event){
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient){
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage",{},JSON.stringify(chatMessage));
    }
    event.preventDefault();
}
function onMessageReceived(payload){
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');
    if(message.type === 'JOIN'){
        messageElement.classList.add('event-message');
        message.content = message.sender + 'joined';
    }
    else if(message.type==='LEAVE'){
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    }
    else{
        messageElement.classList.add('event-message');
        var avataElement = document.createElement('i');
        var avataText = document.createTextNode(message.sender[0]);
        avataElement.appendChild(avataText);
        avataElement.style['background-color'] = getAvatarColor(message.sender);
        messageElement.appendChild(avataElement);
        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }
    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}
function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}
usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
