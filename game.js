;(function(exports) {
  var TRACK_COLOR = "#fff";
  var WALL_COLOR = "#000";
  var CAR_COLOR = "#000";
  var BACKGROUND_COLOR = "#fff";

  function Game() {
    this.size = { x: 1000, y: 500 };
    this.c = new Coquette(this, "screen", this.size.x, this.size.y, BACKGROUND_COLOR);

    var start = { x: this.size.x * 0.95, y: this.size.y / 2 };

    // cars

    this.c.entities.create(Car, {
      center: { x: start.x, y: start.y },
      keys: { left: this.c.inputter.F, right: this.c.inputter.G,
              forward: this.c.inputter.J, backward: this.c.inputter.K }
    });

    this.c.entities.create(Car, {
      center: { x: start.x + 20, y: start.y },
      keys: { left: this.c.inputter.LEFT_ARROW, right: this.c.inputter.RIGHT_ARROW,
              forward: this.c.inputter.UP_ARROW, backward: this.c.inputter.DOWN_ARROW }
    });

    // track

    this.c.entities.create(RectangleTrackPiece, { // top
      center: { x: 500, y: 50 }, size: { x: 1000, y: 100 }
    });

    this.c.entities.create(RectangleTrackPiece, { // right
      center: { x: 950, y: 250 }, size: { x: 100, y: 500 }
    });

    this.c.entities.create(RectangleTrackPiece, { // bottom
      center: { x: 500, y: 450 }, size: { x: 1000, y: 100 }
    });

    this.c.entities.create(RectangleTrackPiece, { // left
      center: { x: 50, y: 250 }, size: { x: 100, y: 500 }
    });

    // walls

    this.c.entities.create(Wall, { // top outer
      center: { x: 500, y: 5 }, size: { x: 10, y: 1000 }, angle: 90
    });

    this.c.entities.create(Wall, { // top inner
      center: { x: 500, y: 100 }, size: { x: 10, y: 800 }, angle: 90
    });

    // this.c.entities.create(Wall, { // top right outer
    //   center: { x: 950, y: 50 }, size: { x: 10, y: 200 }, angle: 135
    // });

    // this.c.entities.create(Wall, { // top right inner
    //   center: { x: 850, y: 150 }, size: { x: 10, y: 146 }, angle: 135
    // });

    this.c.entities.create(Wall, { // right inner
      center: { x: 900, y: 250 }, size: { x: 10, y: 300 }, angle: 180
    });

    this.c.entities.create(Wall, { // right outer
      center: { x: 995, y: 250 }, size: { x: 10, y: 500 }, angle: 180
    });

    // this.c.entities.create(Wall, { // bottom right outer
    //   center: { x: 950, y: 450 }, size: { x: 10, y: 146 }, angle: 225
    // });

    // this.c.entities.create(Wall, { // bottom right inner
    //   center: { x: 850, y: 350 }, size: { x: 10, y: 146 }, angle: 225
    // });

    this.c.entities.create(Wall, { // bottom inner
      center: { x: 500, y: 400 }, size: { x: 10, y: 800 }, angle: 270
    });

    this.c.entities.create(Wall, { // bottom outer
      center: { x: 500, y: 495 }, size: { x: 10, y: 1000 }, angle: 90
    });

    // this.c.entities.create(Wall, { // bottom left outer
    //   center: { x: 50, y: 450 }, size: { x: 10, y: 146 }, angle: 315
    // });

    // this.c.entities.create(Wall, { // bottom left inner
    //   center: { x: 150, y: 350 }, size: { x: 10, y: 146 }, angle: 315
    // });

    this.c.entities.create(Wall, { // left outer
      center: { x: 5, y: 250 }, size: { x: 10, y: 500 }, angle: 180
    });

    this.c.entities.create(Wall, { // left inner
      center: { x: 100, y: 250 }, size: { x: 10, y: 300 }, angle: 180
    });

    // this.c.entities.create(Wall, { // top left outer
    //   center: { x: 50, y: 50 }, size: { x: 10, y: 146 }, angle: 45
    // });

    // this.c.entities.create(Wall, { // top left inner
    //   center: { x: 150, y: 150 }, size: { x: 10, y: 146 }, angle: 45
    // });
  };

  function Wall(game, options) {
    this.game = game;
    this.zindex = 0;
    this.center = options.center;
    this.size = options.size;

    if (options.angle === undefined) {
      throw "need angle";
    }
    this.angle = options.angle;
  };

  Wall.prototype = {
    draw: function(ctx) {
      util.fillRect(ctx, this, WALL_COLOR);
    }
  };

  function RectangleTrackPiece(game, options) {
    this.game = game;
    this.zindex = -1;
    this.center = options.center;
    this.size = options.size;
    this.angle = 0;
  };

  RectangleTrackPiece.prototype = {
    draw: function(ctx) {
      util.fillRect(ctx, this, TRACK_COLOR);
    }
  };

  function FrontWheel(game, options) {
    this.game = game;
    this.zindex = 1;
    this.car = options.car;
    this.center = options.center;
    this.size = { x: 4, y: 8 };
    this.angle = 0;
    this.wheelAngle = 0;
  };

  FrontWheel.prototype = {
    turnRate: 0,
    update: function(delta) {
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
      util.fillRect(ctx, this, CAR_COLOR);
    },

    collision: function(other) {
      this.car.handleCollision(this, other);
    }
  };

  function BackWheel(game, options) {
    this.game = game;
    this.zindex = 1;
    this.car = options.car;
    this.center = options.center;
    this.size = { x: 4, y: 8 };
    this.angle = 0;
  };

  BackWheel.prototype = {
    draw: function(ctx) {
      util.fillRect(ctx, this, CAR_COLOR);
    },

    collision: function(other) {
      this.car.handleCollision(this, other);
    }
  };

  function Car(game, options) {
    this.game = game;
    this.zindex = 1;
    this.center = options.center;
    this.keys = options.keys;
    this.size = { x: 10, y: 24 };
    this.angle = 0;
    this.velocity = { x: 0, y: 0 };

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

      util.fillRect(ctx, this, CAR_COLOR);
    },

    collision: function(other) {
      this.handleCollision(this, other);
    },

    handleCollision: function(carPiece, other) {
      if (other instanceof Wall) {
        var car = carPiece.car || carPiece;

        var bounceRatio = 0.4;
        var otherNormal = util.bounceLineNormal(car, other);
        var dot = util.dotProduct(car.velocity, otherNormal);
        car.velocity.x -= 2 * dot * otherNormal.x;
        car.velocity.y -= 2 * dot * otherNormal.y;

        car.velocity = util.multiply(car.velocity, { x: bounceRatio, y: bounceRatio });

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

        var i = 0;
        var carPieces = [car].concat(car.wheels());
        while (carPieces
               .filter(function(p) {
                 return this.game.c.collider.isIntersecting(p, other) }).length > 0) {
          i++;
          car.move();
          if (i > 100) {
            car.move(); car.move();
            break;
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

      // Make the normal a unit vector and return it.
      return util.unitVector(objToClosestPointOnLineVector);
    },

    pointOnLineClosestToObj: function(obj, line) {
      var lineEndPoint1 = util.rotate({ x: line.center.x, y: line.center.y + line.size.y / 2 },
                                      line.center,
                                      line.angle);
      var lineEndPoint2 = util.rotate({ x: line.center.x, y: line.center.y - line.size.y / 2 },
                                      line.center,
                                      line.angle);

      // game.c.entities.create(Rectangle, {
      //   center: lineEndPoint1,
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

  exports.Game = Game;
})(this);
