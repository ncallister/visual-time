'use strict';

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D

var DEFAULT_REFRESH_INTERVAL = 1000;  // 1 second
var DEFAULT_AUTO_DRAW = true;

var MS_IN_S = 1000.0;
var S_IN_M = 60.0;
var M_IN_H = 60.0;
var H_IN_D = 24;
var MS_IN_M = MS_IN_S * S_IN_M;
var MS_IN_H = MS_IN_M * M_IN_H;
var MS_IN_D = MS_IN_H * H_IN_D;

var Clock = (function()
{
  function ClockDefinition(centerX,
                            centerY,
                            radius)
  {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
  };

  ClockDefinition.prototype.refreshInterval = DEFAULT_REFRESH_INTERVAL;
  ClockDefinition.prototype.autoDraw = DEFAULT_AUTO_DRAW;

  ClockDefinition.prototype.setDrawBehaviour = function(refreshInterval, autoDraw)
  {
    this.refreshInterval = refreshInterval;
    this.autoDraw = autoDraw;
  }

  ClockDefinition.prototype.bigTickSize = 0.07;
  ClockDefinition.prototype.smallTickSize = 0.02;
  
  ClockDefinition.prototype.hourSize = 0.4;
  ClockDefinition.prototype.minuteSize = 0.8;
  ClockDefinition.prototype.secondSize = 0.7;

  ClockDefinition.prototype.lineWidth = 2;
  ClockDefinition.prototype.hourWidth = 0.025;
  ClockDefinition.prototype.minuteWidth = 0.02;
  ClockDefinition.prototype.secondWidth = 0.005;

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
    if (face)
    {
      this.faceColour = face;
    }
    if (rim)
    {
      this.rimColour = rim;
    }
    if (hourHand)
    {
      this.hourHandColour = hourHand;
    }
    if (minuteHand)
    {
      this.minuteHandColour = minuteHand;
    }
    if (secondHand)
    {
      this.secondHandColour = secondHand;
    }
  }
  
  ClockDefinition.prototype.extendHands = true;
  ClockDefinition.prototype.showHandNumbers = true;

  ClockDefinition.prototype.hourNumbersRadius = 1.06;
  ClockDefinition.prototype.hourNumbersFontSize = 0.08;
  ClockDefinition.prototype.hourNumbersColour = "black";

  ClockDefinition.prototype.minuteNumbersRadius = 0.85
  ClockDefinition.prototype.minuteNumbersFontSize = 0.05;
  ClockDefinition.prototype.minuteNumbersColour = "black";

  ClockDefinition.prototype.setHandNumbers = function(extendHands, showHandNumbers)
  {
    this.extendHands = extendHands;
    this.showHandNumbers = showHandNumbers;
  }

  ClockDefinition.prototype.showHourNumbers = true;
  ClockDefinition.prototype.showMinuteNumbersBig = true;
  ClockDefinition.prototype.showMinuteNumbersSmall = false;

  ClockDefinition.prototype.setShowNumbers = function(hours, minutesBig, minutesSmall)
  {
    this.showHourNumbers = hours;
    this.showMinuteNumbersBig = minutesBig;
    this.showMinuteNumbersSmall = minutesSmall;
  }

  
  ClockDefinition.prototype.showDigital = false;
  ClockDefinition.prototype.digitalCenterX = 0;
  ClockDefinition.prototype.digitalCenterY = 0.3;
  ClockDefinition.prototype.digitalHeight = 0.1;

  // Drawing
  function drawDigital(clock, context2d)
  {
    context2d.translate(clock.digitalCenterX, clock.digitalCenterY);
    var oldFont = context2d.font;
    context2d.font = Math.ceil(clock.digitalHeight.toString() * clock.radius).toString() +
            "px sans-serif";
    
    var separatorMetrics = context2d.measureText(":");
    var hours = "";
    var minutes = "";
    var seconds = "";
    if (clock.showHourHand)
    {
      // hours = 
      // TODO
    }
    
    context2d.font = oldFont;
    context2d.translate(-1 * clock.digitalCenterX, -1 * clock.digitalCenterY);
  }

  function drawNumber(clock, context2d, number, angle, relativeNumberRadius, relativeFontSize, fontStyle, colour)
  {
    var oldColour = context2d.strokeStyle;
    context2d.fillStyle = colour;
    context2d.rotate(angle);
    context2d.translate(0, -1 * Math.ceil(relativeNumberRadius * clock.radius));
    context2d.rotate(-1 * angle);
    var fontSize = Math.ceil(relativeFontSize * clock.radius);
    var oldFont = context2d.font;
    if (fontStyle)
    {
      context2d.font = fontStyle + " " + fontSize.toString() + "px sans-serif";
    }
    else
    {
      context2d.font = fontSize.toString() + "px sans-serif";
    }

    var numString = number.toString();
    var metrix = context2d.measureText(numString);

    context2d.fillText(numString, -0.5 * metrix.width, 0.5 * fontSize);

    context2d.font = oldFont;
    context2d.rotate(angle);
    context2d.translate(0, Math.ceil(relativeNumberRadius * clock.radius));
    context2d.rotate(-1.0 * angle);
    context2d.strokeStyle = oldColour;
  }

  function drawNumbers(clock, context2d, frameTime)
  {
    for (var i = 1 ; i <= 12 ; ++i)
    {
      // Is this number the one the hand is currently just passed
      var handNumber = (
              clock.showHandNumbers && 
              clock.showHourHand && 
              i === (frameTime.getHours() % 12));
      // Is this number the one that the hand will reach next
      var handNumberNext = (
              clock.showHandNumbers && 
              clock.showHourHand && 
              i === ((frameTime.getHours() + 1) % 12));
      var style = null;
      if (handNumber)
      {
        // Bold the "current" reading number
        style = "900";
      }
      if (clock.showHourNumbers || handNumber || handNumberNext)
      {
        drawNumber(clock, 
                   context2d, 
                   i, 
                   (2 * Math.PI) * (i / 12), 
                   clock.hourNumbersRadius, 
                   clock.hourNumbersFontSize, 
                   style,
                   clock.hourNumbersColour);
      }
    }

    for (var i = 0 ; i < 60 ; ++i)
    {
      var handNumber = (clock.showHandNumbers && clock.showMinuteHand && i === frameTime.getMinutes()) ||
                       (clock.showHandNumbers && clock.showSecondHand && i === frameTime.getSeconds());
      var nextNumber = clock.showHandNumbers && 
                       clock.showMinuteHand && 
                       i === ((frameTime.getMinutes() + 1) % 60);
      var style = null;
      if (handNumber)
      {
        style = "900";
      }
      if ((i % 5 === 0 && clock.showMinuteNumbersBig) ||
          (i % 5 !== 0 && clock.showMinuteNumbersSmall) ||
          handNumber || nextNumber)
      {
        drawNumber(clock, 
                   context2d, 
                   i, 
                   (2 * Math.PI) * (i / 60), 
                   clock.minuteNumbersRadius, 
                   clock.minuteNumbersFontSize, 
                   style,
                   clock.minuteNumbersColour);
      }
    }
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

    if (clock.extendHands)
    {
      context2d.lineWidth = 1;
      var oldDash = context2d.getLineDash();
      context2d.setLineDash([2, 2]);
      context2d.beginPath();
      context2d.moveTo(0, -1 * Math.ceil(length));
      context2d.lineTo(0, -1 * clock.radius);
      context2d.stroke();
      context2d.setLineDash(oldDash);
    }
    
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
    clock.drawTimerId = setTimeout(
        function()
        {
          clock.draw(context2d, nextFrame);
        },
        nextFrame.getTime() - now.getTime());
  }

  ClockDefinition.prototype.draw = function(context2d, frameTime)
  {
    if (this.drawTimerId)
    {
      clearTimeout(this.drawTimerId);
      this.drawTimerId = null;
    }
    context2d.save();
    context2d.lineWidth = this.lineWidth;
    context2d.translate(this.centerX, this.centerY);
    var buffer = this.radius * 0.5;
    context2d.clearRect(-1 * this.radius - buffer,
                        -1 * this.radius - buffer,
                        2 * this.radius + 2 * buffer,
                        2 * this.radius + 2 * buffer);
    drawCircle(this, context2d);
    drawTicks(this, context2d);
    drawNumbers(this, context2d, frameTime);
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
