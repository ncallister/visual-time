
function updateSettings()
{
  var showHourHand = document.getElementById("showHourHand").checked;
  var showMinuteHand = document.getElementById("showMinuteHand").checked;
  var showSecondHand = document.getElementById("showSecondHand").checked;

  mainClock.setShowHands(showHourHand, showMinuteHand, showSecondHand);
}
