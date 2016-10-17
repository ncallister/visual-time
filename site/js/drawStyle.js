/* 
 *  DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *  
 *  Copyright (c) 2016 IWSoftware Pty Ltd.
 *  All rights reserved.
 */


"use strict";

var DrawStyle = (function()
{
  function DrawStyle()
  {
  }
  
  DrawStyle.prototype.shouldStroke = true;
  DrawStyle.prototype.stroke = null;
  DrawStyle.prototype.strokeAlpha = null;
  
  DrawStyle.prototype.lineWidth = null;
  
  DrawStyle.prototype.shouldFill = true;
  DrawStyle.prototype.fill = null;
  DrawStyle.prototype.fillAlpha = null;
  
  DrawStyle.prototype.configureContext = function(context2d)
  {
    if (this.stroke)
    {
      context2d.strokeStyle = this.stroke;
    }
    if (this.fill)
    {
      context2d.fillStyle = this.fill;
    }
    if (this.lineWidth)
    {
      context2d.lineWidth = this.lineWidth;
    }
  }
  
  DrawStyle.prototype.getStrokeColour = function(defaultColour)
  {
    if (this.stroke)
    {
      return this.stroke;
    }
    return defaultColour;
  }
  
  DrawStyle.prototype.getFillColour = function(defaultColour)
  {
    if (this.fill)
    {
      return this.fill;
    }
    return defaultColour;
  }
  
  DrawStyle.prototype.getLineWidth = function(defaultWidth)
  {
    if (this.lineWidth)
    {
      return this.lineWidth;
    }
    return defaultWidth;
  }
  
  return DrawStyle;
})();
