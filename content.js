/*globals chrome Sorter*/

/*
If the page only changes DOM/URL via JS, content.js may not be injected.
Make sure higher-level URLs are included in manifest matches.
*/

(function() {

    console.log('content.js');

    chrome.runtime.onMessage.addListener(
        function(msg, sender, sendResponse){
            console.log(msg);
            console.log(sender);

            // Without sendResponse, popup may see:
            // Unchecked runtime.lastError:
            // The message port closed
            // before a response was received.
            sendResponse('Thanks to popup.js from content.js');
            if(msg.to != 'content.js'){return;}

            const sorter = new Sorter();
            sorter.run();

        }
    );

    console.log('added');


})();


// INJECT TEST------------------------------------

// function injectScript(file_path, tag) {
//     var node = document.getElementsByTagName(tag)[0];
//     var script = document.createElement('script');
//     script.setAttribute('type', 'text/javascript');
//     script.setAttribute('src', file_path);
//     script.setAttribute('g_ext_id', chrome.runtime.id);
//     script.setAttribute('id', 'injected1');
//     node.appendChild(script);
// }
// injectScript(
//     chrome.extension.getURL('content2.js'),
//     'body'
// );
