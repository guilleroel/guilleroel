// Global Variables
let font;
let tSize = 150; // Size of text
let tposX, tposY; // Dynamic positions for text
let pointCount = 0.8; // Number of particles (0 = few, 1 = many)
let speed = 70; // Particle speed
let comebackSpeed = 1000; // Behavior after interaction
let dia = 100; // Interaction diameter
let randomPos = true; // Start particles at random positions
let pointsDirection = "down"; // Initial direction for points
let interactionDirection = 1; // Pulling (1) or pushing (-1)
let textPoints = [];
let suckedIn = true; // Track if particles are "sucked in"
let currentWord = "uru"; // Starting word
let nextWord = "guay ;)"; // Word to transform into

// Variables for shake detection
let prevMouseX, prevMouseY;
let shakeThreshold = 450; // Threshold for shake detection

// Preload font
function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

// Setup canvas and initialize particles
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Dynamically set text position based on canvas size
  tposX = width * 0.2; // 20% from the left
  tposY = height * 0.6; // 60% from the top

  setupTextPoints(currentWord);

  // Initialize previous mouse position for shake detection
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

// Function to setup particle system for a word
function setupTextPoints(word) {
  textPoints = []; // Reset text points

  // Generate points for the current word
  let points = font.textToPoints(word, tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  console.log(`Setting up text points for word: ${word}`);

  // Create Interact objects for each point
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }
}

// Draw loop
function draw() {
  background(29, 60, 110);

  // Track if all particles are near the mouse
  let allNearMouse = true;

  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update();
    v.show();
    v.behaviors();

    // Check if each particle is close enough to the mouse
    if (dist(mouseX, mouseY, v.pos.x, v.pos.y) > dia / 2) {
      allNearMouse = false;
    }
  }

  // Change to next word only when all particles are near the mouse
  if (allNearMouse) {
    if (!suckedIn) {
      console.log("All particles are near the mouse, setting `suckedIn` to true");
      suckedIn = true;
    }
  }

  // Check for mouse shake by calculating speed
  let mouseSpeed = dist(mouseX, mouseY, prevMouseX, prevMouseY);
  console.log(`Mouse speed: ${mouseSpeed}`);

  // If particles are sucked in and mouse shakes, change to next word
  if (suckedIn && mouseSpeed > shakeThreshold) {
    console.log("Shake detected! Releasing particles to form the next word.");
    suckedIn = false;
    setupTextPoints(nextWord); // Reinitialize particles for the next word
  }

  // Update previous mouse position
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

// Particle class and behaviors
function Interact(x, y, m, d, t, s, di, p) {
  this.home = t ? createVector(random(width), random(height)) : createVector(x, y);
  this.pos = this.home.copy();
  this.target = createVector(x, y);

  // Set initial velocity based on direction
  if (di == "general") {
    this.vel = createVector();
  } else if (di == "up") {
    this.vel = createVector(0, -y);
  } else if (di == "down") {
    this.vel = createVector(0, y);
  } else if (di == "left") {
    this.vel = createVector(-x, 0);
  } else if (di == "right") {
    this.vel = createVector(x, 0);
  }

  this.acc = createVector();
  this.r = 8; // Particle radius
  this.maxSpeed = m; // Max speed
  this.maxforce = 1; // Max force
  this.dia = d; // Interaction diameter
  this.come = s; // Comeback speed
  this.dir = p; // Interaction direction
}

// Define behaviors for particles
Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  return steer;
};

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.show = function () {
  stroke(255);
  strokeWeight(4);
  point(this.pos.x, this.pos.y);
};

// Handle window resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Update text position and reinitialize particles
  tposX = width * 0.2;
  tposY = height * 0.6;

  setupTextPoints(currentWord);
}
