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


if (!CanvasRenderingContext2D.prototype.pathRoundRect)
{
  CanvasRenderingContext2D.prototype.pathRoundRect = function(x, y, width, height, radius)
  {
    if (width < radius * 2)
    {
      throw new Error("Cannot render round rect with width: " + width + " radius: " + radius + " too narrow");
    }
    
    if (height < radius * 2)
    {
      throw new Error("Cannot render round rect with height: " + height + " radius: " + radius + " too short");
    }
    
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y)
    this.arc(x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
    this.lineTo(x + width, y + height - radius);
    this.arc(x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI);
    this.lineTo(x + radius, y + height);
    this.arc(x + radius, y + height - radius, radius, 0.5 * Math.PI, Math.PI);
    this.lineTo(x, y + radius);
    this.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
  }
}



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
    
    var oldStroke = context2d.strokeStyle;
    var oldFill = context2d.fillStyle;
    try
    {
      if (this.colour)
      {
        context2d.strokeStyle = this.colour;
        context2d.fillStyle = this.colour;
      }
    }
    catch (e)
    {
      console.log(e.toString());
    }
    context2d.rotate(angle);
    
    var scaledWidth = Math.ceil(clock.radius * this.width);
    var scaledLength = Math.ceil(clock.radius * this.length);
    
    context2d.beginPath();
    
    context2d.pathRoundRect(-1 * scaledWidth / 2, 
        -1 * scaledLength,
        scaledWidth,
        scaledLength + (scaledWidth / 2),
        scaledWidth / 3);
    
    context2d.fill();

    // TODO: Move to ClockHand.prototype.extend
    if (clock.extendHands)
    {
      context2d.lineWidth = 1;
      var oldDash = context2d.getLineDash();
      context2d.setLineDash([2, 5]);
      context2d.beginPath();
      context2d.moveTo(0, -1 * Math.ceil(clock.radius * this.length));
      context2d.lineTo(0, -1 * clock.radius);
      context2d.stroke();
      context2d.setLineDash(oldDash);
    }
    
    context2d.rotate(-1.0 * angle);
    context2d.strokeStyle = oldStroke;
    context2d.fillStyle = oldFill;
  }
  
  ClockHand.prototype.timerAlpha = 0.4;
  
  ClockHand.prototype.drawTimerArc = function(clock, context2d, currentAngle, endAngle)
  {
    if (endAngle < currentAngle)
    {
      endAngle += 2 * Math.PI;
    }
    
    var oldFillStyle = context2d.fillStyle;
    if (this.colour)
    {
      context2d.fillStyle = this.colour;
    }
    var oldAlpha = context2d.globalAlpha;
    context2d.globalAlpha = this.timerAlpha;
    context2d.rotate(currentAngle);
    
    context2d.beginPath();
    context2d.moveTo(0, 0);
    context2d.lineTo(0, -1 * Math.ceil(this.length * clock.radius));
    context2d.rotate(-0.5 * Math.PI);
    context2d.arc(0, 0, Math.ceil(this.length * clock.radius), 0, endAngle - currentAngle);
    context2d.rotate(0.5 * Math.PI);
    context2d.fill();
    
    context2d.rotate(-1 * currentAngle);
    
    this.draw(clock, context2d, endAngle);
    
    context2d.globalAlpha = oldAlpha;
    context2d.fillStyle = oldFillStyle;
  }
  
  // Return the constructor for this type.
  return ClockHand;
})();



/**
 * Digital Clock
 * 
 * @type DigitalClock
 */
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
  
  DigitalClock.prototype.backgroundColour = "white";
  DigitalClock.prototype.backgroundAlpha = 0.3;
  DigitalClock.prototype.backgroundPadding =
  {
    top: 0.5,     // Factor of font height
    bottom: 0.5,  // Factor of font height
    left: 1,      // Em
    right: 1      // Em
  };
  DigitalClock.prototype.backgroundHeight = 1.2;
  DigitalClock.prototype.backgroundWidth = 1.2;   // em
  
  function padField(value)
  {
    var string = value.toString();
    while (string.length < 2)
    {
      string = "0" + string;
    }
    return string;
  }
  
  DigitalClock.prototype.timeToString = function(frameTime)
  {
    var timeString = "";
    
    var hoursVal = frameTime.getHours();
    if (this.ampm)
    {
      hoursVal %= 12;
      if (hoursVal === 0)
      {
        hoursVal = 12;
      }
    }
    timeString += padField(hoursVal);
    
    timeString += this.divider;
    timeString += padField(frameTime.getMinutes());
    
    if (this.showSeconds)
    {
      timeString += this.divider;
      timeString += padField(frameTime.getSeconds());
    }
    
    if (this.ampm)
    {
      if (frameTime.getHours() < 12)
      {
        timeString += " AM";
      }
      else
      {
        timeString += " PM";
      }
    }
    
    return timeString;
  }

  // Drawing
  DigitalClock.prototype.draw = function(context2d, frameTime)
  {
    context2d.clearRect(0, 0, context2d.width, context2d.height);
    
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
    
    var emMetrics = context2d.measureText("m");
    
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
    
    var bgPaddingScaled =
    {
      top: this.backgroundPadding.top * this.height,
      bottom: this.backgroundPadding.bottom * this.height,
      left: this.backgroundPadding.left * emMetrics.width,
      right: this.backgroundPadding.right * emMetrics.width
    }
    
    context2d.clearRect(0 - (totalWidth / 2) - bgPaddingScaled.left,
                            0 - (this.height / 2) - bgPaddingScaled.top,
                            totalWidth + bgPaddingScaled.left + bgPaddingScaled.right,
                            this.height + bgPaddingScaled.top + bgPaddingScaled.bottom);
    
    context2d.fillStyle = (this.backgroundColour)?this.backgroundColour:oldFillStyle;
    var oldAlpha = context2d.globalAlpha;
    context2d.globalAlpha = this.backgroundAlpha;
    context2d.beginPath();
    context2d.pathRoundRect(0 - (totalWidth / 2) - bgPaddingScaled.left,
                            0 - (this.height / 2) - bgPaddingScaled.top,
                            totalWidth + bgPaddingScaled.left + bgPaddingScaled.right,
                            this.height + bgPaddingScaled.top + bgPaddingScaled.bottom,
                            Math.min(bgPaddingScaled.top, bgPaddingScaled.bottom));
    context2d.fill();
    context2d.globalAlpha = oldAlpha;
                 
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
  function AnalogClock(centerX,
                            centerY,
                            radius)
  {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    
    this.digitalClock = new DigitalClock(centerX, centerY + 0.5 * this.radius, 0.1 * this.radius);
    this.digitalClock.hoursColour = this.hourHand.colour;
    this.digitalClock.minutesColour = this.minuteHand.colour;
    this.digitalClock.secondsColour = this.secondHand.colour;
  };

  AnalogClock.prototype.refreshInterval = DEFAULT_REFRESH_INTERVAL;
  AnalogClock.prototype.autoDraw = DEFAULT_AUTO_DRAW;

  AnalogClock.prototype.setDrawBehaviour = function(refreshInterval, autoDraw)
  {
    this.refreshInterval = refreshInterval;
    this.autoDraw = autoDraw;
  }

  AnalogClock.prototype.bigTickSize = 0.07;
  AnalogClock.prototype.smallTickSize = 0.02;
  
  AnalogClock.prototype.hourHand = new ClockHand(0.4, 0.04, "darkblue");
  AnalogClock.prototype.minuteHand = new ClockHand(0.8, 0.02, "darkgreen");
  AnalogClock.prototype.secondHand = new ClockHand(0.7, 0.01, "maroon");

  AnalogClock.prototype.lineWidth = 3;

  AnalogClock.prototype.setShowHands = function(hourHand, minuteHand, secondHand)
  {
    this.hourHand.show = hourHand;
    this.minuteHand.show = minuteHand;
    this.secondHand.show = secondHand;
    this.digitalClock.showSeconds = secondHand;
  }

  AnalogClock.prototype.faceColour = "skyblue";
  AnalogClock.prototype.rimColour = "black";

  AnalogClock.prototype.setColourPallete = function(face, rim, hourHand, minuteHand, secondHand)
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
  
  AnalogClock.prototype.extendHands = true;
  AnalogClock.prototype.showHandNumbers = true;

  AnalogClock.prototype.hourNumbersRadius = 1.06;
  AnalogClock.prototype.hourNumbersFontSize = 0.08;
  AnalogClock.prototype.hourNumbersColour = "black";

  AnalogClock.prototype.minuteNumbersRadius = 0.85
  AnalogClock.prototype.minuteNumbersFontSize = 0.05;
  AnalogClock.prototype.minuteNumbersColour = "black";

  AnalogClock.prototype.setHandNumbers = function(extendHands, showHandNumbers)
  {
    this.extendHands = extendHands;
    this.showHandNumbers = showHandNumbers;
  }

  AnalogClock.prototype.showHourNumbers = true;
  AnalogClock.prototype.showMinuteNumbersBig = true;
  AnalogClock.prototype.showMinuteNumbersSmall = false;

  AnalogClock.prototype.setShowNumbers = function(hours, minutesBig, minutesSmall)
  {
    this.showHourNumbers = hours;
    this.showMinuteNumbersBig = minutesBig;
    this.showMinuteNumbersSmall = minutesSmall;
  }
  
  AnalogClock.prototype.showDigital = true;
  
  AnalogClock.prototype.timerEnd = null;
  
  AnalogClock.prototype.setTimerEnd = function(hour, minute, second)
  {
    minute = minute || 0;
    second = second || 0;
    
    this.timerEnd = new Date();
    this.timerEnd.setHours(hour);
    this.timerEnd.setMinutes(minute);
    this.timerEnd.setSeconds(second);
  }
  
  AnalogClock.prototype.setTimerDuration = function(hours, minutes, seconds)
  {
    minutes = minutes || 0;
    seconds = seconds || 0;
    
    this.timerEnd = new Date();
    this.timerEnd.setHours(this.timerEnd.getHours() + hours);
    this.timerEnd.setMinutes(this.timerEnd.getMinutes() + minutes);
    this.timerEnd.setSeconds(this.timerEnd.getSeconds() + seconds);
  }

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
  
  function getHourHandAngle(frameTime)
  {
    var millisThisDay = 
        frameTime.getHours() * MS_IN_H + 
        frameTime.getMinutes() * MS_IN_M + 
        frameTime.getSeconds() * MS_IN_S;
    return (2.0 * Math.PI) * (millisThisDay / MS_IN_D) * 2.0;
  }

  function drawHourHand(clock, context2d, frameTime)
  {
    var handAngle = getHourHandAngle(frameTime);
    clock.hourHand.draw(clock, context2d, handAngle);
    
    if (clock.timerEnd && 
        clock.timerEnd.getTime() > frameTime.getTime() &&
        clock.timerEnd.getTime() - frameTime.getTime() < MS_IN_D)
    {
      clock.hourHand.drawTimerArc(clock, context2d, handAngle, getHourHandAngle(clock.timerEnd));
    }
  }
  
  function getMinuteHandAngle(frameTime)
  {
    var millisThisHour = frameTime.getMinutes() * MS_IN_M + frameTime.getSeconds() * MS_IN_S;
    return (2.0 * Math.PI) * (millisThisHour / MS_IN_H);
  }

  function drawMinuteHand(clock, context2d, frameTime)
  {
    var handAngle = getMinuteHandAngle(frameTime);
    clock.minuteHand.draw(clock, context2d, handAngle);
    
    if (clock.timerEnd && 
        clock.timerEnd.getTime() > frameTime.getTime() &&
        clock.timerEnd.getTime() - frameTime.getTime() < MS_IN_H)
    {
      clock.minuteHand.drawTimerArc(clock, context2d, handAngle, getMinuteHandAngle(clock.timerEnd));
    }
  }
  
  function getSecondHandAngle(frameTime)
  {
    return (2.0 * Math.PI) * (frameTime.getSeconds() / S_IN_M);
  }

  function drawSecondHand(clock, context2d, frameTime)
  {
    var handAngle = getSecondHandAngle(frameTime);
    clock.secondHand.draw(clock, context2d, handAngle);
    
    if (clock.timerEnd && 
        clock.timerEnd.getTime() > frameTime.getTime() &&
        clock.timerEnd.getTime() - frameTime.getTime() < MS_IN_M)
    {
      clock.secondHand.drawTimerArc(clock, context2d, handAngle, getSecondHandAngle(clock.timerEnd));
    }
  }

  function rescheduleDraw(clock, faceContext, handsContext, digitalContext, frameTime)
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
          clock.draw(faceContext, handsContext, digitalContext, nextFrame);
        },
        nextFrame.getTime() - now.getTime());
  }

  AnalogClock.prototype.draw = function(faceContext, handsContext, digitalContext, frameTime)
  {
    if (this.drawTimerId)
    {
      clearTimeout(this.drawTimerId);
      this.drawTimerId = null;
    }
    
    if (this.timerEnd && frameTime.getTime() >= this.timerEnd.getTime())
    {
      this.timerEnd = null;
    }
    var buffer = this.radius * 0.5;
    
    if (!this.faceValid)
    {
      faceContext.save();
      faceContext.lineWidth = this.lineWidth;
      faceContext.translate(this.centerX, this.centerY);
      faceContext.clearRect(0, 0, faceContext.width, faceContext.height);
      drawCircle(this, faceContext);
      drawTicks(this, faceContext);
      faceContext.restore();
      
      this.faceValid = true;
    }
    
    handsContext.save();
    handsContext.lineWidth = this.lineWidth;
    handsContext.clearRect(0, 0, handsContext.width, handsContext.height);
    handsContext.translate(this.centerX, this.centerY);
    drawNumbers(this, handsContext, frameTime);
    if (this.hourHand.show)
    {
      drawHourHand(this, handsContext, frameTime);
    }
    if (this.minuteHand.show)
    {
      drawMinuteHand(this, handsContext, frameTime);
    }
    if (this.secondHand.show)
    {
      drawSecondHand(this, handsContext, frameTime);
    }
    handsContext.restore();
    
    if (this.showDigital)
    {
      digitalContext.save();
      this.digitalClock.draw(digitalContext, frameTime);
      digitalContext.restore();
    }
    
    
    if (this.autoDraw)
    {
      rescheduleDraw(this, faceContext, handsContext, digitalContext, frameTime);
    }
  }

  return AnalogClock;
})();

function startClock(faceCanvasId, handsCanvasId, digitalCanvasId)
{
  var faceCanvas = document.getElementById(faceCanvasId);
  var handsCanvas = document.getElementById(handsCanvasId);
  var digitalCanvas = document.getElementById(digitalCanvasId);
  
  var faceContext = faceCanvas.getContext('2d');
  faceContext.width = faceCanvas.width;
  faceContext.height = faceCanvas.height;
  
  var handsContext = handsCanvas.getContext('2d');
  handsContext.width = handsCanvas.width;
  handsContext.height = handsCanvas.height;
  
  var digitalContext = digitalCanvas.getContext('2d');
  digitalContext.width = digitalCanvas.width;
  digitalContext.height = digitalCanvas.height;
  
  var clock = new Clock(faceCanvas.width / 2,
                   faceCanvas.height / 2,
                   Math.min(faceCanvas.width, faceCanvas.height) * 0.45);
  var frameTime = new Date();
  frameTime.setMilliseconds(0);
  
  clock.draw(faceContext, handsContext, digitalContext, frameTime);
    
  return clock;
}
