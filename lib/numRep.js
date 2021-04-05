

function zeroPadding(num, length){
    return ('000000000000000' + num).slice(-length);
}

// eslint-disable-next-line no-unused-vars
function numReplacer(match, p1) {
    const len_1 = p1.length - 1;
    if(p1[len_1] == '.'){
        p1 = p1.slice(0, len_1);
        return zeroPadding(p1, 15) + '.';
    }
    return zeroPadding(p1, 15);
}

// eslint-disable-next-line no-unused-vars
const numP = /(\d[\d,.]*)/g;



