



function zeroPadding(num, length){
    return ('000000000000000' + num).slice(-length);
}

function numReplacer(match, p1, offset, string) {
  return zeroPadding(p1, 15);
}

var numP = /(\d[\d,\.]*)/g;



