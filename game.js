;(function(exports) {
  var TRACK_COLOR = "#fff";
  var WALL_COLOR = "#000";
  var WHEEL_COLOR = "#000";
  var BACKGROUND_COLOR = "#fff";
  var TEXT_COLOR = "#000";

  function Game() {
    this.size = { x: 1000, y: 500 };
    this.c = new Coquette(this, "screen", this.size.x, this.size.y, BACKGROUND_COLOR);

    this.restart();
    this.best = undefined;

    // cars

    // checkpoints

    this.c.entities.create(Checkpoint, {
      center: { x: 950, y: 240 },
      size: { x: 10, y: 100 },
      angle: 90,
      label: "bridge"
    });

    this.c.entities.create(Checkpoint, {
      center: { x: 55, y: 300 },
      size: { x: 10, y: 100 },
      angle: 90,
      label: "tunnel"
    });

    // walls

    makeWall(this, { x: 900, y: 200 }, { x: 10, y: 210 }, 180); // right inner
    makeWall(this, { x: 995, y: 200 }, { x: 10, y: 400 }, 180); // right outer

    makeWall(this, { x: 700, y: 5 }, { x: 10, y: 600 }, 90); // top outer
    makeWall(this, { x: 700, y: 100 }, { x: 10, y: 410 }, 90) // top inner

    makeWall(this, { x: 400, y: 50 }, { x: 10, y: 100 }, 0); // third straight top

    makeWall(this, { x: 400, y: 300 }, { x: 10, y: 200 }, 0); // third straight left
    makeWall(this, { x: 500, y: 350 }, { x: 10, y: 310 }, 0); // third straight right

    makeWall(this, { x: 250, y: 400 }, { x: 10, y: 310 }, 270); // bottom inner

    makeWall(this, { x: 5, y: 300 }, { x: 10, y: 400 }, 0);
    makeWall(this, { x: 100, y: 300 }, { x: 10, y: 200 }, 0);

    makeWall(this, { x: 200, y: 100 }, { x: 10, y: 410 }, 90);
    makeWall(this, { x: 250, y: 200 }, { x: 10, y: 310 }, 90);

    makeWall(this, { x: 610, y: 200 }, { x: 10, y: 210 }, 180);
    makeWall(this, { x: 750, y: 300 }, { x: 10, y: 290 }, 90);

    makeWall(this, { x: 750, y: 400 }, { x: 10, y: 510 }, 90);

    makeWall(this, { x: 250, y: 495 }, { x: 10, y: 500 }, 270);

    // walls that are conditionally in effect

    this.c.entities.create(Wall, {
      center: { x: 400, y: 150 }, size: { x: 10, y: 90 }, angle: 0, label: "tunnel"
    });

    this.c.entities.create(Wall, {
      center: { x: 500, y: 150 }, size: { x: 10, y: 90 }, angle: 0, label: "tunnel"
    });

    this.c.entities.create(Wall, {
      center: { x: 450, y: 100 }, size: { x: 10, y: 90 }, angle: 90, label: "bridge"
    });

    this.c.entities.create(Wall, {
      center: { x: 450, y: 200 }, size: { x: 10, y: 90 }, angle: 90, label: "bridge"
    });

    // ridiculous bridge

    this.c.entities.create(Bridge);
  };

  Game.prototype = {
    update: function() {
      if (this.state === "countingdown") {
        if (this.lastCountdownDecrement + 1000 < new Date().getTime()) {
          this.countdown--;
          this.lastCountdownDecrement = new Date().getTime();
          if (this.countdown === 0) {
            this.countdown = "GO"
            this.state = "racing";
            this.started = new Date().getTime();
          }
        }
      } else if (this.state === "racing") {
        if (this.car.lapsToGo() === 0) {
          this.stopped = new Date().getTime();
          var time = this.stopped - this.started;
          if (this.best === undefined || time < this.best) {
            this.best = time;
          }

          this.countdown = undefined;
          this.state = "raceover";
        }
      }

      if (this.c.inputter.isPressed(this.c.inputter.R)) {
        this.restart();
      }
    },

    restart: function() {
      this.lastCountdownDecrement = new Date().getTime();
      this.countdown = 2;
      this.state = "countingdown";
      this.started = new Date().getTime();
      this.stopped = undefined;

      var self = this;
      this.c.entities.all(Car).forEach(function(c) {
        self.c.entities.destroy(c);
        c.wheels().forEach(function(w) { self.c.entities.destroy(w); });
      });

      this.car = this.c.entities.create(Car, {
        center: { x: this.size.x * 0.95, y: this.size.y / 2 - 15 },
        keys: { left: this.c.inputter.LEFT_ARROW, right: this.c.inputter.RIGHT_ARROW,
                forward: this.c.inputter.UP_ARROW, backward: this.c.inputter.DOWN_ARROW },
        color: "#33f"
      });
    },

    draw: function(ctx) {
      if (this.state === "raceover") {
        ctx.fillStyle = "#ff0";
        ctx.fillRect(105, 200, 290, 200);
      }

      if (this.state !== "raceover") {
        var color;
        if (this.countdown === 2) {
          color = "#f00";
        } else if (this.countdown === 1) {
          color = "#fc0";
        } else {
          color = "#0f0";
        }
        ctx.fillStyle = color;
        ctx.fillRect(610, 100, 285, 200);
      }


      ctx.font = "20px Courier";
      ctx.fillStyle = TEXT_COLOR;

      // best

      ctx.fillText("BEST " + formatTime(this.best), 160, 277);

      // this

      var thisTimeStr = "THIS ";
      if (this.state === "countingdown") {
        thisTimeStr += "0.000";
      } else if (this.state === "racing") {
        thisTimeStr += formatTime(new Date().getTime() - this.started);
      } else if (this.state === "raceover") {
        thisTimeStr += formatTime(this.stopped - this.started);
      }
      ctx.fillText(thisTimeStr, 160, 307);

      ctx.fillText("LAPS " + this.car.lapsToGo(), 160, 337);
    }
  };

  function makeWall(game, center, size, angle) {
    return game.c.entities.create(Wall, {
      center: center, size: size, angle: angle, on: true
    });
  };

  function Checkpoint(game, options) {
    this.game = game;
    this.center = options.center;
    this.size = options.size;
    this.angle = options.angle;
    this.label = options.label || undefined;
    this.color = "#000";
  };

  Checkpoint.prototype = {
    update: function() {

    },

    draw: function(ctx) {
      if (this.label === "bridge") {
        ctx.restore(); // doing own rotation of drawing so stop framework doing it
        var endPoints = util.objToLinePoints(this);
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(endPoints[0].x, endPoints[0].y);
        ctx.lineTo(endPoints[1].x, endPoints[1].y);
        ctx.stroke();
        ctx.closePath();
      }
    },

    isHorizontal: function() {
      return this.angle === 90;
    },

    collision: function(other) {
      if (other instanceof Car) {
        var car = other;
        var latestPass = car.passes[car.passes.length - 1];
        if (latestPass !== this &&
            car.center.y < this.center.y) {
          car.passes.push(this);
        } else if (latestPass === this &&
                   car.center.y > this.center.y) {
          car.passes.pop();
        }
      }
    }
  };

  function Wall(game, options) {
    this.game = game;
    this.zindex = 0;
    this.center = options.center;
    this.size = options.size;
    this.label = options.label || undefined;

    if (options.angle === undefined) {
      throw "need angle";
    }
    this.angle = options.angle;
  };

  Wall.prototype = {
    draw: function(ctx) {
      if (this.label === undefined) {
        util.fillRect(ctx, this, WALL_COLOR);
      }
    }
  };

  function FrontWheel(game, options) {
    this.game = game;
    this.zindex = 2;
    this.car = options.car;
    this.center = options.center;
    this.size = { x: 4, y: 8 };
    this.angle = 0;
    this.wheelAngle = 0;
  };

  FrontWheel.prototype = {
    turnRate: 0,
    update: function(delta) {
      if (this.game.state === "countingdown") { return; }

      var TURN_ACCRETION = 0.007 * delta;
      var MAX_WHEEL_ANGLE = 30;
      var WHEEL_RECENTER_RATE = 2;

      if (this.game.c.inputter.isDown(this.car.keys.left)) {
        this.turnRate -= TURN_ACCRETION
      } else if (this.game.c.inputter.isDown(this.car.keys.right)) {
        this.turnRate += TURN_ACCRETION;
      } else {
        this.turnRate = 0;
      }

      if (this.turnRate < 0 && this.wheelAngle > -MAX_WHEEL_ANGLE ||
          this.turnRate > 0 && this.wheelAngle < MAX_WHEEL_ANGLE) {
        this.wheelAngle += this.turnRate;
      } else if (this.turnRate === 0) {
        if (this.wheelAngle > 0) {
          this.wheelAngle -= WHEEL_RECENTER_RATE;
        } else if (this.wheelAngle < 0) {
          this.wheelAngle += WHEEL_RECENTER_RATE;
        }
      }

      this.angle = this.car.angle + this.wheelAngle;
    },

    draw: function(ctx) {
      util.fillRect(ctx, this, WHEEL_COLOR);
    },

    collision: function(other) {
      this.car.handleCollision(this, other);
    }
  };

  function BackWheel(game, options) {
    this.game = game;
    this.zindex = 2;
    this.car = options.car;
    this.center = options.center;
    this.size = { x: 4, y: 8 };
    this.angle = 0;
  };

  BackWheel.prototype = {
    draw: function(ctx) {
      util.fillRect(ctx, this, WHEEL_COLOR);
    },

    collision: function(other) {
      this.car.handleCollision(this, other);
    }
  };

  function Bridge(game) {
    this.game = game;
    this.zindex = 3;
  };

  Bridge.prototype = {
    draw: function(ctx) {
      if (this.game.car.label() === "tunnel") {
        util.fillRect(ctx, { center: { x: 450, y: 150 }, size: { x: 90, y: 90 } },
                      BACKGROUND_COLOR);
      }

      util.fillRect(ctx, { center: { x: 400, y: 150 }, size: { x: 10, y: 90 } }, WALL_COLOR);
      util.fillRect(ctx, { center: { x: 500, y: 150 }, size: { x: 10, y: 90 } }, WALL_COLOR);
    }
  };

  function Car(game, options) {
    this.game = game;
    this.zindex = 1;
    this.center = options.center;
    this.keys = options.keys;
    this.color = options.color;
    this.size = { x: 10, y: 24 };
    this.angle = 0;
    this.velocity = { x: 0, y: 0 };
    this.passes = [];

    this.drawables = [];

    this.frontLeft = this.game.c.entities.create(FrontWheel, {
      center: { x: this.center.x - this.size.x / 2, y: this.center.y - this.size.y / 2.5 },
      car: this
    });

    this.frontRight = this.game.c.entities.create(FrontWheel, {
      center: { x: this.center.x + this.size.x / 2, y: this.center.y - this.size.y / 2.5 },
      car: this
    });

    this.backLeft = this.game.c.entities.create(BackWheel, {
      center: { x: this.center.x - this.size.x / 2, y: this.center.y + this.size.y / 2.5 },
      car: this
    });

    this.backRight = this.game.c.entities.create(BackWheel, {
      center: { x: this.center.x + this.size.x / 2, y: this.center.y + this.size.y / 2.5 },
      car: this
    });
  };

  Car.prototype = {
    update: function(delta) {
      if (this.game.state === "countingdown") { return; }

      var ACCELERATION_ACCRETION = 0.002 * delta;
      var MAX_SPEED = 5;

      if (this.frontLeft.wheelAngle !== 0) {
        var turnRadius = this.size.y * 90 / this.frontLeft.wheelAngle;
        var turnCircumference = 2 * Math.PI * turnRadius;
        var rotateProportion = util.magnitude(this.velocity) / turnCircumference;

        var velocityAngle = util.vectorToAngle(this.velocity);
        var orientationAngle = util.vectorToAngle(util.angleToVector(this.angle));

        var rotateAngleDelta = rotateProportion * 360 *
            (Math.abs(velocityAngle - orientationAngle) < 90 ? 1 : -1);
        this.velocity = util.rotate(this.velocity, { x: 0, y: 0 }, rotateAngleDelta);

        this.wheels().concat(this).forEach(function(o) { o.angle += rotateAngleDelta; });
        this.wheels().forEach(function(w) {
          w.center = util.rotate(w.center, this.center, rotateAngleDelta);
        }, this);
      }

      var ratio = MAX_SPEED - util.magnitude(this.velocity);
      if (this.game.c.inputter.isDown(this.keys.forward)) {
        var headingVector = util.angleToVector(this.angle);
        this.velocity.x += headingVector.x * ACCELERATION_ACCRETION * ratio;
        this.velocity.y += headingVector.y * ACCELERATION_ACCRETION * ratio;
      } else if (this.game.c.inputter.isDown(this.keys.backward)) {
        var headingVector = util.angleToVector(this.angle + 180);
        this.velocity.x += headingVector.x * ACCELERATION_ACCRETION * ratio;
        this.velocity.y += headingVector.y * ACCELERATION_ACCRETION * ratio;
      }

      this.move();

      // friction
      this.velocity = util.multiply(this.velocity, { x: 0.99, y: 0.99 });
    },

    wheels: function() {
      return [this.frontLeft, this.frontRight, this.backLeft, this.backRight];
    },

    lapsToGo: function() {
      return 3 - Math.floor((this.passes.length - 1) / 2);
    },

    label: function() {
      var lastPass = this.passes[this.passes.length - 1];
      if (lastPass !== undefined) {
        return lastPass.label;
      }
    },

    move: function() {
      this.wheels().concat(this).forEach(function(o) {
        o.center.x += this.velocity.x;
        o.center.y += this.velocity.y;
      }, this);
    },

    draw: function(ctx) {
      if (this.drawables !== undefined) {
        this.drawables.forEach(function(d) {
          util.fillRect(this.game.c.renderer.getCtx(), d, CAR_COLOR);
        }, this);
      }

      util.fillRect(ctx, this, "#000");
    },

    collision: function(other) {
      this.handleCollision(this, other);
    },

    handleCollision: function(carPiece, other) {
      if (other instanceof Wall) {
        var car = carPiece.car || carPiece;
        if (other.label === undefined || car.label() !== other.label) {
          var bounceRatio = 0.4;
          var otherNormal = util.bounceLineNormal(car, other);

          // this.game.c.entities.create(Line, {
          //   startPoint: util.cp(car.center),
          //   endPoint: util.add(car.center, util.multiply(otherNormal, { x: 100, y: 100 })),
          //   color: "#000"
          // });

          // this.game.c.entities.create(Line, {
          //   startPoint: util.cp(car.center),
          //   endPoint: util.add(car.center, util.multiply(car.velocity, { x: 100, y: 100 })),
          //   color: "#f00"
          // });

          function carInWall(car) {
            return [car].concat(car.wheels())
              .filter(function(p) {
                return this.game.c.collider.isIntersecting(p, other)
              }).length > 0
          };

          // get out of wall

          var oldVelocity = this.velocity;
          car.velocity = util.unitVector(otherNormal);
          var i = 0;
          while(carInWall(car)) {
            i++;
            car.move();
            if (i > 100) {
              break;
            }
          }

          car.velocity = oldVelocity;

          // bounce off wall

          var dot = util.dotProduct(car.velocity, otherNormal);
          car.velocity.x -= 2 * dot * otherNormal.x;
          car.velocity.y -= 2 * dot * otherNormal.y;

          car.velocity = util.multiply(car.velocity, { x: bounceRatio, y: bounceRatio });

          var i = 0;
          while (carInWall(car)) {
            i++;
            car.move();
            if (i > 100) {
              break;
            }
          }
        }
      }
    }
  };

  function Line(game, options) {
    this.startPoint = options.startPoint;
    this.endPoint = options.endPoint;
    this.color = options.color
  };

  Line.prototype = {
    draw: function(ctx) {
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.startPoint.x, this.startPoint.y);
      ctx.lineTo(this.endPoint.x, this.endPoint.y);
      ctx.stroke();
      ctx.closePath();
    }
  };

  function Rectangle(game, options) {
    this.game = game;
    this.zindex = 10;
    this.center = options.center;
    this.size = options.size;
    this.color = options.color
  };

  Rectangle.prototype = {
    draw: function(ctx) {
      util.fillRect(ctx, this, this.color);
    }
  };

  var util = {
    RADIANS_TO_DEGREES: 0.01745,
    DEGREES_TO_RADIANS: 57.30659026,

    cp: function(p) {
      return { x: p.x, y: p.y };
    },

    angleToVector: function(angle) {
      var r = angle * 0.01745;
      return this.unitVector({ x: Math.sin(r), y: -Math.cos(r) });
    },

    objToLinePoints: function(obj) {
      return [
        util.rotate({ x: obj.center.x, y: obj.center.y + obj.size.y / 2 },
                    obj.center,
                    obj.angle),
        util.rotate({ x: obj.center.x, y: obj.center.y - obj.size.y / 2 },
                    obj.center,
                    obj.angle)
      ]
    },

    vectorToAngle: function(v) {
      var unitVec = this.unitVector(v);
      var uncorrectedDeg = Math.atan2(unitVec.x, -unitVec.y) * this.DEGREES_TO_RADIANS;
      var angle = uncorrectedDeg;
      if(uncorrectedDeg < 0) {
        angle = 360 + uncorrectedDeg;
      }

      return angle;
    },

    magnitude: function(vector) {
      return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    },

    unitVector: function(vector) {
      return {
        x: vector.x / this.magnitude(vector),
        y: vector.y / this.magnitude(vector)
      };
    },

    rotateVectorTo: function(v, angle) {
      var magnitude = this.magnitude(v);
      var v = this.angleToVector(angle);
      return { x: v.x * magnitude, y: v.y * magnitude };
    },

    dotProduct: function(vector1, vector2) {
      return vector1.x * vector2.x + vector1.y * vector2.y;
    },

    rotate: function(point, pivot, angle) {
      angle *= this.RADIANS_TO_DEGREES;
      return {
        x: (point.x - pivot.x) * Math.cos(angle) -
          (point.y - pivot.y) * Math.sin(angle) +
          pivot.x,
        y: (point.x - pivot.x) * Math.sin(angle) +
          (point.y - pivot.y) * Math.cos(angle) +
          pivot.y
      };
    },

    leftNormal: function(vector) {
      return {
        x: -vector.y,
        y: vector.x
      };
    },

    bounceLineNormal: function(obj, line) {
      var objToClosestPointOnLineVector =
          util.vectorBetween(
            util.pointOnLineClosestToObj(obj, line),
            obj.center);

      // game.c.entities.create(Rectangle, {
      //   center: util.pointOnLineClosestToObj(obj, line),
      //   size: { x: 5, y: 5 },
      //   color: "#000"
      // });

      // Make the normal a unit vector and return it.
      return util.unitVector(objToClosestPointOnLineVector);
    },

    pointOnLineClosestToObj: function(obj, line) {
      var endPoints = util.objToLinePoints(line);
      var lineEndPoint1 = endPoints[0]
      var lineEndPoint2 = endPoints[1];

      // game.c.entities.create(Rectangle, {
      //   center: lineEndPoint1,
      //   size: { x: 5, y: 5 },
      //   color: "#f00"
      // });

      // game.c.entities.create(Rectangle, {
      //   center: lineEndPoint2,
      //   size: { x: 5, y: 5 },
      //   color: "#f00"
      // });

      var lineUnitVector = util.unitVector(util.angleToVector(line.angle));
      var lineEndToObjVector = util.vectorBetween(lineEndPoint1, obj.center);
      var projection = util.dotProduct(lineEndToObjVector, lineUnitVector);

      if (projection <= 0) {
        return lineEndPoint1;
      } else if (projection >= line.len) {
        return lineEndPoint2;
      } else {
        return {
          x: lineEndPoint1.x + lineUnitVector.x * projection,
          y: lineEndPoint1.y + lineUnitVector.y * projection
        };
      }
    },

    vectorBetween: function(startPoint, endPoint) {
      return {
        x: endPoint.x - startPoint.x,
        y: endPoint.y - startPoint.y
      };
    },

    add: function(v1, v2) {
      return { x: v1.x + v2.x, y: v1.y + v2.y };
    },

    multiply: function(v1, v2) {
      return { x: v1.x * v2.x, y: v1.y * v2.y };
    },

    fillRect: function(ctx, obj, color) {
      ctx.fillStyle = color;
      ctx.fillRect(obj.center.x - obj.size.x / 2,
                   obj.center.y - obj.size.y / 2,
                   obj.size.x,
                   obj.size.y);
    },

    fillCircle: function(ctx, obj, color) {
      ctx.beginPath();
      ctx.arc(obj.center.x, obj.center.y, obj.size.x / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
  };

  function formatTime(millis) {
    if (millis !== undefined) {
      return (millis / 1000).toString();
    } else {
      return "";
    }
  };

  exports.Game = Game;
})(this);
