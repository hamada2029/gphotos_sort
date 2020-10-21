/*globals chrome*/


// injectするなら起動ボタンなんかも元ページに埋め込みたい


console.log(window.AF_initDataChunkQueue);

function sendMsg(g_ext_id, func, args){
    chrome.runtime.sendMessage(
        g_ext_id,
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

try{
    const g_ext_id = document.getElementById('injected1').getAttribute('g_ext_id');
    alert(g_ext_id);
    sendMsg(g_ext_id, 'addName', [g_ext_id]);
}catch(e){
    alert(e);
    console.log(e);
}