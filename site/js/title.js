/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

"use strict";

var titleTimer = null;
var titleClock = new DigitalClock();

titleClock.showSeconds = false;
titleClock.ampm = true;

function setTitle()
{
  // Get the current time
  var time = new Date();
  
  console.log(time.toString());
  
  if (titleTimer)
  {
    clearTimeout(titleTimer);
    titleTimer = null;
  }
  
  document.title = titleClock.timeToString(time) + " - Visual Time";
  
  // Calculate the next time
  var nextTime = new Date(time.getTime());
  // Add one minute
  nextTime.setTime(nextTime.getTime() + MS_IN_M);
  // Zero sub minute fields
  nextTime.setSeconds(0);
  nextTime.setMilliseconds(0);
  titleTimer = setTimeout(setTitle, nextTime.getTime() - time.getTime());
}

setTitle();