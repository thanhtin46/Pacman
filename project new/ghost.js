class Ghost {
    constructor(x, y, width, height, speed, imageX, imageY, imageWidth, imageHeight, range) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = DIRECTION_LEFT;
        this.imageX = imageX;
        this.imageY = imageY;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.range = range;
        this.randomTargetIndex = parseInt(Math.random() * 4);
        this.target = randomTargetsForGhosts[this.randomTargetIndex];

        setInterval(() => {
            this.changeRandomDirection();
        }, 10000);
    }

    isInRange() {
        let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        if (Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range) {
            return true;
        }
        return false;
    }

    changeRandomDirection() {
        this.randomTargetIndex = parseInt(Math.random() * 4);
    }

    moveProcess() {
        if (this.isInRange()) {
            this.target = pacman;
        } else {
            this.target = randomTargetsForGhosts[this.randomTargetIndex];
        }
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollision()) {
            this.moveBackwards();
        }
    }

    moveForwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT:
                this.x += this.speed;
                break;
            case DIRECTION_LEFT:
                this.x -= this.speed;
                break;
            case DIRECTION_UP:
                this.y -= this.speed;
                break;
            case DIRECTION_BOTTOM:
                this.y += this.speed;
                break;
        }
    }

    moveBackwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT:
                this.x -= this.speed;
                break;
            case DIRECTION_LEFT:
                this.x += this.speed;
                break;
            case DIRECTION_UP:
                this.y += this.speed;
                break;
            case DIRECTION_BOTTOM:
                this.y -= this.speed;
                break;
        }
    }

    checkCollision() {
        let mapY = parseInt(this.y / oneBlockSize);
        let mapX = parseInt(this.x / oneBlockSize);
        let mapYEnd = parseInt((this.y + this.height - 1) / oneBlockSize);
        let mapXEnd = parseInt((this.x + this.width - 1) / oneBlockSize);

        if (
            mapY < 0 || mapX < 0 ||
            mapYEnd >= map.length || mapXEnd >= map[0].length
        ) {
            return true;
        }

        if (
            map[mapY][mapX] === 1 ||
            map[mapYEnd][mapX] === 1 ||
            map[mapY][mapXEnd] === 1 ||
            map[mapYEnd][mapXEnd] === 1
        ) {
            return true;
        }
        return false;
    }

    changeDirectionIfPossible() {
        let tempDirection = this.direction;
        this.direction = this.calculateDirectionToTarget(
            parseInt(this.target.x / oneBlockSize),
            parseInt(this.target.y / oneBlockSize)
        );

        if (typeof this.direction === "undefined") {
            this.direction = tempDirection;
            return;
        }

        this.moveForwards();
        if (this.checkCollision()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
    }

    calculateDirectionToTarget(destX, destY) {
        let mp = [];
        for (let i = 0; i < map.length; i++) {
            mp[i] = map[i].slice();
        }

        let queue = [
            {
                x: this.getMapX(),
                y: this.getMapY(),
                moves: [],
            },
        ];

        while (queue.length > 0) {
            let poped = queue.shift();
            if (poped.x === destX && poped.y === destY) {
                return poped.moves[0];
            } else {
                if (poped.y >= 0 && poped.y < mp.length && poped.x >= 0 && poped.x < mp[0].length) {
                    mp[poped.y][poped.x] = 1;
                }
                let neighborList = this.addNeighbors(poped, mp);
                for (let i = 0; i < neighborList.length; i++) {
                    queue.push(neighborList[i]);
                }
            }
        }
        return DIRECTION_BOTTOM;
    }

    addNeighbors(poped, mp) {
        let queue = [];
        let numOfRows = mp.length;
        let numOfCols = mp[0].length;

        // Left
        if (poped.x - 1 >= 0 && mp[poped.y][poped.x - 1] !== 1) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_LEFT);
            queue.push({
                x: poped.x - 1,
                y: poped.y,
                moves: tempMoves,
            });
        }

        // Right
        if (poped.x + 1 < numOfCols && mp[poped.y][poped.x + 1] !== 1) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_RIGHT);
            queue.push({
                x: poped.x + 1,
                y: poped.y,
                moves: tempMoves,
            });
        }

        // Up
        if (poped.y - 1 >= 0 && mp[poped.y - 1][poped.x] !== 1) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_UP);
            queue.push({
                x: poped.x,
                y: poped.y - 1,
                moves: tempMoves,
            });
        }

        // Down
        if (poped.y + 1 < numOfRows && mp[poped.y + 1][poped.x] !== 1) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_BOTTOM);
            queue.push({
                x: poped.x,
                y: poped.y + 1,
                moves: tempMoves,
            });
        }

        return queue;
    }

    getMapX() {
        return parseInt(this.x / oneBlockSize);
    }

    getMapY() {
        return parseInt(this.y / oneBlockSize);
    }

    getMapXRightSide() {
        return parseInt((this.x + this.width - 1) / oneBlockSize);
    }

    getMapYRightSide() {
        return parseInt((this.y + this.height - 1) / oneBlockSize);
    }

    draw() {
        canvasContext.drawImage(
            ghostFrames,
            this.imageX,
            this.imageY,
            this.imageWidth,
            this.imageHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}

let updateGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].moveProcess();
    }
};

let drawGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].draw();
    }
};
