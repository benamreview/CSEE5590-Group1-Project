var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 10;
var x = canvas.width/2;
var y = canvas.height-30;
var dx = 0;
var dy = 0;
var paddleHeight = 20;
var paddleWidth = 95;
var paddleX = (canvas.width-paddleWidth)/2;
var paddleY = canvas.height-paddleHeight;
var rightPressed = false;
var leftPressed = false;
var brickRowCount = 3;
var maxbrickColumnCount = 5;
var brickWidth = canvas.width/6;
var brickHeight = canvas.height/12;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;
var score = 0;
var lives = 3;
var gamePaused = true;
var totalBricks = 0;
var bricks = [];
var brickSound;
var metalSound;
var backgroundMusic;

//Ball transformation
var ballStatus = 'normal';
var ballSizeStatus = 'normal';
function setMargin(column) {
    var offset;
    if (column == 1){
        offset = 2 * (brickWidth+brickPadding);
    }
    else if (column == 3){
        offset = (brickWidth+brickPadding);
    }
    else {
        offset = 0;
    }
    return offset;
}

for(var r=0; r<brickRowCount; r++) {
    bricks[r] = [];

    var newColumn = getRandomInt(1,5);
    setMargin(newColumn);
    console.log("New Column: " + newColumn);
    // console.log(setMargin(newColumn));

    for(var c=0; c<newColumn; c++) {
        var randomType = getRandomType();
        if (randomType.type != 4){
            console.log("Countable Brick Type: " + randomType.type);

            totalBricks += randomType.type;
            //console.log("Current Required Score: " + totalBricks);
        }
        if (c === 0){
            bricks[r][0] = { x: 0, y: 0, status: 1, Type: randomType, offset: setMargin(newColumn), glowVal: 0};
        }
        else {
            bricks[r][c] = { x: 0, y: 0, status: 1, Type: randomType, glowVal: 0 };
        }

    }
}
console.log("Total Bricks: " + totalBricks);
console.log(bricks);
// for(var c=0; c<brickColumnCount; c++) {
//     bricks[c] = [];
//     for(var r=0; r<brickRowCount; r++) {
//         bricks[c][r] = { x: 0, y: 0, status: 1 };
//     }
// }

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
// mouse event variables
var mousePosition = {
    x: 0,
    y: 0
};
var mousePressed = false;

/**
 * Track the user's mouse position on mouse move.
 * @param {Event} event
 */
canvas.addEventListener('mousemove', function(event) {
    mousePosition.x = event.offsetX || event.layerX;
    mousePosition.y = event.offsetY || event.layerY;
});

/**
 * Track the user's clicks.
 * @param {Event} event
 */
canvas.addEventListener('mousedown', function(event) {
    mousePressed = true;
});
canvas.addEventListener('mouseup', function(event) {
    mousePressed = false;
});
function keyDownHandler(e) {
    if(e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key == "ArrowLeft") {
        leftPressed = true;
    }
}
function keyUpHandler(e) {
    if(e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "ArrowLeft") {
        leftPressed = false;
    }
}
function checkPaddleMovement(){
    if(rightPressed && paddleX < canvas.width-paddleWidth) {
        paddleX += 7;
    }
    else if(leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
    x += dx;
    y += dy;
}
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}
function collisionDetector(){
    //Collision with bricks
    if (ballStatus == "normal"){
        collisionNormal();
    }
    else if (ballStatus == "fire"){
        collisionFire();
    }
    else {
        collisionNormal();
    }


    //    Collision with walls and paddles

    //Collision with paddle
    if (checkPaddleCollision()){
        dy = -dy;
    }
    //Check for collision with walls
    switch (checkWallCollision()){
        case "side-wall":
            dx = -dx;
            break;
        case "top-wall":
            dy = -dy;
            break;
        case "bottom-wall":
            lives--;
            if(lives <= 0) {
                alert("GAME OVER");
                document.location.reload();
            }
            else {
                //alert("Live Lost!");
                reset();
            }
            break;
    }
}
function collisionFire(){
    //Collision with Bricks
        for(var r=0; r<brickRowCount; r++) {
            for(var c=0; c < maxbrickColumnCount; c++) {
                var b = bricks[r][c];
                if (b!= null){
                    if(b.status == 1) {
                        var collisionPoint = checkBrickCollision(b);
                        if(collisionPoint != false) {
                            if (b.Type.type == 4){
                                //if collides with an unbreakable brick
                                metalSound.play();
                                if (collisionPoint == "left" || collisionPoint == "right"){
                                    dx = -dx;
                                }
                                else if (collisionPoint == "top" || collisionPoint == "bottom"){
                                    dy = -dy;
                                }
                            }

                            else {
                                b.status = 0;
                                score += b.Type.toughness;
                                brickSound = new sound("./assets/explode.wav");
                                brickSound.play();
                            }
                            //console.log("Collided Brick Type: " + b.type)
                                checkBallStatus();
                                checkWinStatus();

                        }
                    }
                }

            }
        }
}
function collisionNormal() {
    //Collision with Bricks
    for(var r=0; r<brickRowCount; r++) {
        for(var c=0; c < maxbrickColumnCount; c++) {
            var b = bricks[r][c];
            if (b!= null){
                if(b.status == 1) {
                    var collisionPoint = checkBrickCollision(b);
                    if(collisionPoint != false) {
                        if (collisionPoint == "left" || collisionPoint == "right"){
                            dx = -dx;
                        }
                        else if (collisionPoint == "top" || collisionPoint == "bottom"){
                            dy = -dy;
                        }

                        //console.log("Collided Brick Type: " + b.type)
                        if (b.Type.type != 4){ //check whether this is a nonbreakable brick
                            brickSound.play();
                            b.glowVal = 30;
                            b.Type.toughness--;
                            b.Type.path = getSpritePath(b.Type.type, true);
                            if (b.Type.toughness <=0 ){
                                b.status = 0;
                            }
                            score++;
                            checkBallStatus();
                            checkWinStatus();

                        }
                        //if collides with an unbreakable brick
                        else{
                            metalSound.play();
                        }

                    }
                }
            }

        }
    }
// //    Collision with walls and paddles
//
//     //Collision with paddle
//     if (checkPaddleCollision()){
//         dy = -dy;
//     }
//     //Check for collision with walls
//     switch (checkWallCollision()){
//         case "side-wall":
//             dx = -dx;
//             break;
//         case "top-wall":
//             dy = -dy;
//             break;
//         case "bottom-wall":
//             lives--;
//             if(lives <= 0) {
//                 alert("GAME OVER");
//                 document.location.reload();
//             }
//             else {
//                 //alert("Live Lost!");
//                 reset();
//             }
//             break;
//     }
}
function checkBallStatus() {
    if (score >= 2){
        ballSizeStatus = "large";
    }
    if (score >= 4){
        ballStatus = "fire";
    }
}
function checkWinStatus() {
    if(score == totalBricks) {
        alert("YOU WIN, CONGRATS!");
        document.location.reload();
    }
}
function checkBrickCollision(brick){
    if (x+dx >= brick.x-ballRadius && x+dx <= brick.x+brickWidth+ballRadius) {
        if ((brick.y-ballRadius - Math.abs(dy) <= y+dy) && (y+dy <= brick.y-ballRadius)) {
            //alert('top');
            return "top";
        }
        else if ((brick.y+brickHeight+ballRadius + Math.abs(dy) >= y +dy) && (y + dy >= brick.y+brickHeight+ballRadius)){
            //alert('bottom');
            return "bottom";
        }
    }
    if(y+dy >= brick.y-ballRadius && y+dy <= brick.y+brickHeight+ballRadius) {
        if ((x+dx >= brick.x - ballRadius - Math.abs(dx)) && (x+dx <= brick.x - ballRadius)){
            //console.log('left');
            return "left";
        }
        else if ((x+dx <= brick.x + brickWidth + ballRadius + Math.abs(dx)) && (x+dx >= brick.x + brickWidth + ballRadius)){
            //console.log('right');
            return "right";
        }
    }
    return false;
}
function checkPaddleCollision(){
    //Collision with paddle
    if (y + dy > paddleY-ballRadius) {
        if(x + dx > paddleX - ballRadius && x + dx < paddleX + paddleWidth + ballRadius) {
            return true;
        }
    }
    else {
        return false;
    }
}
function checkWallCollision(){
    //Check for collision with walls
    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        return "side-wall";
    }
    if(y + dy < ballRadius) {
        return "top-wall";
    }
    if(y + dy > canvas.height-ballRadius) {

        return "bottom-wall";
    }
}
function drawWall(){

}
function drawBackground(){
    var img = new Image();
    img.src = "assets/background.jpg";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}
function drawBall() {
    setGlow(false);
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
    var img = new Image();
    if (ballStatus == "fire"){
        img.src = "assets/fireball.png";
    }
    else if (ballStatus == "normal"){
        img.src = "assets/ball.png";
    }
    if (ballSizeStatus == 'large'){
        ballRadius = 15;
        //img.src = "assets/ball.png";
    }
    ctx.drawImage(img, x-ballRadius, y-ballRadius, ballRadius*2, ballRadius*2);

}
function drawPaddle() {
    // ctx.beginPath();
    // ctx.rect(paddleX, paddleY , paddleWidth, paddleHeight);
    // ctx.fillStyle = "#0095DD";
    // ctx.fill();
    // ctx.closePath();
    setGlow(false);
    var img = new Image();
    img.src = "assets/paddle1.png";
    ctx.drawImage(img, paddleX, paddleY, paddleWidth, paddleHeight);
}

function setGlow(status) {
    if (status === true){
        ctx.shadowBlur = 20;
        ctx.shadowColor = "white";
    }
    else {
        ctx.shadowBlur = 0;
        ctx.shadowColor = "";
    }
}

function drawBricks() {
    for(var r=0; r<brickRowCount; r++) {
        for(var c=0; c < maxbrickColumnCount; c++) {
            var b = bricks[r][c];

            if (b!=null){
                if(b.status == 1) {
                    var brickX = (c* (brickWidth+brickPadding))+brickOffsetLeft + bricks[r][0].offset;
                    var brickY = (r* (brickHeight+brickPadding))+brickOffsetTop;
                    b.x = brickX;
                    b.y = brickY;
                    if (b.glowVal > 0){
                        //setGlow(false);
                        animateGlow(b.glowVal);
                        b.glowVal --;
                    }
                    else {
                        setGlow(true);
                    }
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = b.Type.color;
                    ctx.fill();
                    ctx.closePath();



                    var img = new Image();
                    img.src = b.Type.path;
                    ctx.drawImage(img, b.x,b.y,brickWidth, brickHeight);

                }
            }

        }
    }
}
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}
function drawClickToStart(){
    //Ball not moving
    if (dx == 0 && dy == 0){
        //console.log("in drawClickToStart");
        ctx.font = "25px Arial";
        ctx.fillStyle = "#42f445";
        ctx.fillText("CLICK TO START!", x - 25*4, canvas.height/2);
    }

    //requestAnimationFrame(drawClickToStart)

}
function drawPlayBtn(){
    ctx.font = "16px Arial";
    var playWidth = 100;
    var playHeight = 80;
    var playX = (canvas.width-playWidth)/2;
    var playText = "PLAY NOW!"
    var playButton = new Button(playX, canvas.height-playHeight, playWidth, playHeight, playText, {
        'default': {
            top: '#1879BD'
        },
        'hover': {
            top: '#2C43EA'
        },
        'active': {
            top: '#7C14DD'
        }
    }, function() {
        animate = function(){}; //no need to render the play button anymore
        console.log("clicked Play");
        canvas.addEventListener('mouseup', startGame());


    });
    function animate() {
        requestAnimationFrame(animate);

        playButton.update();
        playButton.draw();
    }
    requestAnimationFrame(animate);
}
function startGame(e){
    mousePressed = false;
    //Initialize all the necessary sounds
    backgroundMusic = new sound("./assets/sample.mp3");
    backgroundMusic.playLoop();
    brickSound = new sound("./assets/brick.wav");
    metalSound = new sound("./assets/metal.wav");
    //Start Drawing
    draw();
    canvas.removeEventListener('mousedown', startGame);
    //Reset position
    reset();
}
function reset(){

    resetPosition();
    //drawClickToStart();
    canvas.addEventListener('mousedown', resetSpeed);
}
function resetPosition(){

    x = canvas.width/2;
    y = canvas.height-30;
    paddleX = (canvas.width-paddleWidth)/2;
    dx = 0;
    dy = 0;
}
function resetSpeed(e){
    mousePressed = false;
    setRandomDirection();
    console.log("dx: " + dx + ' dy: ' + dy);
    canvas.removeEventListener('mousedown', resetSpeed);
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //this can be used as a laser upgrade!
    //drawPlayBtn();
    drawBackground();
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    drawClickToStart();
    collisionDetector();
    checkPaddleMovement();
    requestAnimationFrame(draw); //Built-in method that paints objects for every frame
}


/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
//Get random ODD int from min to max
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    // console.log("Min: " + min);
    // console.log("Max: " + max);

    var randNum = Math.floor(Math.random() * (max - min + 1)) + min;
    while (randNum % 2 == 0){
        randNum = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log("new number: " + randNum);
    }
    return randNum;
}
//Get random int from min to max
function getRandomInt2(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    // console.log("Min: " + min);
    // console.log("Max: " + max);

    var randNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return randNum;
}
function getRandomType() {
    var types = [
        {type: 1, color: "#80ef10", toughness: 1, path: getSpritePath(1, false)},
        {type: 2, color: "#f4f407", toughness: 2, path: getSpritePath(2, false)},
        {type: 3, color: "#ed2009", toughness: 3, path: getSpritePath(3, false)},
        {type: 4, color: "#8c9188", toughness: 100000, path: getSpritePath(4, false)},
    ];
    var index = getRandomInt2(0, types.length-1);
    return types[index];
}
//    For random layout, check typeof element in the 2D array as "undefined" or not before proceeding to draw it
//    Also, change column and row if possible
//    Remove mouse mechanism if possible. It's too funny
function getSpritePath(type,isCracked){
    if (isCracked){
        return "./assets/type" + type +  "cracked.png";
    }
    else{
        return "./assets/type" + type +  ".png";
    }

}
function setRandomDirection(){
    var x = getRandomInt2(-5,5);
    while (Math.abs(x) > 0 && Math.abs(x) < 1 ){
        x = getRandomInt2(-5,5);
    }
    var y = getRandomInt2(4,6);
    dx = x;
    dy = -y;
}
function animateGlow(val){
    ctx.shadowColor = "blue";
    ctx.shadowBlur = val;

}
//Buttons
/**
 * A button with hover and active states.
 * @param {integer} x     - X coordinate of the button.
 * @param {integer} y     - Y coordinate of the button.
 * @param {integer} w     - Width of the button.
 * @param {integer} h     - Height of the button.
 * @param {string}  text  - Text on the button.
 * @param {object}  colors - Default, hover, and active colors.
 *
 * @param {object} colors.default - Default colors.
 * @param {string} colors.default.top - Top default button color.
 * @param {string} colors.default.bottom - Bottom default button color.
 *
 * @param {object} colors.hover - Hover colors.
 * @param {string} colors.hover.top - Top hover button color.
 * @param {string} colors.hover.bottom - Bottom hover button color.
 *
 * @param {object} colors.active - Active colors.
 * @param {string} colors.active.top - Top active button color.
 * @param {string} colors.active.bottom - Bottom active button color.
 *
 * @param {function} clickCB - The funciton to call when the button is clicked.
 */
function Button(x, y, w, h, text, colors, clickCB) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.colors = colors;
    this.text = text;

    this.state = 'default';  // current button state

    var isClicking = false;

    /**
     * Check to see if the user is hovering over or clicking on the button.
     */
    this.update = function() {
        // check for hover
        if (mousePosition.x >= this.x && mousePosition.x <= this.x + this.width &&
            mousePosition.y >= this.y && mousePosition.y <= this.y + this.height) {
            this.state = 'hover';

            // check for click
            if (mousePressed) {
                this.state = 'active';

                if (typeof clickCB === 'function' && !isClicking) {
                    clickCB();
                    isClicking = true;
                }
            }
            else {
                isClicking = false;
            }
        }
        else {
            this.state = 'default';
        }
    };

    /**
     * Draw the button.
     */
    this.draw = function() {
        ctx.save();

        var colors = this.colors[this.state];
        var halfH = this.height / 2;

        // button
        ctx.fillStyle = colors.top;
        ctx.fillRect(this.x, this.y, this.width, halfH);
        ctx.fillStyle = colors.bottom;
        ctx.fillRect(this.x, this.y + halfH, this.width, halfH);

        // text
        var size = ctx.measureText(this.text);
        var x = this.x + (this.width - size.width) / 2;
        var y = this.y + (this.height - 15) / 2 + 12;

        ctx.fillStyle = '#FFF';
        ctx.fillText(this.text, x, y);

        ctx.restore();
    };
}
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    };
    this.playLoop = function(){
        this.sound.loop=true;
        this.sound.play();
    };
    this.stop = function(){
        this.sound.pause();
    };
}

//To do list: Set upgrades and drop items


//////////////////////////////////////////////////////////////////////////////////
drawPlayBtn();
//draw();