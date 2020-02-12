/*globals chrome*/

function addName(nm){
    document.getElementById('h5_1').innerText = nm;
}

/* eslint-disable no-unused-vars */
function myspin(){
    document.getElementById('i1').classList.add('rotate-anime');
}

function mystop(){
    document.getElementById('i1').classList.remove('rotate-anime');
}

function addPercent(per){
    document.getElementById('prog1').value = per;
}


function buttonEnable(){
    document.getElementById('run_button').disabled = false;
}


function reload(tab){
    chrome.tabs.update(tab.id, {url: tab.url});
}


function onTabs(tabs){
    const url_p = new RegExp(
        'https://photos.google.com/(u/([0-9]+)/)?(album|share)/([^/?]+)'
    );
    console.log(tabs.length + 'tabs');
    console.log(tabs);
    if(tabs.length == 0){
        alert('no tabs.');
        buttonEnable();
        return;
    }
    console.log(tabs[0].url);
    if(! tabs[0].url.match(url_p)){
        alert('not album page');
        buttonEnable();
        return;
    }
    if(tabs[0].url.indexOf('/photo/') > -1){
        alert('not album page');
        buttonEnable();
        return;
    }
    if(tabs[0].status != 'complete'){
        alert('album page is loading now.');
        buttonEnable();
        return;
    }
    chrome.tabs.sendMessage(
        tabs[0].id,
        {to: 'content.js', content: 'run Sorter'},
        function(response){
            console.log(response);
            if(! response){
                alert('no response from content.js');
                buttonEnable();
                reload(tabs[0]);
            }
        }
    );
}



function sendToContents(){
    this.disabled = true;
    addName('Sorting...');
    chrome.tabs.query(
        {active: true, currentWindow: true},
        onTabs
    );
}
document.getElementById('run_button').addEventListener(
    'click', sendToContents
);


function messageReceived(msg, sender, sendResponse) {
    console.log(msg);
    console.log(sender);
    sendResponse('Thanks from popup.js');
    if(msg.to != 'popup.js'){return;}
    if(msg.func == 'addName'){
        addName(msg.args[0]);
    }else if(msg.func == 'myspin'){
        myspin();
    }else if(msg.func == 'mystop'){
        mystop();
    }else if(msg.func == 'addPercent'){
        addPercent(msg.args[0]);
    }else if(msg.func == 'buttonEnable'){
        buttonEnable();
    }
}
chrome.runtime.onMessage.addListener(messageReceived);

