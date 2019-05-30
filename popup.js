
function addName(nm) {
    $("h5").text(nm);
}


function addPercent(per) {
    $("#prog1").val(per);
}


function buttonEnable() {
    $("#run_button").prop("disabled", false);
}


function reload(al){
    chrome.tabs.update(al.tab.id, {url: al.tab.url});
}


function onError(error) {
    console.log('Error: ${error}');
}


function onTabs(tabs) {
    console.log(tabs.length + 'tabs');
    console.log(tabs);
    var activeTab = tabs[0];

    var al = {};
    al.tab = activeTab;
    console.log(activeTab.url);
    var m = activeTab.url.match(
        /https:\/\/photos.google.com\/(album|share)\/([^\/\?]+)/
    );
    if (! m) {
        alert('Not album');
        return;
    }
    al.type = m[1];
    al.key = m[2];
    getDirectAlbum(al);
}


function pushButton() {
    this.disabled = true;
    addName('Sorting...');
    chrome.tabs.query(
        {currentWindow: true, active: true},
        onTabs
    );
}
$("#run_button").on('click', pushButton);



