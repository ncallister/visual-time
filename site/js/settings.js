
function updateSettings()
{
  var showHourHand = document.getElementById("showHourHand").checked;
  var showMinuteHand = document.getElementById("showMinuteHand").checked;
  var showSecondHand = document.getElementById("showSecondHand").checked;

  mainClock.setShowHands(showHourHand, showMinuteHand, showSecondHand);
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