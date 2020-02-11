/*globals chrome */


// eslint-disable-next-line no-unused-vars
function sendMsg(func, args){
    chrome.runtime.sendMessage(
        {
            to: 'popup.js',
            func: func,
            // [a, b] = [10, 20]でける
            args: args
        },
        function(response){
            console.log(response);
        }
    );
}



