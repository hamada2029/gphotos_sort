/*globals Gui rq_post numReplacer numP Album*/

class Img{
    constructor(j2){
        this.id = j2[0][0]; // == imgkey
        this.name = j2[0][2];
        this.modified = j2[0][3];
        console.log(this.name);
        console.log(this.id);
    }
}


// eslint-disable-next-line no-unused-vars
class Sorter extends Gui{
    constructor(){
        super();
        this.al = null;
        this.settings = {};
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
            let io = new Img(j2);
            this.al.new_imgs.push(io);
            this.addName(io.name);
            let per = (this.al.new_imgs.length / this.al.imgs.length) * 100;
            this.addPercent(per);
        }
    }

    async getImgInfos(){
        this.settings = {
            url: this.al.makeUrl('fDcn4b'),
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
                res = await rq_post(this.settings);
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
        // console.log('an: ' + an);
        bn = bn.replace(numP, numReplacer);
        // console.log('bn: ' + bn);
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
            XXimg_keysXX.push([[io.id]]);
        }
        var num = 3;
        // if(typ == 'share'){num = 3;}
        var j1 = [
            this.al.id,
            [],
            num,
            null,
            XXimg_keysXX, // ベースに続く順
            [[baseImg.id]]// ベースになるメディア
        ];
        return [
            [
                [
                    'QD9nKf',
                    JSON.stringify(j1),
                    null,
                    'generic'
                ]
            ]
        ];
    }

    async sortImgs(){
        this.settings = {
            url: this.al.makeUrl('QD9nKf'),
            type: 'POST',
            dataType: 'text' // res data type
        };

        this.al.new_imgs.sort(this.sortBy);
        const len = this.al.new_imgs.length;
        const byNum = 100;
        let baseImg = this.al.new_imgs[0];
        // 1つめは基準になるので2つめから
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
                await rq_post(this.settings);
            } catch(e) {
                this.onerr(e);
                return null;
            }
            this.progress('Sorted', end, len);
            // 次の基準はソート済みの最後
            baseImg = followImgs[followImgs.length - 1];
        }
        console.log('sorts success');
        return true;
    }

    async run(){
        this.myspin();
        this.al = new Album();
        let success = await this.al.parseAlbum();
        if(! success){return;}
        success = await this.getImgInfos();
        if(! success){return;}
        success = await this.sortImgs();
        if(! success){return;}
        this.buttonEnable();
        this.reload(this.al);
        this.mystop();
    }
}

