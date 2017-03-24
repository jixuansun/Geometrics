var recognizer;
var last;
var points = [];
var strokeID = 0;

var onCanvasLines = [];
var onCanvasCircles = [];
var onCanvasHalfCircles = [];
var onCanvasRectangles = [];
var onCanvasRectangleVs = [];
var onCanvasSquares = [];
var onCanvasTriangles = [];

var shaking = true;
var isThrownOut = false;
var animating = false;

var backOnCanvasCircles = true;
var backOnCanvasHalfCircles = true;
var backOnCanvasRectangles = true;
var backOnCanvasRectangleVs = true;
var backOnCanvasSquares = true;
var backOnCanvasTriangles = true;

var drawPenPoint = false;

var bgTexture = null;
var bgPosX, bgPosY;

function preload() {
	bgTexture = loadImage("texture.jpg");
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	recognizer = new outlines.Recognizer();

	bgPosX = width / 2;
	bgPosY = height / 2;
}

function touchStarted() {
	// console.log("1 touchStarted")
	strokeID++;
	// drawing = true;
	
}

function touchMoved() {
	stroke(250);
	drawPenPoint = true;

	// if (!addedFirstPoint) {
	if (points.length == 0) {
		// add previous mouse position
		points.push( new outlines.Point(pmouseX, pmouseY, strokeID) );
		// addedFirstPoint = true;
	}
	points.push( new outlines.Point(mouseX, mouseY, strokeID) );

	return false;
}

function touchEnded() {
	// console.log("3 touchEnded")
	drawPenPoint = false;

	if (points.length > 0) { // if actually something was drawn

		getShapes();

	}

	// reset variables for next drawing
	points = [];
	strokeID = 0;
	// addedFirstPoint = false;
	// background(bgColor);
	// drawing = false;
}

function getShapes() {

	// SHAPE RECOGNIZING
	var array = recognizer.Rank(points);
	var string = "";
	for (var i = 0; i < array.length; i++) {
		string += array[i].Name + " " + array[i].Score + " ";
	}
	console.log(string);
	console.log( recognizer.Recognize(points) );

	// stroke(255);

	switch (recognizer.Recognize(points).Name) {

		case "Horizontal":
		case "Vertical":
			onCanvasLines.push({
				startX: points[0].X,
				startY: points[0].Y,
				endX: points[points.length - 1].X,
				endY: points[points.length - 1].Y,
				strokeWeight: random(0.5, 3),
				shake: function() {
			  	this.startX += random(-1, 1)*0.6;
			  	this.startY += random(-1, 1)*0.6;
			  	this.endX += random(-1, 1)*0.6;
			  	this.endY += random(-1, 1)*0.6;
				}
			});
			break;

		case "Circle":
			var shape = {
				x: centroid(points).x,
				y: centroid(points).y,
				finalX: centroid(points).x,
				finalY: centroid(points).y,
				diameter: dist(centroid(points).x, centroid(points).y, points[0].X, points[0].Y)+dist(centroid(points).x, centroid(points).y, points[points.length - 1].X, points[points.length - 1].Y),
				fill: color(random(255), random(255), random(255), random(60,100)),
				strokeWeight: random(0.2, 5),
				shake: function() {
			  	this.x += random(-1, 1)*0.6;
			  	this.y += random(-1, 1)*0.6;
				}
			};
			onCanvasCircles.push( shape );
			break;

		case "HalfCircle":
			var center = centroid(points);
			var p12 = dist(points[0].X, points[0].Y, center.x, center.y);
			var p13 = dist(points[points.length - 1].X, points[points.length - 1].Y, center.x, center.y);
			var p23 = dist(points[0].X, points[0].Y, points[points.length - 1].X, points[points.length - 1].Y);
			var angle = acos((p12 * p12 + p13 * p13 - p23 * p23) / (2 * p12 * p13));
			var startAngle = - (angle - QUARTER_PI) / 2;
			var endAngle = startAngle + angle;
			var shape = {
				x: center.x,
				y: center.y,
				finalX: center.x,
				finalY: center.y,
				diameter: dist(centroid(points).x, centroid(points).y, points[0].X, points[0].Y)+dist(centroid(points).x, centroid(points).y, points[points.length - 1].X, points[points.length - 1].Y),
				angle: angle,
				startAngle: startAngle,
				endAngle: endAngle,
				fill: color(random(255), random(255), random(255), random(60,100)),
				strokeWeight: random(0.2, 5),
				shake: function() {
					this.x += random(-1, 1)*0.6;
			  	this.y += random(-1, 1)*0.6;
				}
			};
			onCanvasHalfCircles.push( shape );
			console.log(shape)
			break;

		case "Rectangle":
			var longestDist = -1;
			var shortestDist = 99999;
			for (var i = 0; i < points.length; i++) {
				var distFromCenteroid = dist(centroid(points).x, centroid(points).y, points[i].X, points[i].Y);
				if (distFromCenteroid > longestDist) {
					longestDist = distFromCenteroid;
				}
				if (distFromCenteroid < shortestDist) {
					shortestDist = distFromCenteroid;
				}
			}
			var shape = {
				x: centroid(points).x,
				y: centroid(points).y,
				finalX: centroid(points).x,
				finalY: centroid(points).y,
				long: longestDist,
				short: shortestDist,
				fill: color(random(255), random(255), random(255), random(60,100)),
				strokeWeight: random(0.2, 5),
				shake: function() {
					this.x += random(-1, 1)*0.6;
					this.y += random(-1, 1)*0.6;
				}
			};
			onCanvasRectangles.push( shape );
			break;

		case "RectangleV":
			var longestDist = -1;
			var shortestDist = 99999;
			for (var i = 0; i < points.length; i++) {
				var distFromCenteroid = dist(centroid(points).x, centroid(points).y, points[i].X, points[i].Y);
				if (distFromCenteroid > longestDist) {
					longestDist = distFromCenteroid;
				}
				if (distFromCenteroid < shortestDist) {
					shortestDist = distFromCenteroid;
				}
			}
			var shape = {
				x: centroid(points).x,
				y: centroid(points).y,
				finalX: centroid(points).x,
				finalY: centroid(points).y,
				long: longestDist,
				short: shortestDist,
				fill: color(random(255), random(255), random(255), random(60,100)),
				strokeWeight: random(0.2, 5),
				shake: function() {
					this.x += random(-1, 1)*0.6;
					this.y += random(-1, 1)*0.6;
				}
			};
			onCanvasRectangleVs.push( shape );
			break;

		case "Square":
			var shape = {
				x: centroid(points).x,
				y: centroid(points).y,
				finalX: centroid(points).x,
				finalY: centroid(points).y,
				size: dist(centroid(points).x, centroid(points).y, points[0].X, points[0].Y)+dist(centroid(points).x, centroid(points).y, points[points.length - 1].X, points[points.length - 1].Y) / 2,
				fill: color(random(255), random(255), random(255), random(60,100)),
				strokeWeight: random(0.2, 5),
				shake: function() {
					this.x += random(-1, 1)*0.6;
					this.y += random(-1, 1)*0.6;
				}
			};
			onCanvasSquares.push( shape );
			break;

		case "Triangle":
			var shape = {
				x: centroid(points).x,
				y: centroid(points).y,
				finalX: centroid(points).x,
				finalY: centroid(points).y,
				size: dist(centroid(points).x, centroid(points).y, points[0].X, points[0].Y)+dist(centroid(points).x, centroid(points).y, points[points.length - 1].X, points[points.length - 1].Y) / 2,
				fill: color(random(255), random(255), random(255), random(60,100)),
				strokeWeight: random(0.2, 5)
			};
			onCanvasTriangles.push(shape);
			break;

		default:
			// point(centroid(points).x, centroid(points).y);
			// point(points[0].X, points[0].Y);
			// point(points[points.length - 1].X, points[points.length - 1].Y);
			break;
	}
}

function centroid(points) {
	var x = 0.0, y = 0.0;
	for (var i = 0; i < points.length; i++) {
		x += points[i].X;
		y += points[i].Y;
	}
	x /= points.length;
	y /= points.length;
	return {
		x: x,
		y: y
	};
}

function drawBackground(){
	background(215,202,166);
  blendMode(BURN);
  imageMode(CENTER);
  
  if(mouseX<width&&mouseY<height&&mouseX>0&&mouseY>0){
    bgPosX+=0.001*(width/2+(width/2-mouseX)-bgPosX);
    bgPosY+=0.001*(height/2+(height/2-mouseY)-bgPosY);
    
  }
  
  image(bgTexture,bgPosX,bgPosY,2*width,2*height);
  
}

function draw() {
	drawBackground();
  stroke(0);


  /* LINES (VERTICAL AND HORIZONTAL) */

  for (var i = 0; i < onCanvasLines.length; i++) {
  	strokeWeight(onCanvasLines[i].strokeWeight);
  	line(onCanvasLines[i].startX, onCanvasLines[i].startY, onCanvasLines[i].endX
  		, onCanvasLines[i].endY);
  	if (shaking) {
  		onCanvasLines[i].shake();
	  }
  }



 	/* CIRCLES (WITH HALO) */

  for (var i = 0; i < onCanvasCircles.length; i++) {
  	var step = random(2,3);
  	step = 3;
  	for (j = 0; j < 15; j ++) {
	  	blendMode(MULTIPLY);
  		// noFill();
  		noStroke();
  		fill(0,0, blue(onCanvasCircles[i].fill), 10);
  		ellipse(onCanvasCircles[i].x, onCanvasCircles[i].y, onCanvasCircles[i].diameter + j * step);
  	}
	  blendMode(BLEND); // reset blendMode
  	
  	stroke(0);
  	strokeWeight(onCanvasCircles[i].strokeWeight);
  	fill(onCanvasCircles[i].fill);
  	ellipse(onCanvasCircles[i].x, onCanvasCircles[i].y, onCanvasCircles[i].diameter);
  	if (shaking) {
	  	onCanvasCircles[i].shake();
	  }
  }

	blendMode(BLEND); // reset blendMode




	/* HALF CIRCLES */

	for (var i = 0; i < onCanvasHalfCircles.length; i++) {  	
  	stroke(0);
  	strokeWeight(onCanvasHalfCircles[i].strokeWeight);
  	fill(onCanvasHalfCircles[i].fill);
  	// ellipse(onCanvasHalfCircles[i].x, onCanvasHalfCircles[i].y, onCanvasHalfCircles[i].diameter);
  	arc(onCanvasHalfCircles[i].x, onCanvasHalfCircles[i].y, onCanvasHalfCircles[i].diameter, onCanvasHalfCircles[i].diameter, onCanvasHalfCircles[i].startAngle, onCanvasHalfCircles[i].endAngle);
  	if (shaking) {
	  	onCanvasHalfCircles[i].shake();
	  }
  }




  /* RECTANGLES (HORIZONTAL) */

	for (var i = 0; i < onCanvasRectangles.length; i++) {
		stroke(0);
		fill(onCanvasRectangles[i].fill);
		strokeWeight(onCanvasRectangles[i].strokeWeight);
		// var thisSize = onCanvasRectangles[i].size;
		var long = onCanvasRectangles[i].long;
		var short = onCanvasRectangles[i].short;
		var thisX = onCanvasRectangles[i].x;
		var thisY = onCanvasRectangles[i].y;
		// rect(thisX - thisSize / 2, thisY - thisSize / 2, thisSize, thisSize);
		rectMode(CENTER);
		rect(thisX, thisY, long * 2, short * 2);
		rectMode(CORNER);
		if (shaking) {
			onCanvasRectangles[i].shake();
		}
	}



	/* RECTANGLES (VERTICAL) */

	for (var i = 0; i < onCanvasRectangleVs.length; i++) {
		stroke(0);
		fill(onCanvasRectangleVs[i].fill);
		strokeWeight(onCanvasRectangleVs[i].strokeWeight);
		// var thisSize = onCanvasRectangleVs[i].size;
		var long = onCanvasRectangleVs[i].long;
		var short = onCanvasRectangleVs[i].short;
		var thisX = onCanvasRectangleVs[i].x;
		var thisY = onCanvasRectangleVs[i].y;
		// rect(thisX - thisSize / 2, thisY - thisSize / 2, thisSize, thisSize);
		rectMode(CENTER);
		rect(thisX, thisY, short * 2, long * 2);
		rectMode(CORNER);
		if (shaking) {
			onCanvasRectangleVs[i].shake();
		}
	}





	/* SQUARES */

	for (var i = 0; i < onCanvasSquares.length; i++) {
		stroke(0);
		fill(onCanvasSquares[i].fill);
		strokeWeight(onCanvasSquares[i].strokeWeight);
		var thisSize = onCanvasSquares[i].size;
		var thisX = onCanvasSquares[i].x;
		var thisY = onCanvasSquares[i].y;
		rect(thisX - thisSize / 2, thisY - thisSize / 2, thisSize, thisSize);
		if (shaking) {
			onCanvasSquares[i].shake();
		}
	}



	/* TRIANGLES */
	// TODO: Do we need triangles? How to draw triangles?
	/*
	for (var i = 0; i < onCanvasTriangles.length; i++) {
		stroke(0);
		fill(onCanvasTriangles[i].fill);
		strokeWeight(onCanvasTriangles[i].strokeWeight);
		var thisSize = onCanvasTriangles[i].size;
		var thisX = onCanvasTriangles[i].x;
		var thisY = onCanvasTriangles[i].y;
	}
	*/




	/* CURRENT DRAWING PEN TRACES */
	
	// draw traces
  if (points.length > 1) {
  	stroke(0);
  	strokeWeight(5);
  	for (var i = 0; i < points.length - 1; i++) {
  		stroke(0, map(i, 0, points.length - 1,150, 255));
  		line(points[i].X, points[i].Y, points[i+1].X, points[i+1].Y);
  	}
  }

  // current pen position
  if (drawPenPoint) {
  	var bigPoint = points[points.length - 1];
  	ellipse(bigPoint.X, bigPoint.Y, 6).noFill();
  }

  if (animating) {
  	animateDrawing();
  }
}

function clearCanvas() {
	points = [];

	onCanvasLines = [];
	onCanvasCircles = [];
	onCanvasHalfCircles = [];
	onCanvasRectangles = [];
	onCanvasRectangleVs = [];
	onCanvasSquares = [];
	onCanvasTriangles = [];

	shaking = true;
	animating = false;
	isThrownOut = false;

	backOnCanvasCircles = true;
	backOnCanvasHalfCircles = true;
	backOnCanvasRectangles = true;
	backOnCanvasRectangleVs = true;
	backOnCanvasSquares = true;
	backOnCanvasTriangles = true;
}

function saveDrawing() {
	// TODO
}

function startAnimation() {
	animating = true;
}

function animateDrawing() {
	if (!isThrownOut) {
		shaking = false;
		throwOut();
	} else {
		for (var i = 0; i < onCanvasLines.length; i++) {}
		for (var i = 0; i < onCanvasCircles.length; i++) {
			if (abs(onCanvasCircles[i].x - onCanvasCircles[i].finalX) > 1 && abs(onCanvasCircles[i].y - onCanvasCircles[i].finalY) > 1) {
				var co = 0.96;
				onCanvasCircles[i].x = onCanvasCircles[i].x * co + onCanvasCircles[i].finalX * (1 - co);
				onCanvasCircles[i].y = onCanvasCircles[i].y * co + onCanvasCircles[i].finalY * (1 - co);
			} else {
				backOnCanvasCircles = true;
			}
		}
		for (var i = 0; i < onCanvasHalfCircles.length; i++) {
			if (abs(onCanvasHalfCircles[i].x - onCanvasHalfCircles[i].finalX) > 1 && abs(onCanvasHalfCircles[i].y - onCanvasHalfCircles[i].finalY) > 1) {
				var co = 0.96;
				onCanvasHalfCircles[i].x = onCanvasHalfCircles[i].x * co + onCanvasHalfCircles[i].finalX * (1 - co);
				onCanvasHalfCircles[i].y = onCanvasHalfCircles[i].y * co + onCanvasHalfCircles[i].finalY * (1 - co);
			} else {
				backOnCanvasHalfCircles = true;
			}
		}
		for (var i = 0; i < onCanvasRectangles.length; i++) {
			if (abs(onCanvasRectangles[i].x - onCanvasRectangles[i].finalX) > 1 && abs(onCanvasRectangles[i].y - onCanvasRectangles[i].finalY) > 1) {
				var co = 0.96;
				onCanvasRectangles[i].x = onCanvasRectangles[i].x * co + onCanvasRectangles[i].finalX * (1 - co);
				onCanvasRectangles[i].y = onCanvasRectangles[i].y * co + onCanvasRectangles[i].finalY * (1 - co);
			} else {
				backOnCanvasRectangles = true;
			}
		}
		for (var i = 0; i < onCanvasRectangleVs.length; i++) {
			if (abs(onCanvasRectangleVs[i].x - onCanvasRectangleVs[i].finalX) > 1 && abs(onCanvasRectangleVs[i].y - onCanvasRectangleVs[i].finalY) > 1) {
				var co = 0.96;
				onCanvasRectangleVs[i].x = onCanvasRectangleVs[i].x * co + onCanvasRectangleVs[i].finalX * (1 - co);
				onCanvasRectangleVs[i].y = onCanvasRectangleVs[i].y * co + onCanvasRectangleVs[i].finalY * (1 - co);
			} else {
				backOnCanvasRectangleVs = true;
			}
		}
		for (var i = 0; i < onCanvasSquares.length; i++) {
			if (abs(onCanvasSquares[i].x - onCanvasSquares[i].finalX) > 1 && abs(onCanvasSquares[i].y - onCanvasSquares[i].finalY) > 1) {
				var co = 0.96;
				onCanvasSquares[i].x = onCanvasSquares[i].x * co + onCanvasSquares[i].finalX * (1 - co);
				onCanvasSquares[i].y = onCanvasSquares[i].y * co + onCanvasSquares[i].finalY * (1 - co);
				console.log('returning')
			} else {
				backOnCanvasSquares = true;
			}
		}
		for (var i = 0; i < onCanvasTriangles.length; i++) {
			if (abs(onCanvasTriangles[i].x - onCanvasTriangles[i].finalX) > 1 && abs(onCanvasTriangles[i].y - onCanvasTriangles[i].finalY) > 1) {
				var co = 0.96;
				onCanvasTriangles[i].x = onCanvasTriangles[i].x * co + onCanvasTriangles[i].finalX * (1 - co);
				onCanvasTriangles[i].y = onCanvasTriangles[i].y * co + onCanvasTriangles[i].finalY * (1 - co);
			} else {
				backOnCanvasTriangles = true;
			}
		}
	}
	if (backOnCanvasCircles == true && backOnCanvasHalfCircles == true && backOnCanvasRectangles == true && backOnCanvasRectangleVs == true && backOnCanvasSquares == true && backOnCanvasTriangles == true) {
		animating = false;
		isThrownOut = false;
		shaking = true;
	}
}

function throwOut() {
	for (var i = 0; i < onCanvasLines.length; i++) {}
	for (var i = 0; i < onCanvasCircles.length; i++) {
		var r = round(random(0,1));
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasCircles[i].x = random(width) + plusOrMinus * width;
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasCircles[i].y = random(height) + plusOrMinus * height;
		backOnCanvasCircles = false;
	}
	for (var i = 0; i < onCanvasHalfCircles.length; i++) {
		var r = round(random(0,1));
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasHalfCircles[i].x = random(width) + plusOrMinus * width;
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasHalfCircles[i].y = random(height) + plusOrMinus * height;
		backOnCanvasHalfCircles = false;
	}
	for (var i = 0; i < onCanvasRectangles.length; i++) {
		var r = round(random(0,1));
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasRectangles[i].x = random(width) + plusOrMinus * width;
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasRectangles[i].y = random(height) + plusOrMinus * height;
		backOnCanvasRectangles = false;
	}
	for (var i = 0; i < onCanvasRectangleVs.length; i++) {
		var r = round(random(0,1));
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasRectangleVs[i].x = random(width) + plusOrMinus * width;
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasRectangleVs[i].y = random(height) + plusOrMinus * height;
		backOnCanvasRectangleVs = false;
	}
	for (var i = 0; i < onCanvasSquares.length; i++) {
		var r = round(random(0,1));
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasSquares[i].x = random(width) + plusOrMinus * width;
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasSquares[i].y = random(height) + plusOrMinus * height;
		backOnCanvasSquares = false;
	}
	for (var i = 0; i < onCanvasTriangles.length; i++) {
		var r = round(random(0,1));
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasTriangles[i].x = random(width) + plusOrMinus * width;
		var plusOrMinus = random(1) < 0.5 ? -1 : 1;
		onCanvasTriangles[i].y = random(height) + plusOrMinus * height;
		backOnCanvasTriangles = false;
	}

	isThrownOut = true;

	
}










