


function make_f_req(album_key, imgs){
    var XXimg_keysXX = [];
    for (var i = 1; i < imgs.length; i++) {
        var io = imgs[i];
        XXimg_keysXX.push([[io.key]]);
    }
    var j1 = [
        album_key,
        [],
        3,
        null,
        XXimg_keysXX, // ベースに続く順
        [[imgs[0].key]]// ベースになるメディア
    ];
    return [
        [
            [
                "QD9nKf",
                JSON.stringify(j1),
                null,
                "generic"
            ]
        ]
    ];

}


function fail_func(res, status, xhr) {
    alert(res);
    alert(status);
    alert(xhr.status);
}


function sortImgs(al){

    function done_sort(res, status, xhr) {
        console.log(res);
        console.log(status);
        console.log(xhr.status);
        console.log('sort success');
        // reload
        reload(al);
    }

    var f_req = make_f_req(al.key, al.new_imgs);
    var q_o = {
        '_reqid': '1103478',
        'bl': 'boq_photosuiserver_20180820.09_p0',
        'f.sid': al.f_sid,
        'hl': 'ja',
        'rt': 'c',
        'soc-app': '165',
        'soc-device': '1',
        'soc-platform': '1'
    };
    var q = $.param(q_o);
    var url = 'https://photos.google.com/_/PhotosUi/data/batchexecute?' + q;
    var data = {'f.req': JSON.stringify(f_req), 'at': al.at_};
    console.log(data);
    $.ajax({
        url: url,
        type: 'POST',
        data: data, // req data
        dataType: 'text', // res data type
        async: true
    }).done(
        done_sort
    ).fail(
        fail_func
    );

}


function sortByName(a, b){
    var an = a.name.toString().toLowerCase();
    var bn = b.name.toString().toLowerCase();
    if(an < bn){
        return -1;
    }else if(an > bn){
        return 1;
    }
    return 0;
}


function onAjaxSuccess(res, status, xhr, al){
    var j_src = res.split(/\n\d+\n/)[1];
    var j = JSON.parse(j_src);
    var j2 = JSON.parse(j[0][2]);
    var io = {};
    io.key = j2[0][0]; // == imgkey
    io.name = j2[0][2];
    io.modified = j2[0][3];
    al.new_imgs.push(io);
    console.log(io.name);
    console.log(io.key);

    addName(io.name);
    var per = (al.new_imgs.length / al.imgs.length) * 100;
    addPercent(per);
    // iは結果が返る前にに上書きされてる
    if (al.new_imgs.length == al.imgs.length){
        al.new_imgs.sort(sortByName);
        sortImgs(al);
    }
}


function parse_direct_album_page(src, al){
    var sww = src.split('window.WIZ_global_data = ')[1].split(';')[0];
    var wiz_global_data = JSON.parse(sww);
    al.f_sid = wiz_global_data.FdrFJe;
    al.at_ = wiz_global_data.SNlM0e;

    var stat_j_src = src.split('data:function(){return ')[1];
    stat_j_src = stat_j_src.split('}});')[0];
    var stat_j = JSON.parse(stat_j_src);

    var q_o = {
        '_reqid': '1201541',
        'bl': 'boq_photosuiserver_20180820.09_p0',
        'f.sid': al.f_sid,
        'hl': 'ja',
        'rt': 'c',
        'soc-app': '165',
        'soc-device': '1',
        'soc-platform': '1'
    };
    var q = $.param(q_o);
    var url = 'https://photos.google.com/_/PhotosUi/data/batchexecute?' + q;

    al.imgs = stat_j[1];
    al.new_imgs = [];

    function done_get_img_name(res, status, xhr) {
        onAjaxSuccess(res, status, xhr, al);
    }

    for (var i = 0; i < al.imgs.length; i++) {
        var imgkey = al.imgs[i][0];
        // alert(imgkey);
        var f_req = '[[["fDcn4b", "[\\"' + imgkey + '\\",1]", null, "DMzJyf:0|response"]]]';
        var data = {'f.req': f_req, 'at': al.at_};

        // jquery slimにajaxない
        $.ajax({
            url: url,
            type: 'POST',
            data: data, // req data
            dataType: 'text', // res data type
            async: true // 非同期でprogress barに反映
        }).done(
            // アロー関数直書きだと変数が次のスレッドに汚染される？
            done_get_img_name
        ).fail(
            fail_func
        );

    }
}




function getDirectAlbum(al) {
    console.log('album_key:' + al.key);
    function done_get_album(res, status, xhr) {
        parse_direct_album_page(res, al);
    }

    // 単にURLがアルバムというだけではソースが一定で無いので
    // 取得したほうが早い。
    $.ajax({
        url: 'https://photos.google.com/album/' + al.key,
        type: 'GET',
        dataType: 'text', // res data type
        async: true
    }).done(
        done_get_album
    ).fail(
        fail_func
    );
}




