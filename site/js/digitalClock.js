/* 
 *  DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *  
 *  Copyright (c) 2016 IWSoftware Pty Ltd.
 *  All rights reserved.
 */

"use strict";

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
    
    this.hoursStyle.lineWidth = Math.ceil(height * 0.1);
    this.hoursStyle.shouldStroke = false;
    
    this.minutesStyle.lineWidth = Math.ceil(height * 0.1);
    this.minutesStyle.shouldStroke = false;
    
    this.secondsStyle.lineWidth = Math.ceil(height * 0.1);
    this.secondsStyle.shouldStroke = false;
    
    this.dividerStyle.lineWidth = Math.ceil(height * 0.1);
    this.dividerStyle.shouldStroke = false;
    
    this.ambleStyle.lineWidth = Math.ceil(height * 0.1);
    this.ambleStyle.shouldStroke = false;
  }
  
  DigitalClock.prototype.height = 5;
  
  DigitalClock.prototype.ampm = true;
  DigitalClock.prototype.divider = ":";
  
  DigitalClock.prototype.hoursStyle = new DrawStyle();
  DigitalClock.prototype.minutesStyle = new DrawStyle();
  DigitalClock.prototype.secondsStyle = new DrawStyle();
  DigitalClock.prototype.dividerStyle = new DrawStyle();
  DigitalClock.prototype.ambleStyle = new DrawStyle();
  
  DigitalClock.prototype.showSeconds = true;
  
  DigitalClock.prototype.backgroundColour = "white";
  DigitalClock.prototype.backgroundAlpha = 0.5;
  DigitalClock.prototype.backgroundPadding =
  {
    top: 0.5,     // Factor of font height
    bottom: 0.5,  // Factor of font height
    left: 1,      // Em
    right: 1      // Em
  };
  DigitalClock.prototype.backgroundHeight = 1.2;
  DigitalClock.prototype.backgroundWidth = 1.2;   // em
  
  DigitalClock.prototype.endTime = null;
  
  function padField(value)
  {
    var string = value.toString();
    while (string.length < 2)
    {
      string = "0" + string;
    }
    return string;
  }
  
  function isCountDown(clock, frameTime)
  {
    return clock.endTime && clock.endTime.getTime() > frameTime.getTime();
  }
  
  function getPreamble(clock, frameTime)
  {
    var preamble = "";
    if (isCountDown(clock, frameTime))
    {
      preamble = "T - ";
    }
    return preamble;
  }
  
  function getHours(clock, frameTime)
  {
    var hoursVal;
    if (isCountDown(clock, frameTime))
    {
      hoursVal = Math.floor((clock.endTime.getTime() - frameTime.getTime()) / MS_IN_H);
    }
    else
    {
      hoursVal = frameTime.getHours();
      if (clock.ampm)
      {
        hoursVal %= 12;
        if (hoursVal === 0)
        {
          hoursVal = 12;
        }
      }
    }
    return padField(hoursVal);
  }
  
  function getMinutes(clock, frameTime)
  {
    var minVal;
    if (isCountDown(clock, frameTime))
    {
      minVal = Math.floor(((clock.endTime.getTime() - frameTime.getTime()) % MS_IN_H) / MS_IN_M);
    }
    else
    {
      minVal = frameTime.getMinutes();
    }
    return padField(minVal);
  }
  
  function getSeconds(clock, frameTime)
  {
    var secVal;
    if (isCountDown(clock, frameTime))
    {
      secVal = Math.floor(((clock.endTime.getTime() - frameTime.getTime()) % MS_IN_M) / MS_IN_S);
    }
    else
    {
      secVal = frameTime.getSeconds();
    }
    return padField(secVal);
  }
  
  function getPostamble(clock, frameTime)
  {
    var postamble = "";
    if (!isCountDown(clock, frameTime) && clock.ampm)
    {
      if (frameTime.getHours() < 12)
      {
        postamble = " AM";
      }
      else
      {
        postamble = " PM";
      }
    }
    return postamble;
  }
  
  DigitalClock.prototype.timeToString = function(frameTime)
  {
    var timeString = getPreamble(this, frameTime);
    
    timeString += getHours(this, frameTime);
    
    timeString += this.divider;
    timeString += getMinutes(this, frameTime);
    
    if (this.showSeconds)
    {
      timeString += this.divider;
      timeString += getSeconds(this, frameTime);
    }
    timeString += getPostamble(this, frameTime);
    
    return timeString;
  }
  
  function renderText(context2d, text, xPos, yPos, drawStyle)
  {
    context2d.save();
    
    drawStyle.configureContext(context2d);
    
    if (drawStyle.shouldFill)
    {
      context2d.fillText(text, xPos, yPos);
    }
    
    if (drawStyle.shouldStroke)
    {
      context2d.strokeText(text, xPos, yPos);
    }
    
    context2d.restore();
  }

  // Drawing
  DigitalClock.prototype.draw = function(context2d, frameTime)
  {
    context2d.save();
    
    context2d.translate(this.centerX, this.centerY);
    context2d.font = "bold " + Math.ceil(this.height.toString()).toString() +
            "px monospace";
    context2d.textBaseline = "middle";
    
    var preamble = getPreamble(this, frameTime);
    var hours = getHours(this, frameTime);
    var minutes = getMinutes(this, frameTime);
    var seconds = getSeconds(this, frameTime);
    var postamble = getPostamble(this, frameTime);
    
    var dividerMetrics = context2d.measureText(this.divider);
    var preambleMetrics = context2d.measureText(preamble);
    var hoursMetrics = context2d.measureText(hours);
    var minutesMetrics = context2d.measureText(minutes);
    var secondsMetrics = context2d.measureText(seconds);
    var ampmMetrics = context2d.measureText(postamble);
    
    var emMetrics = context2d.measureText("m");
    
    var dividerCount = 1;
    if (this.showSeconds)
    {
      dividerCount = 2;
    }
    
    var totalWidth = dividerMetrics.width * dividerCount +
                     preambleMetrics.width +
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
    
    // Draw background
    context2d.clearRect(0 - (totalWidth / 2) - bgPaddingScaled.left,
                            0 - (this.height / 2) - bgPaddingScaled.top,
                            totalWidth + bgPaddingScaled.left + bgPaddingScaled.right,
                            this.height + bgPaddingScaled.top + bgPaddingScaled.bottom);
    
    context2d.fillStyle = (this.backgroundColour)?this.backgroundColour:oldFillStyle;
    context2d.save();
    context2d.globalAlpha = this.backgroundAlpha;
    context2d.beginPath();
    context2d.pathRoundRect(0 - (totalWidth / 2) - bgPaddingScaled.left,
                            0 - (this.height / 2) - bgPaddingScaled.top,
                            totalWidth + bgPaddingScaled.left + bgPaddingScaled.right,
                            this.height + bgPaddingScaled.top + bgPaddingScaled.bottom,
                            Math.min(bgPaddingScaled.top, bgPaddingScaled.bottom));
    context2d.fill();
    context2d.restore();
    
    
    renderText(context2d, preamble, xLeft, 0, this.ambleStyle);
    xLeft += preambleMetrics.width;

    renderText(context2d, hours, xLeft, 0, this.hoursStyle);
    xLeft += hoursMetrics.width;
    
    renderText(context2d, this.divider, xLeft, 0, this.dividerStyle);
    xLeft += dividerMetrics.width;
    
    renderText(context2d, minutes, xLeft, 0, this.minutesStyle);
    xLeft += minutesMetrics.width;
    
    if (this.showSeconds)
    {
      renderText(context2d, this.divider, xLeft, 0, this.dividerStyle);
      xLeft += dividerMetrics.width;

      renderText(context2d, seconds, xLeft, 0, this.secondsStyle);
      xLeft += secondsMetrics.width;
    }
    
    renderText(context2d, postamble, xLeft, 0, this.ambleStyle);
    
    context2d.restore();
  }
  
  return DigitalClock;
})();
