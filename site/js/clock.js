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

var ClockHand = (function()
{
  /**
   * ClockHand constructor
   * 
   * @param {type} length The length of the hand relative to the radius of the clock (0 - 1)
   * @param {type} width The width of the hand relative to the radius of the clock (0 - 1)
   * @param {type} colour The CSS colour of the hand (optional)
   * @returns {clock_L16.ClockHand}
   */
  function ClockHand(length, width, colour)
  {
    this.length = length;
    this.width = width;
    if (colour)
    {
      this.colour = colour;
    }
  }
  
  /**
   * Whether or not the hand should be shown.
   */
  ClockHand.prototype.show = true;

  /**
   * Draw the hand on a clock on the given context.
   * <p>
   * It is assumed that the context will already have been translated to the center of the clock and has not been
   * rotated.
   * 
   * @param {type} clock The clock on which the hand is to be drawn.
   * @param {type} context2d The context with which the hand should be drawn
   * @param {type} angle The angle (in radians) at which the hand should be drawn
  */
  ClockHand.prototype.draw = function(clock, context2d, angle)
  {
    if (!this.show)
    {
      return;
    }
    
    var oldColour = context2d.strokeStyle;
    if (this.colour)
    {
      context2d.strokeStyle = this.colour;
    }
    context2d.rotate(angle);
    var oldWidth = context2d.lineWidth;
    context2d.lineWidth = Math.ceil(clock.radius * this.width);
    context2d.beginPath();
    context2d.moveTo(0, Math.ceil(clock.radius * this.width));
    context2d.lineTo(0, -1 * Math.ceil(clock.radius * this.length));
    context2d.stroke();

    if (clock.extendHands)
    {
      context2d.lineWidth = 1;
      var oldDash = context2d.getLineDash();
      context2d.setLineDash([2, 2]);
      context2d.beginPath();
      context2d.moveTo(0, -1 * Math.ceil(clock.radius * this.length));
      context2d.lineTo(0, -1 * clock.radius);
      context2d.stroke();
      context2d.setLineDash(oldDash);
    }
    
    context2d.lineWidth = oldWidth;
    context2d.rotate(-1.0 * angle);
    context2d.strokeStyle = oldColour;
  }
  
  // Return the constructor for this type.
  return ClockHand;
})();

var DigitalClock = (function()
{
  function DigitalClock(centerX, centerY, height)
  {
    this.centerX = centerX;
    this.centerY = centerY;
    if (height)
    {
      this.height = height;
    }
  }
  
  DigitalClock.prototype.height = 5;
  
  DigitalClock.prototype.ampm = true;
  DigitalClock.prototype.divider = ":";
  
  DigitalClock.prototype.hoursColour = null;
  DigitalClock.prototype.minutesColour = null;
  DigitalClock.prototype.secondsColour = null;
  DigitalClock.prototype.dividerColour = null;
  DigitalClock.prototype.ampmColour = null;
  
  DigitalClock.prototype.showSeconds = true;
  
  function padField(value)
  {
    var string = value.toString();
    while (string.length < 2)
    {
      string = "0" + string;
    }
    return string;
  }

  // Drawing
  DigitalClock.prototype.draw = function(context2d, frameTime)
  {
    context2d.translate(this.centerX, this.centerY);
    var oldFont = context2d.font;
    context2d.font = Math.ceil(this.height.toString()).toString() +
            "px monospace";
    var oldBaseline = context2d.textBaseline;
    context2d.textBaseline = "middle";
    var oldFillStyle = context2d.fillStyle;
    
    var hoursVal = frameTime.getHours();
    if (this.ampm)
    {
      hoursVal %= 12;
      if (hoursVal === 0)
      {
        hoursVal = 12;
      }
    }
    var hours = padField(hoursVal);
    var minutes = padField(frameTime.getMinutes());
    var seconds = "";
    if (this.showSeconds)
    {
      seconds = padField(frameTime.getSeconds());
    }
    var ampm = "";
    if (this.ampm)
    {
      if (frameTime.getHours() < 12)
      {
        ampm = " AM";
      }
      else
      {
        ampm = " PM";
      }
    }
    
    var dividerMetrics = context2d.measureText(this.divider);
    var hoursMetrics = context2d.measureText(hours);
    var minutesMetrics = context2d.measureText(minutes);
    var secondsMetrics = context2d.measureText(seconds);
    var ampmMetrics = context2d.measureText(ampm);
    
    var dividerCount = 1;
    if (this.showSeconds)
    {
      dividerCount = 2;
    }
    
    var totalWidth = dividerMetrics.width * dividerCount +
                     hoursMetrics.width +
                     minutesMetrics.width +
                     secondsMetrics.width +
                     ampmMetrics.width;
    var xLeft = -1 * (totalWidth / 2);
                 
    context2d.fillStyle = (this.hoursColour)?this.hoursColour:oldFillStyle;
    context2d.fillText(hours, xLeft, 0);
    xLeft += hoursMetrics.width;
    
    context2d.fillStyle = (this.dividerColour)?this.dividerColour:oldFillStyle;
    context2d.fillText(this.divider, xLeft, 0);
    xLeft += dividerMetrics.width;
    
    context2d.fillStyle = (this.minutesColour)?this.minutesColour:oldFillStyle;
    context2d.fillText(minutes, xLeft, 0);
    xLeft += minutesMetrics.width;
    
    if (this.showSeconds)
    {
      context2d.fillStyle = (this.dividerColour)?this.dividerColour:oldFillStyle;
      context2d.fillText(this.divider, xLeft, 0);
      xLeft += dividerMetrics.width;

      context2d.fillStyle = (this.secondsColour)?this.secondsColour:oldFillStyle;
      context2d.fillText(seconds, xLeft, 0);
      xLeft += secondsMetrics.width;
    }
    
    context2d.fillStyle = (this.ampmColour)?this.ampmColour:oldFillStyle;
    context2d.fillText(ampm, xLeft, 0);
    
    context2d.fillStyle = oldFillStyle;
    context2d.textBaseline = oldBaseline;
    context2d.font = oldFont;
    context2d.translate(-1 * this.centerX, -1 * this.centerY);
  }
  
  return DigitalClock;
})();

var Clock = (function()
{
  // Clock Constructor
  function ClockDefinition(centerX,
                            centerY,
                            radius)
  {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    
    this.digitalClock = new DigitalClock(0, 0.5 * this.radius, 0.1 * this.radius);
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
  
  ClockDefinition.prototype.hourHand = new ClockHand(0.4, 0.025, "black");
  ClockDefinition.prototype.minuteHand = new ClockHand(0.8, 0.02, "black");
  ClockDefinition.prototype.secondHand = new ClockHand(0.7, 0.005, "maroon");

  ClockDefinition.prototype.lineWidth = 2;

  ClockDefinition.prototype.setShowHands = function(hourHand, minuteHand, secondHand)
  {
    this.hourHand.show = hourHand;
    this.minuteHand.show = minuteHand;
    this.secondHand.show = secondHand;
    this.digitalClock.showSeconds = secondHand;
  }

  ClockDefinition.prototype.faceColour = "skyblue";
  ClockDefinition.prototype.rimColour = "black";

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
      this.hourHand.colour = hourHand;
    }
    if (minuteHand)
    {
      this.minuteHand.colour = minuteHand;
    }
    if (secondHand)
    {
      this.secondHand.colour = secondHand;
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

  
  ClockDefinition.prototype.showDigital = true;

  // Drawing
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
              clock.hourHand.show && 
              i === (frameTime.getHours() % 12));
      // Is this number the one that the hand will reach next
      var handNumberNext = (
              clock.showHandNumbers && 
              clock.hourHand.show && 
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
      var handNumber = (clock.showHandNumbers && clock.minuteHand.show && i === frameTime.getMinutes()) ||
                       (clock.showHandNumbers && clock.secondHand.show && i === frameTime.getSeconds());
      var nextNumber = clock.showHandNumbers && 
                       clock.minuteHand.show && 
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

  function drawHourHand(clock, context2d, frameTime)
  {
    var millisThisDay = frameTime.getHours() * MS_IN_H + frameTime.getMinutes() * MS_IN_M + frameTime.getSeconds() * MS_IN_S;
    clock.hourHand.draw(clock, context2d, (2.0 * Math.PI) * (millisThisDay / MS_IN_D) * 2.0);
  }

  function drawMinuteHand(clock, context2d, frameTime)
  {
    var millisThisHour = frameTime.getMinutes() * MS_IN_M + frameTime.getSeconds() * MS_IN_S;
    clock.minuteHand.draw(clock, context2d, (2.0 * Math.PI) * (millisThisHour / MS_IN_H));
  }

  function drawSecondHand(clock, context2d, frameTime)
  {
    clock.secondHand.draw(clock, context2d, (2.0 * Math.PI) * (frameTime.getSeconds() / S_IN_M));
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
    if (this.hourHand.show)
    {
      drawHourHand(this, context2d, frameTime);
    }
    if (this.minuteHand.show)
    {
      drawMinuteHand(this, context2d, frameTime);
    }
    if (this.secondHand.show)
    {
      drawSecondHand(this, context2d, frameTime);
    }
    
    if (this.showDigital)
    {
      this.digitalClock.draw(context2d, frameTime);
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
