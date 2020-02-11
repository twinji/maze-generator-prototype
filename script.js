var canvas, c;
var labyrinth;

function choose(array) {
    var index = Math.floor(Math.random() * array.length);
    return array[index];
}

function init() {
    canvas = document.getElementById("canvas");
    canvas.width = window.innerHeight;
    canvas.height = window.innerHeight;
    c = canvas.getContext("2d");
}

function Labyrinth(cellsX, cellsY) {
    this.grid = new Array(cellsX);
    this.historyGrid = new Array(cellsX)
    for (var i = 0; i < this.grid.length; i++) {
        this.grid[i] = new Array(cellsY);
        this.historyGrid[i] = new Array(cellsY);
    }
    this.initPos = null;
    this.targetPos = null;
    this.generate = function(initX, initY, dirChangeAttempts, passes) {
        this.initX = initX;
        this.initY = initY;
        this.dirChangeAttempts = dirChangeAttempts;
        for (var w = 0; w < this.grid.length; w++) {
            for (var j = 0; j < this.grid[w].length; j++) {
                this.grid[w][j] = false;
                this.historyGrid[w][j] = false;
            }
        }
        for (var p = 0; p < passes; p++) {
            var pos = {x: this.initX, y: this.initY};
            var pathway = true;
            // true index means open pathway
            // false index means a wall
            do {
                this.grid[pos.x][pos.y] = true;
                var dir = choose(["up", "down", "left", "right"]);
                var newCordX = 0, newCordY = 0;
                switch (dir) {
                    case "up":
                        newCordY = -1;
                        break;
                    case "down":
                        newCordY = 1;
                        break;
                    case "left":
                        newCordX = -1;
                        break;
                    case "right":
                        newCordX = 1;
                        break;
                    default: break;
                }
                try {
                    if (this.grid[pos.x + newCordX * 2][pos.y + newCordY * 2] != undefined) {
                        if (this.grid[pos.x + newCordX * 2][pos.y + newCordY * 2] == false) {
                            if (this.grid[pos.x + newCordX + newCordY][pos.y + newCordY + newCordX] == false &&
                                this.grid[pos.x + newCordX - newCordY][pos.y + newCordY - newCordX] == false) {
                                if (this.grid[pos.x + newCordX * 2 + newCordY][pos.y + newCordY * 2 + newCordX] == false &&
                                    this.grid[pos.x + newCordX * 2 - newCordY][pos.y + newCordY * 2 - newCordX] == false) {
                                    pos.x += newCordX;
                                    pos.y += newCordY;
                                } else {
                                    pathway = false;
                                }
                            } else {
                                pathway = false;
                            }
                        } else {
                            pathway = false;
                        }
                    } else {
                        pathway = false;
                    }
                } catch (e) { // when grid cords are out of bounds
                    pathway = false;
                }
                if (this.dirChangeAttempts > 0) {
                    this.dirChangeAttmepts--;
                    continue;
                }
            } while (pathway);
            var randomPos = this.getRandomPosition(true);
            this.initX = randomPos.x;
            this.initY = randomPos.y;
        }
    };
    this.getRandomPosition = function(isPath) {
        var randomX, randomY;
        do {
            randomX = Math.floor(Math.random() * this.grid.length);
            randomY = Math.floor(Math.random() * this.grid[0].length);
        } while (this.grid[randomX][randomY] != isPath);
        return {x: randomX, y: randomY};
    };
    this.setInitPos = function() {
        this.initPos = this.getRandomPosition(true);
    };
    this.setTargetPos = function() {
        this.targetPos = this.getRandomPosition(true);
    };
    this.findTarget = function(iters) {
        var paths = [[this.initPos]];
        this.historyGrid[this.initPos.x][this.initPos.y] = true;
        for (var i = 0; i < iters; i++) {
            for (var pa = 0; pa < paths.length; pa++) {
                for (var po = paths[pa].length - 1; po < paths[pa].length; po++) {
                    var posX = paths[pa][paths[pa].length - 1].x, posY = paths[pa][paths[pa].length - 1].y;
                    var checks = [[posX + 1, posY], [posX - 1, posY], [posX, posY + 1], [posX, posY - 1]];
                    var prevPathLength = paths[pa].length;
                    var pathways = new Array();
                    for (var k = 0; k < checks.length; k++) {
                        if (this.grid[checks[k][0]][checks[k][1]]) {
                            if (!this.historyGrid[checks[k][0]][checks[k][1]]) {
                                if (checks[k][0] == this.targetPos.x && checks[k][1] == this.targetPos.y) {
                                    paths[pa].push({x: checks[k][0], y: checks[k][1]});
                                    console.log("Found target!");
                                    return true;
                                }
                                pathways.push(checks[k]);
                            }
                        }
                    }
                    if (pathways.length > 1) {
                        for (var p = 0; p < pathways.length; p++) {
                            paths.push([{x: pathways[p][0], y: pathways[p][1]}]);
                            this.historyGrid[pathways[p][0]][pathways[p][1]] = true;
                        }
                    } else if (pathways.length == 1) {
                        paths[pa].push({x: pathways[0][0], y: pathways[0][1]});
                        this.historyGrid[pathways[0][0]][pathways[0][1]] = true;
                    } else {
                        //paths.splice(pa, 1);
                        //break;
                    }
                }
            }
        }
        console.log(paths);
        for (var w = 0; w < this.historyGrid.length; w++) {
            for (var j = 0; j < this.historyGrid[w].length; j++) {
                this.historyGrid[w][j] = false;
            }
        }
        for (var pa = 0; pa < paths.length; pa++) {
            for (var po = 0; po < paths[pa].length; po++) {
                this.historyGrid[paths[pa][po].x, paths[pa][po].y] = true;
            }
        }
    };
    this.render = function(size, c) {
        var cellWidth = size / this.grid.length;
        var cellHeight = size / this.grid[0].length;
        for (var x = 0; x < this.grid.length; x++) {
            for (var y = 0; y < this.grid[x].length; y++) {
                var color = this.grid[x][y] == false? "black":"white";
                c.fillStyle = color;
                c.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                if (this.historyGrid[x][y]) {
                    c.fillStyle = "darkred";
                    c.fillRect(x * cellWidth + cellWidth / 4, y * cellHeight + cellHeight / 4, cellWidth / 2, cellHeight / 2);
                }
            }
        }
        if (this.initPos) {
            c.fillStyle = "blue";
            c.fillRect(this.initPos.x * cellWidth, this.initPos.y * cellHeight, cellWidth, cellHeight);
        }
        if (this.targetPos) {
            c.fillStyle = "red";
            c.fillRect(this.targetPos.x * cellWidth, this.targetPos.y * cellHeight, cellWidth, cellHeight);
        }
    };
}



function main() {
    init();
    labyrinth = new Labyrinth(100, 100);
    labyrinth.generate(50, 50, 1, 1000000);
    labyrinth.setInitPos();
    labyrinth.setTargetPos();
    labyrinth.findTarget(1000);
    labyrinth.render(canvas.height, c);
}
