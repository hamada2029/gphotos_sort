/*globals Gui rq rq_post encForm*/


// eslint-disable-next-line no-unused-vars
class Album extends Gui{
    constructor(){
        super();
        this.url = location.href;
        let m = this.url.match(/\/u\/(\d+)\//);
        console.log(m);
        if(m){
            this.unum = m[1];
        }else{
            this.unum = '0';
        }
        m = this.url.match(/(album|share)\/([^/?]+)/);
        console.log(m);
        this.type = m[1];
        this.id = m[2];
        console.log('album_id:' + this.id);
        this.url_f = `https://photos.google.com/u/${this.unum}/`;

        this.f_sid = null;
        this.at_ = null;
        this.imgs = [];
        this.total = null;
        this.new_imgs = [];
    }

    async getDirectAlbum(){
        this.settings = {
            url: `${this.url_f}${this.type}/${this.id}`,
            type: 'GET',
            dataType: 'text' // res data type
        };
        try {
            return await rq(this.settings);
        } catch(e) {
            this.onerr(e);
            return null;
        }
    }

    makeUrl(rpcids){
        const reqid = Math.floor(Math.random() * 799999) + 200000;
        const q_o = {
            'rpcids': rpcids,
            '_reqid': reqid.toString(),
            'bl': 'boq_photosuiserver_20190709.14_p0',
            'f.sid': this.f_sid,
            'hl': 'ja',
            'rt': 'c',
            'soc-app': '165',
            'soc-device': '1',
            'soc-platform': '1'
        };
        const q = encForm(q_o);
        return this.url_f + '_/PhotosUi/data/batchexecute?' + q;
    }

    async setNextImgs(nextToken){
        this.settings = {
            url: this.makeUrl('snAcKc'),
            type: 'POST',
            dataType: 'text' // res data type
        };
        const j1 = [this.id, nextToken, null, null, true];
        const j2 = ['snAcKc', JSON.stringify(j1), null, 'generic'];
        const freq = [[j2]];
        this.settings.data = {
            'f.req': JSON.stringify(freq),
            'at': this.at_
        };
        let res;
        try {
            res = await rq_post(this.settings);
        } catch(e) {
            this.onerr(e);
            return null;
        }
        res = res.split(/\n\d+\n/)[1];
        const rj1 = JSON.parse(res);
        console.log(rj1);
        const rj2 = JSON.parse(rj1[0][2]);
        const tmp_imgs = rj2[1];
        this.imgs = this.imgs.concat(tmp_imgs);
        nextToken = rj2[2];
        console.log(`nextToken: "${nextToken}"`);
        this.progress('Got imgs', this.imgs.length, this.total);
        return nextToken;
    }

    async parseAlbum(){  // これでやっとアルバム情報揃う
        const src = await this.getDirectAlbum();
        if(! src){return null;}
        const sww = src.split('window.WIZ_global_data = ')[1].split(';')[0];
        const wiz_global_data = JSON.parse(sww);
        this.f_sid = wiz_global_data.FdrFJe;
        this.at_ = wiz_global_data.SNlM0e;

        const script_p = /<script nonce=[^{]+{key: *'ds:\d+'[^<]+<\/script>/g;
        const script_srcs = src.match(script_p);
        let script_src = script_srcs[0];
        script_srcs.forEach(
            function(e_src){
                if(e_src.length > script_src.length){
                    script_src = e_src;
                }
            }
        );
        let stat_j_src = script_src.split('data:function(){return ')[1];
        stat_j_src = stat_j_src.split('}});')[0];
        const stat_j = JSON.parse(stat_j_src);
        // console.log('stat_j: ');
        // console.log(stat_j);
        this.imgs = stat_j[1];
        let nextToken = stat_j[2];
        const albumInfo = stat_j[3];
        this.total = albumInfo[21];
        console.log(`nextToken: "${nextToken}"`);
        this.progress('Got imgs', this.imgs.length, this.total);
        while(nextToken != ''){
            nextToken = await this.setNextImgs(nextToken);
            if(nextToken === null){return null;}
        }
        console.log(albumInfo);
        console.log(this.imgs.length + ' imgs');
        return true;
    }

}
