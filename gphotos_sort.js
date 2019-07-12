/*globals $ addName addPercent numP numReplacer reload spin stop*/

class Sorter{

    constructor(al) {
        this.al = al;
        this.settings = {};
        console.log('album_key:' + al.key);
    }

    onerr(e){
        e.settings = this.settings;
        alert(JSON.stringify(e, null, 4));
        console.log(e);
    }

    getDirectAlbum(){
        this.settings = {
            url: 'https://photos.google.com/' + this.al.type + '/' + this.al.key,
            type: 'GET',
            dataType: 'text' // res data type
        };
        try {
            return $.ajax(this.settings);
        } catch(e) {
            this.onerr(e);
            return null;
        }
    }

    async parseAlbum(){
        const src = await this.getDirectAlbum();
        if(! src){return null;}
        const sww = src.split('window.WIZ_global_data = ')[1].split(';')[0];
        const wiz_global_data = JSON.parse(sww);
        this.al.f_sid = wiz_global_data.FdrFJe;
        this.al.at_ = wiz_global_data.SNlM0e;

        const script_p = /<script nonce=[^<]+key: 'ds:1'[^<]+<\/script>/;
        const script_src = src.match(script_p)[0];

        let stat_j_src = script_src.split('data:function(){return ')[1];
        stat_j_src = stat_j_src.split('}});')[0];
        const stat_j = JSON.parse(stat_j_src);
        this.al.imgs = stat_j[1];
        this.al.new_imgs = [];
        return true;
    }

    makeImgInfosFreq(imgs){
        let imgInfosFreq = [];
        for(let i = 0; i < imgs.length; i++){
            let imgkey = imgs[i][0];
            let j0 = [imgkey, 1];
            let j1 = [
                "fDcn4b", JSON.stringify(j0),
                null, (i + 1).toString()
            ];
            imgInfosFreq.push(j1);
        }
        return [imgInfosFreq];
    }

    addNewImgs(res){
        let infos = res.split(/\n\d+\n/);
        for(var i = 0; i < infos.length; i++){
            let info = infos[i];
            if(info.indexOf('"wrb.fr","fDcn4b"') == -1){
                continue;
            }
            let j = JSON.parse(info);
            let j2 = JSON.parse(j[0][2]);
            let io = {};
            io.key = j2[0][0]; // == imgkey
            io.name = j2[0][2];
            io.modified = j2[0][3];
            this.al.new_imgs.push(io);
            console.log(io.name);
            console.log(io.key);
            addName(io.name);
            let per = (this.al.new_imgs.length / this.al.imgs.length) * 100;
            addPercent(per);
        }
    }

    async getImgInfos(){
        const q_o = {
            'rpcids': 'fDcn4b,EX1ySd',
            '_reqid': '212573',
            'bl': 'boq_photosuiserver_20190709.14_p0',
            'f.sid': this.al.f_sid,
            'hl': 'ja',
            'rt': 'c',
            'soc-app': '165',
            'soc-device': '1',
            'soc-platform': '1'
        };
        const q = $.param(q_o);
        const url = 'https://photos.google.com/_/PhotosUi/data/batchexecute?' + q;
        this.settings = {
            url: url,
            type: 'POST',
            dataType: 'text' // res data type
        };

        const byNum = 50;

        for(let i = 0; i < this.al.imgs.length; i = i + byNum){
            let coimgs = this.al.imgs.slice(i, i + byNum);
            let imgInfosFreq = this.makeImgInfosFreq(coimgs);
            console.log(imgInfosFreq);
            this.settings.data = {
                'f.req': JSON.stringify(imgInfosFreq),
                'at': this.al.at_
            };
            let res;
            try {
                res = await $.ajax(this.settings);
            } catch(e) {
                this.onerr(e);
                return null;
            }
            this.addNewImgs(res);
        }
        return true;
    }

    sortBy(a, b){
        let an = a.name.toString().toLowerCase();
        let bn = b.name.toString().toLowerCase();
        an = an.replace(numP, numReplacer);
        bn = bn.replace(numP, numReplacer);
        if(an < bn){
            return -1;
        }else if(an > bn){
            return 1;
        }
        return 0;
    }

    makeSortFreq(baseImg, followImgs){
        let XXimg_keysXX = [];
        for (let i = 0; i < followImgs.length; i++) {
            let io = followImgs[i];
            XXimg_keysXX.push([[io.key]]);
        }
        var num = 3;
        // if(typ == 'share'){num = 3;}
        var j1 = [
            this.al.key,
            [],
            num,
            null,
            XXimg_keysXX, // ベースに続く順
            [[baseImg.key]]// ベースになるメディア
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

    sortProgress(end, len){
        let per = Math.round(end / len * 100);
        if(per > 100){per = 100;}
        addName('Sorted ' + per + '%');
        addPercent(per);
    }

    async sortImgs(){
        const q_o = {
            '_reqid': '1103478',
            'bl': 'boq_photosuiserver_20190709.14_p0',
            'f.sid': this.al.f_sid,
            'hl': 'ja',
            'rt': 'c',
            'soc-app': '165',
            'soc-device': '1',
            'soc-platform': '1'
        };
        const q = $.param(q_o);
        const url = 'https://photos.google.com/_/PhotosUi/data/batchexecute?' + q;
        this.settings = {
            url: url,
            type: 'POST',
            dataType: 'text' // res data type
        };

        this.al.new_imgs.sort(this.sortBy);
        const len = this.al.new_imgs.length;
        const byNum = 100;
        let baseImg = this.al.new_imgs[0];
        for(let i = 1; i < len; i = i + byNum){
            let end = i + byNum;
            let followImgs = this.al.new_imgs.slice(i, end);
            let freq = this.makeSortFreq(baseImg, followImgs);
            let data = {
                'f.req': JSON.stringify(freq), 'at': this.al.at_
            };
            console.log(data);
            this.settings.data = data;
            try {
                await $.ajax(this.settings);
            } catch(e) {
                this.onerr(e);
                return null;
            }
            this.sortProgress(end, len);
            // 次の基準はソート済みの最後
            baseImg = followImgs[followImgs.length - 1];
        }
        console.log('sorts success');
        return true;
    }

    async run(){
        spin();
        let success = await this.parseAlbum();
        if(! success){return;}
        success = await this.getImgInfos();
        if(! success){return;}
        success = await this.sortImgs();
        if(! success){return;}
        reload(this.al);
        stop();
    }

}




