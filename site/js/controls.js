function initSettings()
{
  updateSettings();
  toggleDayNightMode();
  updatePlaySound();
}


function updateSettings()
{
  var showHourHand = document.getElementById("showHourHand").checked;
  var showMinuteHand = document.getElementById("showMinuteHand").checked;
  var showSecondHand = document.getElementById("showSecondHand").checked;

  mainClock.setShowHands(showHourHand, showMinuteHand, showSecondHand);
}

function toggleDayNightMode()
{
  var isNightMode = document.getElementById("nightMode").checked;

  if (isNightMode)
  {
    nightMode();
  }
  else
  {
    dayMode();
  }
}

function showTimerDuration()
{
  var hours = parseInt(document.getElementById("durationHours").value) || 0;
  var minutes = parseInt(document.getElementById("durationMinutes").value) || 0;
  var seconds = parseInt(document.getElementById("durationSeconds").value) || 0;
  
  mainClock.setTimerDuration(hours, minutes, seconds);
}

function showTimerEnd()
{
  var hour = parseInt(document.getElementById("endHour").value) || 0;
  var minute = parseInt(document.getElementById("endMinute").value) || 0;
  var second = parseInt(document.getElementById("endSecond").value) || 0;
  
  mainClock.setTimerEnd(hour, minute, second);
}

function updatePlaySound()
{
  mainClock.playTimerSound = document.getElementById("playTimerSound").checked;
  
  if (!mainClock.playTimerSound && mainClock.timerSound && !mainClock.timerSound.paused)
  {
    mainClock.timerSound.pause();
  }
}

function startUp()
{
  window.mainClock = createClock('faceCanvas', 'handsCanvas', 'digitalCanvas', 'alarmSound'); 
  initSettings();
  drawClock(mainClock);
}

var faceContext;
var handsContext;
var digitalContext;

function createClock(faceCanvasId, handsCanvasId, digitalCanvasId, audioId)
{
  var faceCanvas = document.getElementById(faceCanvasId);
  var handsCanvas = document.getElementById(handsCanvasId);
  var digitalCanvas = document.getElementById(digitalCanvasId);
  
  faceContext = faceCanvas.getContext('2d');
  faceContext.width = faceCanvas.width;
  faceContext.height = faceCanvas.height;
  
  handsContext = handsCanvas.getContext('2d');
  handsContext.width = handsCanvas.width;
  handsContext.height = handsCanvas.height;
  
  digitalContext = digitalCanvas.getContext('2d');
  digitalContext.width = digitalCanvas.width;
  digitalContext.height = digitalCanvas.height;
  
  var clock = new Clock(faceCanvas.width / 2,
                   faceCanvas.height / 2,
                   Math.min(faceCanvas.width, faceCanvas.height) * 0.45);
  
  if (audioId)
  {
    clock.timerSound = document.getElementById(audioId);
  }
  
  return clock;
}

function drawClock(clock)
{
  var frameTime = new Date();
  frameTime.setMilliseconds(0);
  
  clock.draw(faceContext, handsContext, digitalContext, frameTime);
    
  return clock;
}

  
function dayMode()
{
  mainClock.faceColour = "skyblue";
  mainClock.rimColour = "black";
  mainClock.hourNumbersColour = "black";
  mainClock.minuteNumbersColour = "black";
  mainClock.hourHand.colour = "darkblue";
  mainClock.minuteHand.colour = "darkgreen";
  mainClock.secondHand.colour = "maroon";

  mainClock.sincDigitalClockColours(mainClock.digitalClock);
  mainClock.sincDigitalClockColours(mainClock.digitalCountdown);

  var bodyCss = document.querySelector("body").style;
  bodyCss["background-color"]="white";
  bodyCss.color="black";

  mainClock.faceValid = false;
  drawClock(mainClock);
}

function nightMode()
{
  mainClock.faceColour = "rgb(50, 50, 50)";
  mainClock.rimColour = "white";
  mainClock.hourNumbersColour = "white";
  mainClock.minuteNumbersColour = "white";
  mainClock.hourHand.colour = "skyblue";
  mainClock.minuteHand.colour = "lightgreen";
  mainClock.secondHand.colour = "pink";

  mainClock.sincDigitalClockColours(mainClock.digitalClock);
  mainClock.sincDigitalClockColours(mainClock.digitalCountdown);

  var bodyCss = document.querySelector("body").style;
  bodyCss["background-color"]="black";
  bodyCss.color="white";

  mainClock.faceValid = false;
  drawClock(mainClock);
}
