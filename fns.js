var FNS = {};

FNS.print = function(text) {
    var line = document.createElement('p');
    line.innerHTML = text;
    document.body.appendChild(line);
};

FNS.get = function(uri, callback, type) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', uri, true);
    if (type) xhr.responseType = type;
    xhr.onload = function () {
        if (callback) {
            try {
                callback(this);
            } catch (e) {
                throw 'FNS.get failed on: ' + uri + '\n' +
                      'Exception: ' + e + '\n' +
                      'Response Text: ' + xhr.responseText + '\n' +
                      'Caller: ' + FNS.get.caller;
            }
        }
    };
    xhr.send();
};

FNS.parseWeaponJSON = function (response) {
    var parsedJSON = JSON.parse(response.responseText);
    console.log(parsedJSON);

    // For example:
    var x = parsedJSON.frames['chaingun_impact.png'].spriteSourceSize.x;
    FNS.print('spriteSourceSize x: ' + x);
};

FNS.parseSound = function (handle) {
    var f = function (response) {
        try {
            var context = new webkitAudioContext();
            var mainNode = context.createGainNode(0);
            mainNode.connect(context.destination);
            var clip = context.createBufferSource();
            FNS[handle] = clip;

            context.decodeAudioData(response.response, function (buffer) {
                clip.buffer = buffer;
                clip.gain.value = 1.0;
                clip.connect(mainNode);
                clip.loop = true;
                clip.start(0);
            }, function (data) {});
        } catch (e) {
            console.warn('Web Audio API is not supported in this browser.');
        }
    };
    return f;
};

FNS.makeButton = function(name, action, text) {
    var button = document.createElement('button');
    button.name = name;
    button.onclick = action;
    button.innerHTML = text;
    document.body.appendChild(button);
};

FNS.speak = function () { FNS.print('Hello World!'); };
FNS.weaponize = function() { FNS.get('/weapon.json', FNS.parseWeaponJSON); };
FNS.playSound = function() { FNS.get('/bg_menu.ogg', FNS.parseSound('bgMusicClip'),
                                     'arraybuffer'); };
FNS.stopSound = function() { var clip = FNS['bgMusicClip']; if (clip) clip.stop(0); };

FNS.makeCanvas = function(id, width, height, bgcolor) {
    var canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = width || window.innerWidth;
    canvas.height = height || window.innerHeight;
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    if (bgcolor) {
        ctx.fillStyle = bgcolor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return ctx;
};

FNS.render = function(ctx) {
    var maxW = ctx.canvas.width;
    var maxH = ctx.canvas.height;

    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,maxW, maxH);

    ctx.fillStyle = 'rgb(200,0,0)';
    ctx.fillRect(10,10,55,50);

    ctx.fillStyle = 'rgba(0,0,200,0.5)';
    ctx.fillRect(30,30,55,50);

    ctx.fillStyle = 'green';
    var xOffset = 100;
    var yOffset = 100;
    ctx.beginPath();
    ctx.moveTo(xOffset, yOffset);
    ctx.lineTo(xOffset + 120, yOffset + 120);
    ctx.bezierCurveTo(xOffset + 30, yOffset + 40,
                      xOffset + 30, yOffset + 40,
                      xOffset + 30, yOffset + 120);
    ctx.lineTo(xOffset, yOffset);
    ctx.fill();
};

FNS.drawRobot = function(ctx, x, y) {
    var img = new Image();
    img.onload = function() {
        ctx.drawImage(img, x, y, 0.4 * img.width, 0.4 * img.height);
    };
    // PNG allows transparent alpha pixels unlike JPG
    // for transparent backgrounds
    img.src = '/ralphyrobot.png';
};

FNS.drawCircleRings = function(ctx) {
    var maxW = ctx.canvas.width;
    var maxH = ctx.canvas.height;

    ctx.translate(maxW/2, maxH/2);
    var numRings = 5;

    // Loop through rings
    for (var ring = 1; ring <= numRings; ring++) {
        ctx.save();
        var inc = 255/numRings;
        ctx.fillStyle = 'rgb(' + (inc*ring) + ',' + (255-inc*ring) + ',255)';

        // Draw individual dots in a ring
        for (var dot = 0; dot < ring*6; dot++) {
            ctx.rotate((2 * Math.PI) / (ring*6));
            ctx.beginPath();
            var distToCenterFactor = maxW / 2 / (numRings + 1);
            ctx.arc(0, ring*distToCenterFactor, 5, 0, 2*Math.PI, true);
            ctx.fill();
        }
        ctx.restore();
    }
};

FNS.drawRoboWalk = function(ctx) {
    var dir = '/robowalk/';
    var assets = ['robowalk00.png', 'robowalk01.png', 'robowalk02.png',
                  'robowalk03.png', 'robowalk04.png', 'robowalk05.png',
                  'robowalk06.png', 'robowalk07.png', 'robowalk08.png',
                  'robowalk09.png', 'robowalk10.png', 'robowalk11.png',
                  'robowalk12.png', 'robowalk13.png', 'robowalk14.png',
                  'robowalk15.png', 'robowalk16.png', 'robowalk17.png',
                  'robowalk18.png'];
    var frames = [];
    var frame = 0;
    var frameRate = 1000/33;
    var canvas = ctx.canvas;

    var onImageLoad = function() { console.log('IMAGE!!!'); };
    var animate = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(frames[frame], 0, 0);
        frame = (frame + 1) % frames.length;
    };

    for (var i = 0; i < assets.length; i++) {
        frames.push(new Image());
        frames[i].onload = onImageLoad;
        frames[i].src = dir + assets[i];
    }
    setInterval(animate, frameRate);
};

FNS.drawColorSwatch = function(ctx) {
    var n = 6;
    var s = 25;
    var dec = 255/n;

    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            ctx.fillStyle =
                'rgb(' + Math.floor(255-dec*i) + ','
                + Math.floor(255-dec*j) + ', 0)';
            ctx.fillRect(i*s, j*s, s, s);
        }
    }
};

FNS.draw3DBall = function(ctx, x, y) {
    var r1 = 10;
    var r2 = r1 * 3;
    var xOffset = 7;
    var yOffset = 5;

    var gradient = ctx.createRadialGradient(x, y, r1, x + xOffset, y + yOffset, r2);
    gradient.addColorStop(0, '#A7D30C');
    gradient.addColorStop(0.9, 'rgba(1, 159, 98, 1)');
    gradient.addColorStop(1, 'rgba(1,159,98,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.fillRect(x + xOffset - r2, y + yOffset - r2, 2*r2, 2*r2);
    ctx.fill();
};

FNS.drawBouncingBall = function(ctx) {
    var maxX = ctx.canvas.width;
    var maxY = ctx.canvas.height;

    var requestAnimationFrame = window.requestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.msRequestAnimationFrame ||
                                function(callback) {
                                    window.setTimeout(callback, 1000/60);
                                };

    var x = 100;
    var y = 100;
    var r = 15;

    var speed = [150, 200];  // [x, y] px per second
    var lastTick = 0;  // in ms

    var clearBall = function(x, y, r) {
        ctx.save();
        ctx.fillRect(x-r, y-r, 2*r, 2*r);
        ctx.restore();
    };

    var drawBall = function(x, y, r) {
        ctx.save();
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2*Math.PI, true);
        ctx.fill();
        ctx.restore();
    };

    var update = function(tick) {
        var interval = tick - lastTick;  // in ms
        lastTick = tick;
        x = x + interval/1000 * speed[0];
        y = y + interval/1000 * speed[1];

        // check bounds
        if (x+r > maxX) { x = maxX - r; speed[0] = -1 * speed[0]; }
        if (x-r < 0) { x = r; speed[0] = -1 * speed[0]; }
        if (y+r > maxY) { y = maxY - r; speed[1] = -1 * speed[1]; }
        if (y-r < 0) { y = r; speed[1] = -1 * speed[1]; }
    };

    var animate = function(tick) {
        if (!tick) tick = lastTick + 1000/60;
        requestAnimationFrame(animate);
        clearBall(x, y, r+1);
        update(tick);
        drawBall(x, y, r);
    };

    drawBall(x, y, r);
    requestAnimationFrame(animate);
};

FNS.break = function() {
    var b = document.createElement('p');
    b.id = 'break';
    document.body.appendChild(b);
};

FNS.setup = function() {
    var msg = 'Get Weapon, Play Music, Stop Music, and ' +
              'some images require a running server.';
    FNS.print(msg);

    FNS.makeButton('speak', FNS.speak, 'Speak');
    FNS.makeButton('weaponize', FNS.weaponize, 'Get Weapon');
    FNS.makeButton('playMusic', FNS.playSound, 'Play Music');
    FNS.makeButton('stopMusic', FNS.stopSound, 'Stop Music');

    FNS.break();
    var c1 = FNS.makeCanvas('c1', 500, 400);
    FNS.render(c1);
    FNS.drawRobot(c1, 290, 195);
    FNS.draw3DBall(c1, 100, 325);

    FNS.break();
    var c2 = FNS.makeCanvas('c2', 150, 150, 'black');
    FNS.drawCircleRings(c2);

    var c3 = FNS.makeCanvas('c3', 100, 100);
    FNS.drawRoboWalk(c3);

    var c4 = FNS.makeCanvas('c4', 150, 150);
    FNS.drawColorSwatch(c4);

    FNS.break();
    var c5 = FNS.makeCanvas('c5', 500, 200, 'black');
    FNS.drawBouncingBall(c5);
};
window.onload = function() { FNS.setup(); };

/*
NOTES:
To run local server: python -m SimpleHTTPServer 8000
Or use Node.js for local server and repl
*/
