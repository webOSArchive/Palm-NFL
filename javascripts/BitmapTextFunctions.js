var BitmapTextFunctions = {};

BitmapTextFunctions.setup = function(){
    BitmapTextFunctions.image = new Image();
    //BitmapTextFunctions.image.src = 'images/arial.png';
    BitmapTextFunctions.image.src = 'images/arial_white_24bit.png';
    BitmapTextFunctions.image.onload = function(){
        Mojo.Log.info("BitmapTextFunctions.image loaded");
    }
}


BitmapTextFunctions.drawText = function(context, text, x, y0){
    Mojo.Log.info(text);
	var y = undefined;	
            
    for (i = 0; i < text.length; i++) {
        try {
            var c = BitmapTextFunctions.letter[text.charCodeAt(i)];
            if (!c) 
                continue;
				
            if (text.charCodeAt(i) != 32) {
				if (!y) {
					y = y0 + (c.h - c.v);
				}
				
                context.drawImage(BitmapTextFunctions.image, c.u, c.v, c.w - c.u, c.h - c.v, x + c.preshift, y - c.yadjust, c.w - c.u, c.h - c.v);
            }
            
            if (c.preshift) 
                x += c.preshift;
            if (c.postshift) 
                x += c.postshift;
        } 
        catch (e) {
            Mojo.Log.error("Exception for("+text.charCodeAt(i)+","+i+"):" + Object.toJSON(e));
        }
    }
}

BitmapTextFunctions.letter = {
    32: {
        postshift: 6
    },
    33: {
        u: 111.0,
        v: 34.0,
        w: 113.0,
        h: 49.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 6
    },
    34: {
        u: 250.0,
        v: 39.0,
        w: 255.0,
        h: 44.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 7
    },
    35: {
        u: 100.0,
        v: 34.0,
        w: 111.0,
        h: 49.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 11
    },
    36: {
        u: 57.0,
        v: 0.0,
        w: 67.0,
        h: 18.0,
        preshift: 0.0,
        yadjust: 16.0,
        postshift: 11
    },
    37: {
        u: 84.0,
        v: 34.0,
        w: 100.0,
        h: 49.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 18
    },
    38: {
        u: 82.0,
        v: 0.0,
        w: 95.0,
        h: 16.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 14
    },
    39: {
        u: 253.0,
        v: 34.0,
        w: 255.0,
        h: 39.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 4
    },
    40: {
        u: 52.0,
        v: 0.0,
        w: 57.0,
        h: 19.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 6
    },
    41: {
        u: 47.0,
        v: 0.0,
        w: 52.0,
        h: 19.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 7
    },
    42: {
        u: 46.0,
        v: 49.0,
        w: 54.0,
        h: 56.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 8
    },
    43: {
        u: 28.0,
        v: 49.0,
        w: 37.0,
        h: 59.0,
        preshift: 1.0,
        yadjust: 12.0,
        postshift: 11
    },
    44: {
        u: 250.0,
        v: 34.0,
        w: 253.0,
        h: 39.0,
        preshift: 1.0,
        yadjust: 2.0,
        postshift: 6
    },
    45: {
        u: 81.0,
        v: 16.0,
        w: 86.0,
        h: 18.0,
        preshift: 1.0,
        yadjust: 6.0,
        postshift: 7
    },
    46: {
        u: 79.0,
        v: 16.0,
        w: 81.0,
        h: 18.0,
        preshift: 2.0,
        yadjust: 2.0,
        postshift: 6
    },
    47: {
        u: 78.0,
        v: 34.0,
        w: 84.0,
        h: 49.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 6
    },
    48: {
        u: 69.0,
        v: 34.0,
        w: 78.0,
        h: 49.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 11
    },
    49: {
        u: 250.0,
        v: 19.0,
        w: 256.0,
        h: 34.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 11
    },
    50: {
        u: 59.0,
        v: 34.0,
        w: 69.0,
        h: 49.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 12
    },
    51: {
        u: 49.0,
        v: 34.0,
        w: 59.0,
        h: 49.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 12
    },
    52: {
        u: 39.0,
        v: 34.0,
        w: 49.0,
        h: 49.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 11
    },
    53: {
        u: 29.0,
        v: 34.0,
        w: 39.0,
        h: 49.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 11
    },
    54: {
        u: 19.0,
        v: 34.0,
        w: 29.0,
        h: 49.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 12
    },
    55: {
        u: 10.0,
        v: 34.0,
        w: 19.0,
        h: 49.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 11
    },
    56: {
        u: 0.0,
        v: 34.0,
        w: 10.0,
        h: 49.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 12
    },
    57: {
        u: 240.0,
        v: 19.0,
        w: 250.0,
        h: 34.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 12
    },
    58: {
        u: 248.0,
        v: 34.0,
        w: 250.0,
        h: 45.0,
        preshift: 2.0,
        yadjust: 11.0,
        postshift: 6
    },
    59: {
        u: 113.0,
        v: 34.0,
        w: 116.0,
        h: 48.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 6
    },
    60: {
        u: 19.0,
        v: 49.0,
        w: 28.0,
        h: 60.0,
        preshift: 1.0,
        yadjust: 13.0,
        postshift: 11
    },
    61: {
        u: 54.0,
        v: 49.0,
        w: 63.0,
        h: 55.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 11
    },
    62: {
        u: 10.0,
        v: 49.0,
        w: 19.0,
        h: 60.0,
        preshift: 1.0,
        yadjust: 13.0,
        postshift: 11
    },
    63: {
        u: 230.0,
        v: 19.0,
        w: 240.0,
        h: 34.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 12
    },
    64: {
        u: 28.0,
        v: 0.0,
        w: 47.0,
        h: 19.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 20
    },
    65: {
        u: 215.0,
        v: 19.0,
        w: 230.0,
        h: 34.0,
        preshift: -1.0,
        yadjust: 15.0,
        postshift: 13
    },
    66: {
        u: 204.0,
        v: 19.0,
        w: 215.0,
        h: 34.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 13
    },
    67: {
        u: 191.0,
        v: 19.0,
        w: 204.0,
        h: 34.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 14
    },
    68: {
        u: 179.0,
        v: 19.0,
        w: 191.0,
        h: 34.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 15
    },
    69: {
        u: 168.0,
        v: 19.0,
        w: 179.0,
        h: 34.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 14
    },
    70: {
        u: 158.0,
        v: 19.0,
        w: 168.0,
        h: 34.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 13
    },
    71: {
        u: 145.0,
        v: 19.0,
        w: 158.0,
        h: 34.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 15
    },
    72: {
        u: 134.0,
        v: 19.0,
        w: 145.0,
        h: 34.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 15
    },
    73: {
        u: 132.0,
        v: 19.0,
        w: 134.0,
        h: 34.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 6
    },
    74: {
        u: 248.0,
        v: 0.0,
        w: 256.0,
        h: 15.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 10
    },
    75: {
        u: 120.0,
        v: 19.0,
        w: 132.0,
        h: 34.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 13
    },
    76: {
        u: 111.0,
        v: 19.0,
        w: 120.0,
        h: 34.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 11
    },
    77: {
        u: 97.0,
        v: 19.0,
        w: 111.0,
        h: 34.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 16
    },
    78: {
        u: 86.0,
        v: 19.0,
        w: 97.0,
        h: 34.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 15
    },
    79: {
        u: 72.0,
        v: 19.0,
        w: 86.0,
        h: 34.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 16
    },
    80: {
        u: 61.0,
        v: 19.0,
        w: 72.0,
        h: 34.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 14
    },
    81: {
        u: 67.0,
        v: 0.0,
        w: 82.0,
        h: 16.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 16
    },
    82: {
        u: 48.0,
        v: 19.0,
        w: 61.0,
        h: 34.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 14
    },
    83: {
        u: 36.0,
        v: 19.0,
        w: 48.0,
        h: 34.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 13
    },
    84: {
        u: 25.0,
        v: 19.0,
        w: 36.0,
        h: 34.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 11
    },
    85: {
        u: 14.0,
        v: 19.0,
        w: 25.0,
        h: 34.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 15
    },
    86: {
        u: 0.0,
        v: 19.0,
        w: 14.0,
        h: 34.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 13
    },
    87: {
        u: 229.0,
        v: 0.0,
        w: 248.0,
        h: 15.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 19
    },
    88: {
        u: 215.0,
        v: 0.0,
        w: 229.0,
        h: 15.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 13
    },
    89: {
        u: 201.0,
        v: 0.0,
        w: 215.0,
        h: 15.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 14
    },
    90: {
        u: 190.0,
        v: 0.0,
        w: 201.0,
        h: 15.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 12
    },
    91: {
        u: 24.0,
        v: 0.0,
        w: 28.0,
        h: 19.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 5
    },
    92: {
        u: 184.0,
        v: 0.0,
        w: 190.0,
        h: 15.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 6
    },
    93: {
        u: 19.0,
        v: 0.0,
        w: 24.0,
        h: 19.0,
        preshift: -1.0,
        yadjust: 15.0,
        postshift: 5
    },
    94: {
        u: 37.0,
        v: 49.0,
        w: 46.0,
        h: 57.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 9
    },
    95: {
        u: 67.0,
        v: 16.0,
        w: 79.0,
        h: 18.0,
        preshift: 0.0,
        yadjust: -2.0,
        postshift: 12
    },
    96: {
        u: 73.0,
        v: 49.0,
        w: 78.0,
        h: 52.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 7
    },
    97: {
        u: 0.0,
        v: 49.0,
        w: 10.0,
        h: 60.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 11
    },
    98: {
        u: 175.0,
        v: 0.0,
        w: 184.0,
        h: 15.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 11
    },
    99: {
        u: 238.0,
        v: 34.0,
        w: 248.0,
        h: 45.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 10
    },
    100: {
        u: 166.0,
        v: 0.0,
        w: 175.0,
        h: 15.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 11
    },
    101: {
        u: 228.0,
        v: 34.0,
        w: 238.0,
        h: 45.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 11
    },
    102: {
        u: 160.0,
        v: 0.0,
        w: 166.0,
        h: 15.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 5
    },
    103: {
        u: 151.0,
        v: 0.0,
        w: 160.0,
        h: 15.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 11
    },
    104: {
        u: 142.0,
        v: 0.0,
        w: 151.0,
        h: 15.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 11
    },
    105: {
        u: 140.0,
        v: 0.0,
        w: 142.0,
        h: 15.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 4
    },
    106: {
        u: 14.0,
        v: 0.0,
        w: 19.0,
        h: 19.0,
        preshift: -2.0,
        yadjust: 15.0,
        postshift: 4
    },
    107: {
        u: 131.0,
        v: 0.0,
        w: 140.0,
        h: 15.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 10
    },
    108: {
        u: 129.0,
        v: 0.0,
        w: 131.0,
        h: 15.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 4
    },
    109: {
        u: 213.0,
        v: 34.0,
        w: 228.0,
        h: 45.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 16
    },
    110: {
        u: 204.0,
        v: 34.0,
        w: 213.0,
        h: 45.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 11
    },
    111: {
        u: 194.0,
        v: 34.0,
        w: 204.0,
        h: 45.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 12
    },
    112: {
        u: 120.0,
        v: 0.0,
        w: 129.0,
        h: 15.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 11
    },
    113: {
        u: 111.0,
        v: 0.0,
        w: 120.0,
        h: 15.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 11
    },
    114: {
        u: 188.0,
        v: 34.0,
        w: 194.0,
        h: 45.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 7
    },
    115: {
        u: 179.0,
        v: 34.0,
        w: 188.0,
        h: 45.0,
        preshift: 0.0,
        yadjust: 11.0,
        postshift: 10
    },
    116: {
        u: 105.0,
        v: 0.0,
        w: 111.0,
        h: 15.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 5
    },
    117: {
        u: 170.0,
        v: 34.0,
        w: 179.0,
        h: 45.0,
        preshift: 1.0,
        yadjust: 11.0,
        postshift: 11
    },
    118: {
        u: 160.0,
        v: 34.0,
        w: 170.0,
        h: 45.0,
        preshift: 0.0,
        yadjust: 11.0,
        postshift: 10
    },
    119: {
        u: 145.0,
        v: 34.0,
        w: 160.0,
        h: 45.0,
        preshift: 0.0,
        yadjust: 11.0,
        postshift: 14
    },
    120: {
        u: 135.0,
        v: 34.0,
        w: 145.0,
        h: 45.0,
        preshift: 0.0,
        yadjust: 11.0,
        postshift: 10
    },
    121: {
        u: 95.0,
        v: 0.0,
        w: 105.0,
        h: 15.0,
        preshift: 0.0,
        yadjust: 11.0,
        postshift: 10
    },
    122: {
        u: 126.0,
        v: 34.0,
        w: 135.0,
        h: 45.0,
        preshift: 0.0,
        yadjust: 11.0,
        postshift: 9
    },
    123: {
        u: 8.0,
        v: 0.0,
        w: 14.0,
        h: 19.0,
        preshift: 1.0,
        yadjust: 15.0,
        postshift: 7
    },
    124: {
        u: 6.0,
        v: 0.0,
        w: 8.0,
        h: 19.0,
        preshift: 2.0,
        yadjust: 15.0,
        postshift: 6
    },
    125: {
        u: 0.0,
        v: 0.0,
        w: 6.0,
        h: 19.0,
        preshift: 0.0,
        yadjust: 15.0,
        postshift: 7
    },
    126: {
        u: 63.0,
        v: 49.0,
        w: 73.0,
        h: 54.0,
        preshift: 1.0,
        yadjust: 10.0,
        postshift: 12
    },
    127: {
        u: 116.0,
        v: 34.0,
        w: 126.0,
        h: 47.0,
        preshift: 2.0,
        yadjust: 13.0,
        postshift: 14
    },
};
