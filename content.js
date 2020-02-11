/*globals chrome Sorter*/

/*
JavaScriptでDOMとURLを変えられただけだと
content.js埋め込まれない
階層が上のURLをmanifestのmatchesに入れないとだめ
*/

(function() {

    console.log('content.js');

    chrome.runtime.onMessage.addListener(
        function(msg, sender, sendResponse){
            console.log(msg);
            console.log(sender);

            // sendResponseしないと
            // Unchecked runtime.lastError:
            // The message port closed
            // before a response was received.
            // がpopupで発生する。
            sendResponse('Thanks to popup.js from content.js');
            if(msg.to != 'content.js'){return;}

            const sorter = new Sorter();
            sorter.run();

        }
    );

    console.log('added');


})();
