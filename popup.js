
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
    al.key = activeTab.url.match(
        /https:\/\/photos.google.com\/album\/([^\/]+)/
    )[1];
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



