/*globals chrome */


// eslint-disable-next-line no-unused-vars
function sendMsg(func, args){
    chrome.runtime.sendMessage(
        {
            to: 'popup.js',
            func: func,
            // Supports array destructuring like [a, b] = [10, 20]
            args: args
        },
        function(response){
            console.log(response);
        }
    );
}



