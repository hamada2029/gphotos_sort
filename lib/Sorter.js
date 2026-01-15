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
        this.imgIdSet = {};
    }

    // Delay helper to give the API time to process
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isBatchOk(res, rpcid){
        if(! res){return false;}
        if(res.indexOf('"wrb.fr","' + rpcid + '"') === -1){return false;}
        return true;
    }

    async postWithRetry(data, rpcid, delays){
        for(let i = 0; i < delays.length; i++){
            this.settings.data = data;
            let res = await rq_post(this.settings);
            if(this.isBatchOk(res, rpcid)){
                return res;
            }
            if(i + 1 < delays.length){
                await this.sleep(delays[i]);
            }
        }
        return null;
    }

    makeImgMap(){
        let imgMap = {};
        for(let i = 0; i < this.al.new_imgs.length; i++){
            let io = this.al.new_imgs[i];
            imgMap[io.id] = io;
        }
        return imgMap;
    }

    isSameOrder(a, b){
        if(! a || ! b){return false;}
        if(a.length !== b.length){return false;}
        for(let i = 0; i < a.length; i++){
            if(a[i] !== b[i]){return false;}
        }
        return true;
    }

    async getCurrentOrderIds(){
        let al = new Album();
        let success = await al.parseAlbum();
        if(! success){return null;}
        let ids = [];
        for(let i = 0; i < al.imgs.length; i++){
            ids.push(al.imgs[i][0]);
        }
        return ids;
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
            if(this.imgIdSet[io.id]){
                continue;
            }
            this.imgIdSet[io.id] = true;
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
            if(! this.isBatchOk(res, 'fDcn4b')){
                this.onerr(new Error('fDcn4b batch failed'));
                return null;
            }
            this.addNewImgs(res);
        }
        return true;
    }

    getMissingImgIds(){
        let missing = [];
        for(let i = 0; i < this.al.imgs.length; i++){
            let imgId = this.al.imgs[i][0];
            if(! this.imgIdSet[imgId]){
                missing.push(imgId);
            }
        }
        return missing;
    }

    async fillMissingImgInfos(){
        const maxPass = 3;
        const byNum = 50;
        for(let pass = 0; pass < maxPass; pass++){
            let missing = this.getMissingImgIds();
            if(missing.length === 0){
                return true;
            }
            this.addName(`Filling ${missing.length}`);
            for(let i = 0; i < missing.length; i = i + byNum){
                let ids = missing.slice(i, i + byNum).map(id => [id]);
                let imgInfosFreq = this.makeImgInfosFreq(ids);
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
                if(! this.isBatchOk(res, 'fDcn4b')){
                    this.onerr(new Error('fDcn4b batch failed (fill)'));
                    return null;
                }
                this.addNewImgs(res);
                await this.sleep(300);
            }
        }
        this.onerr(new Error('Missing img infos after retries'));
        return null;
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
            XXimg_keysXX, // Order after base
            [[baseImg.id]]// Base media
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
        // Google API reliably moves about 10 images per batch
        const byNum = 10;
        let baseImg = this.al.new_imgs[0];
        console.log('Sort start, first image:', baseImg.name);
        // Log first/last 10 to verify order
        console.log('Sorted first 10:', this.al.new_imgs.slice(0, 10).map(img => img.name));
        console.log('Sorted last 10:', this.al.new_imgs.slice(-10).map(img => img.name));
        // Start from the second item since the first is the anchor
        for(let i = 1; i < len; i = i + byNum){
            let end = Math.min(i + byNum, len);
            let followImgs = this.al.new_imgs.slice(i, end);
            let freq = this.makeSortFreq(baseImg, followImgs);
            let data = {
                'f.req': JSON.stringify(freq), 'at': this.al.at_
            };
            console.log(`Batch ${Math.ceil(i/byNum)}/${Math.ceil((len-1)/byNum)}: items ${i}-${end-1}, anchor: ${baseImg.name}, first: ${followImgs[0].name}, last: ${followImgs[followImgs.length-1].name}`);
            const delays = [500, 1000, 2000];
            let res;
            try {
                res = await this.postWithRetry(data, 'QD9nKf', delays);
            } catch(e) {
                this.onerr(e);
                return null;
            }
            if(! res){
                const msg = `QD9nKf batch failed: ${i}-${end - 1}`;
                this.onerr(new Error(msg));
                return null;
            }
            this.progress('Sorted', end, len);
            // Next anchor is the last sorted item
            baseImg = followImgs[followImgs.length - 1];
            // Delay between batches so the API can process
            if(i + byNum < len) {
                await this.sleep(500);
            }
        }
        console.log('Sort success - all batches completed');
        return true;
    }

    async fixOrder(expectedIds){
        if(! expectedIds || expectedIds.length <= 1){return true;}
        let currentIds = await this.getCurrentOrderIds();
        if(! currentIds){return null;}
        if(currentIds.length !== expectedIds.length){
            this.onerr(new Error('Order length mismatch'));
            return null;
        }
        if(this.isSameOrder(expectedIds, currentIds)){
            return true;
        }
        this.settings = {
            url: this.al.makeUrl('QD9nKf'),
            type: 'POST',
            dataType: 'text' // res data type
        };
        let imgMap = this.makeImgMap();
        let baseImg = imgMap[expectedIds[0]];
        if(! baseImg){
            this.onerr(new Error('Base image not found'));
            return null;
        }
        const delays = [500, 1000, 2000];
        for(let i = 1; i < expectedIds.length; i++){
            let expectId = expectedIds[i];
            let followImg = imgMap[expectId];
            if(! followImg){
                this.onerr(new Error('Image not found: ' + expectId));
                return null;
            }
            if(currentIds[i] === expectId){
                baseImg = followImg;
                continue;
            }
            let freq = this.makeSortFreq(baseImg, [followImg]);
            let data = {
                'f.req': JSON.stringify(freq), 'at': this.al.at_
            };
            let res;
            try {
                res = await this.postWithRetry(data, 'QD9nKf', delays);
            } catch(e) {
                this.onerr(e);
                return null;
            }
            if(! res){
                const msg = `QD9nKf fix failed: ${i}`;
                this.onerr(new Error(msg));
                return null;
            }
            let fromIndex = currentIds.indexOf(expectId);
            if(fromIndex !== -1){
                currentIds.splice(fromIndex, 1);
            }
            currentIds.splice(i, 0, expectId);
            baseImg = followImg;
            this.progress('Fixing', i + 1, expectedIds.length);
            await this.sleep(500);
        }
        let finalIds = await this.getCurrentOrderIds();
        if(! finalIds){return null;}
        if(! this.isSameOrder(expectedIds, finalIds)){
            this.onerr(new Error('Order still mismatched after fix'));
            return null;
        }
        return true;
    }

    async run(){
        this.myspin();
        this.al = new Album();
        let success = await this.al.parseAlbum();
        if(! success){return;}
        success = await this.getImgInfos();
        if(! success){return;}
        success = await this.fillMissingImgInfos();
        if(! success){return;}
        success = await this.sortImgs();
        if(! success){return;}
        let expectedIds = this.al.new_imgs.map(img => img.id);
        success = await this.fixOrder(expectedIds);
        if(! success){return;}
        this.buttonEnable();
        this.reload(this.al);
        this.mystop();
    }
    // Sometimes the album itself is broken
    // The only fix is to move all images to a new album
}

