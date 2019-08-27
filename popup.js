
function addName(nm) {
    $("h5").text(nm);
}

function myspin(){
    $('i').addClass('rotate-anime');
}

function mystop(){
    $('i').removeClass('rotate-anime');
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
    var re = new RegExp(
        'https://photos.google.com/' +
        '(u/([0-9]+)/)?(album|share)/([^/\u003f]+)'
    );
    var m = activeTab.url.match(re);
    console.log(m);
    if (! m) {
        alert('Not album');
        return;
    }
    al.unum = m[2];
    if(! al.unum){al.unum = '0';}
    al.type = m[3];
    al.key = m[4];
    new Sorter(al).run();
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



