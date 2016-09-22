'use strict';

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
  function ClockConstructor(centerX,
                            centerY,
                            radius,
                            includeDigital = DEFAULT_INCLUDE_DIGITAL)
  {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.includeDigital = includeDigital;
  };

  ClockConstructor.prototype.refreshInterval = DEFAULT_REFRESH_INTERVAL;
  ClockConstructor.prototype.autoDraw = DEFAULT_AUTO_DRAW;

  ClockConstructor.prototype.setDrawBehaviour = function(refreshInterval, autoDraw)
  {
    this.refreshInterval = refreshInterval;
    this.autoDraw = autoDraw;
  }

  ClockConstructor.prototype.bigTickSize = DEFAULT_BIG_TICK_SIZE;
  ClockConstructor.prototype.smallTickSize = DEFAULT_SMALL_TICK_SIZE;
  ClockConstructor.prototype.hourSize = DEFAULT_HOUR_SIZE;
  ClockConstructor.prototype.minuteSize = DEFAULT_MINUTE_SIZE;
  ClockConstructor.prototype.secondSize = DEFAULT_SECOND_SIZE;

  function drawCircle(clock, context2d)
  {
    context2d.beginPath();
    context2d.arc(0, 0, clock.radius, 0, 2 * Math.PI);
    context2d.stroke();
  }

  function drawTick(clock, context2d, angle, tickSize)
  {
    context2d.rotate(angle);
    context2d.beginPath();
    context2d.moveTo(0, 0 - clock.radius + Math.ceil(tickSize));
    context2d.lineTo(0, 0 - clock.radius);
    context2d.stroke();
    context2d.rotate(-1.0 * angle);
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

  function drawHand(clock, context2d, angle, length, width)
  {
    context2d.rotate(angle);
    context2d.fillRect(0 - (width / 2.0), 0, Math.ceil(width), Math.ceil(length));
    context2d.rotate(-1.0 * angle);
  }

  function drawHourHand(clock, context2d, frameTime)
  {
    var millisThisDay = frameTime.getHours() * MS_IN_H + frameTime.getMinutes() * MS_IN_M + frameTime.getSeconds() * MS_IN_S;
    drawHand(clock, context2d, (2.0 * Math.PI) * (millisThisDay / MS_IN_D) * 2.0, clock.radius * clock.hourSize, clock.radius * 0.01);
  }

  function drawMinuteHand(clock, context2d, frameTime)
  {
    var millisThisHour = frameTime.getMinutes() * MS_IN_M + frameTime.getSeconds() * MS_IN_S;
    drawHand(clock, context2d, (2.0 * Math.PI) * (millisThisHour / MS_IN_H), clock.radius * clock.minuteSize, clock.radius * 0.01);
  }

  function drawSecondHand(clock, context2d, frameTime)
  {
    drawHand(clock, context2d, (2.0 * Math.PI) * (frameTime.getSeconds() / S_IN_M), clock.radius * clock.secondSize, clock.radius * 0.01);
  }

  function rescheduleDraw(clock, context2d, frameTime)
  {
    var now = new Date();
    var nextFrame = new Date(frameTime.getTime() + clock.refreshInterval);
    setTimeout(
        function()
        {
          clock.draw(context2d, nextFrame);
        },
        nextFrame.getTime() - now.getTime());
  }

  ClockConstructor.prototype.draw = function(context2d, frameTime)
  {
    context2d.save();
    context2d.translate(this.centerX, this.centerY);
    context2d.clearRect(-1 * this.radius, -1 * this.radius, 2 * this.radius, 2 * this.radius);
    drawCircle(this, context2d);
    drawTicks(this, context2d);
    drawHourHand(this, context2d, frameTime);
    drawMinuteHand(this, context2d, frameTime);
    drawSecondHand(this, context2d, frameTime);
    context2d.restore();
    if (this.autoDraw)
    {
      rescheduleDraw(this, context2d, frameTime);
    }
  }

  return ClockConstructor;
})();

function startClock(canvasId)
{
  var canvas = document.getElementById(canvasId);
  if (canvas.getContext)
  {
    var ctx = canvas.getContext('2d');
    new Clock(canvas.width / 2,
              canvas.height / 2,
              Math.min(canvas.width, canvas.height) * 0.45).draw(ctx, new Date());
  }
}
