

function zeroPadding(num, length){
    return ('000000000000000' + num).slice(-length);
}

// eslint-disable-next-line no-unused-vars
function numReplacer(match, p1) {
  return zeroPadding(p1, 15);
}

// eslint-disable-next-line no-unused-vars
const numP = /(\d[\d,.]*)/g;



