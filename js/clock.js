'use strict';

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D

const DEFAULT_INCLUDE_DIGITAL = false;
const DEFAULT_REFRESH_INTERVAL = 1000;  // 1 second
const DEFAULT_AUTO_DRAW = true;

const DEFAULT_BIG_TICK_SIZE = 0.1;
const DEFAULT_SMALL_TICK_SIZE = 0.02;
const DEFAULT_HOUR_SIZE = 0.3;
const DEFAULT_MINUTE_SIZE = 0.5;
const DEFAULT_SECOND_SIZE = 0.8;

const MS_IN_S = 1000.0;
const S_IN_M = 60.0;
const M_IN_H = 60.0;
const H_IN_D = 24;
const MS_IN_M = MS_IN_S * S_IN_M;
const MS_IN_H = MS_IN_M * M_IN_H;
const MS_IN_D = MS_IN_H * H_IN_D;

var Clock = (function()
{
  function ClockDefinition(centerX,
                            centerY,
                            radius,
                            includeDigital = DEFAULT_INCLUDE_DIGITAL)
  {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.includeDigital = includeDigital;
  };

  ClockDefinition.prototype.refreshInterval = DEFAULT_REFRESH_INTERVAL;
  ClockDefinition.prototype.autoDraw = DEFAULT_AUTO_DRAW;

  ClockDefinition.prototype.setDrawBehaviour = function(refreshInterval, autoDraw)
  {
    this.refreshInterval = refreshInterval;
    this.autoDraw = autoDraw;
  }

  ClockDefinition.prototype.bigTickSize = DEFAULT_BIG_TICK_SIZE;
  ClockDefinition.prototype.smallTickSize = DEFAULT_SMALL_TICK_SIZE;
  ClockDefinition.prototype.hourSize = DEFAULT_HOUR_SIZE;
  ClockDefinition.prototype.minuteSize = DEFAULT_MINUTE_SIZE;
  ClockDefinition.prototype.secondSize = DEFAULT_SECOND_SIZE;

  ClockDefinition.prototype.lineWidth = 2;
  ClockDefinition.prototype.hourWidth = 0.02;
  ClockDefinition.prototype.minuteWidth = 0.015;
  ClockDefinition.prototype.secondWidth = 0.01;

  ClockDefinition.prototype.showHourHand = true;
  ClockDefinition.prototype.showMinuteHand = true;
  ClockDefinition.prototype.showSecondHand = true;

  ClockDefinition.prototype.setShowHands = function(hourHand, minuteHand, secondHand)
  {
    this.showSecondHand = secondHand;
    this.showMinuteHand = minuteHand;
    this.showHourHand = hourHand;
  }

  ClockDefinition.prototype.faceColour = "skyblue";
  ClockDefinition.prototype.rimColour = "black";
  ClockDefinition.prototype.hourHandColour = "black";
  ClockDefinition.prototype.minuteHandColour = "black";
  ClockDefinition.prototype.secondHandColour = "maroon";

  ClockDefinition.prototype.setColourPallete = function(face, rim, hourHand, minuteHand, secondHand)
  {
    this.faceColour = face;
    this.rimColour = rim;
    this.hourHandColour = hourHand;
    this.minuteHandColour = minuteHand;
    this.secondHandColour = secondHand;
  }

  function drawCircle(clock, context2d)
  {
    var oldColour = context2d.strokeStyle;
    context2d.strokeStyle = clock.rimColour;
    var oldFill = context2d.fillStyle;
    context2d.fillStyle = clock.faceColour;
    context2d.beginPath();
    context2d.arc(0, 0, clock.radius, 0, 2 * Math.PI);
    context2d.fill();
    context2d.stroke();
    context2d.strokeStyle = oldColour;
    context2d.fillStyle = oldFill;
  }

  function drawTick(clock, context2d, angle, tickSize)
  {
    var oldColour = context2d.strokeStyle;
    context2d.strokeStyle = clock.rimColour;
    context2d.rotate(angle);
    context2d.beginPath();
    context2d.moveTo(0, 0 - clock.radius + Math.ceil(tickSize));
    context2d.lineTo(0, 0 - clock.radius);
    context2d.stroke();
    context2d.rotate(-1.0 * angle);
    context2d.strokeStyle = oldColour;
  }

  function drawTicks(clock, context2d)
  {
    var totalTicks = 12 * 5;
    for (var i = 0.0 ; i < totalTicks ; ++i)
    {
      var tickSize = clock.smallTickSize;
      if (i % 5 === 0)
      {
        tickSize = clock.bigTickSize;
      }
      drawTick(clock, context2d, i * ((2.0 * Math.PI) / totalTicks), clock.radius * tickSize);
    }
  }

  function drawHand(clock, context2d, angle, length, width, colour)
  {
    var oldColour = context2d.strokeStyle;
    if (colour)
    {
      context2d.strokeStyle = colour;
    }
    context2d.rotate(angle);
    var oldWidth = context2d.lineWidth;
    context2d.lineWidth = Math.ceil(width);
    context2d.beginPath();
    context2d.moveTo(0, Math.ceil(width));
    context2d.lineTo(0, -1 * Math.ceil(length));
    context2d.stroke();
    context2d.lineWidth = oldWidth;
    context2d.rotate(-1.0 * angle);
    context2d.strokeStyle = oldColour;
  }

  function drawHourHand(clock, context2d, frameTime)
  {
    var millisThisDay = frameTime.getHours() * MS_IN_H + frameTime.getMinutes() * MS_IN_M + frameTime.getSeconds() * MS_IN_S;
    drawHand(clock,
             context2d,
             (2.0 * Math.PI) * (millisThisDay / MS_IN_D) * 2.0,
             clock.radius * clock.hourSize,
             clock.radius * clock.hourWidth,
             clock.hourHandColour);
  }

  function drawMinuteHand(clock, context2d, frameTime)
  {
    var millisThisHour = frameTime.getMinutes() * MS_IN_M + frameTime.getSeconds() * MS_IN_S;
    drawHand(clock, 
             context2d,
             (2.0 * Math.PI) * (millisThisHour / MS_IN_H),
             clock.radius * clock.minuteSize,
             clock.radius * clock.minuteWidth,
             clock.minuteHandColour);
  }

  function drawSecondHand(clock, context2d, frameTime)
  {
    drawHand(clock, 
             context2d,
             (2.0 * Math.PI) * (frameTime.getSeconds() / S_IN_M),
             clock.radius * clock.secondSize,
             clock.radius * clock.secondWidth,
             clock.secondHandColour);
  }

  function rescheduleDraw(clock, context2d, frameTime)
  {
    var now = new Date();
    var nextFrameTime = frameTime.getTime() + clock.refreshInterval;
    while (nextFrameTime < now.getTime())
    {
      nextFrameTime += clock.refreshInterval;
    }
    var nextFrame = new Date(nextFrameTime);
    setTimeout(
        function()
        {
          clock.draw(context2d, nextFrame);
        },
        nextFrame.getTime() - now.getTime());
  }

  ClockDefinition.prototype.draw = function(context2d, frameTime)
  {
    context2d.save();
    context2d.lineWidth = this.lineWidth;
    context2d.translate(this.centerX, this.centerY);
    context2d.clearRect(-1 * this.radius - this.lineWidth,
                        -1 * this.radius - this.lineWidth,
                        2 * this.radius + 2 * this.lineWidth,
                        2 * this.radius + 2 * this.lineWidth);
    drawCircle(this, context2d);
    drawTicks(this, context2d);
    if (this.showHourHand)
    {
      drawHourHand(this, context2d, frameTime);
    }
    if (this.showMinuteHand)
    {
      drawMinuteHand(this, context2d, frameTime);
    }
    if (this.showSecondHand)
    {
      drawSecondHand(this, context2d, frameTime);
    }
    context2d.restore();
    if (this.autoDraw)
    {
      rescheduleDraw(this, context2d, frameTime);
    }
  }

  return ClockDefinition;
})();

function startClock(canvasId)
{
  var canvas = document.getElementById(canvasId);
  if (canvas.getContext)
  {
    var ctx = canvas.getContext('2d');
    var clock = new Clock(canvas.width / 2,
                     canvas.height / 2,
                     Math.min(canvas.width, canvas.height) * 0.45);
    clock.draw(ctx, new Date());
    return clock;
  }
  throw new Error("Could not render to specified element");
}
