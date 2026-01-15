
// eslint-disable-next-line no-unused-vars
function rq(settings){
    // responseType: arraybuffer blob document json text
    function _rq(resolve){
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(xhr.readyState != 4){return;}
            if(xhr.status !== 200){
                console.log('status = ' + xhr.status);
                alert('request error\n' + settings.url);
                resolve(null);
            }
            resolve(xhr.response);
        };
        xhr.onerror = function(){
            console.log('request error');
            alert('request error\n' + settings.url);
            resolve(null);
        };
        xhr.ontimeout = function(){
            console.log('request timeout');
            alert('request timeout\n' + settings.url);
            resolve(null);
        };
        if(settings.timeout){
            xhr.timeout = settings.timeout;
        }
        console.log(settings.url);
        xhr.open('GET', settings.url, true);
        xhr.responseType = settings.dataType;
        xhr.send();
    }
    // Return a promise that resolves the response
    return new Promise(_rq);
}


function encForm(data){
    let params = [];
    for(let name in data){
        let value = data[name];
        let param = encodeURIComponent(name) + '=' + encodeURIComponent(value);
        params.push(param);
    }
    return params.join('&').replace(/%20/g, '+');
}


// eslint-disable-next-line no-unused-vars
function rq_post(settings){
    // responseType: arraybuffer blob document json text
    function _rq(resolve){
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(xhr.readyState != 4){return;}
            if(xhr.status !== 200){
                console.log('status = ' + xhr.status);
                alert('request error\n' + settings.url);
                resolve(null);
            }
            resolve(xhr.response);
        };
        xhr.onerror = function(){
            console.log('request error');
            alert('request error\n' + settings.url);
            resolve(null);
        };
        xhr.ontimeout = function(){
            console.log('request timeout');
            alert('request timeout\n' + settings.url);
            resolve(null);
        };
        if(settings.timeout){
            xhr.timeout = settings.timeout;
        }
        console.log(settings.url);
        xhr.open('POST', settings.url, true);
        xhr.setRequestHeader(
            'Content-Type', 'application/x-www-form-urlencoded'
        );
        xhr.responseType = settings.dataType;
        xhr.send(encForm(settings.data));
    }
    // Return a promise that resolves the response
    return new Promise(_rq);
}


