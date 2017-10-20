// Chronos variable
var chronos;

var globalHighlights = [];

// YouTube Player API
// 1. Prepare for API Load
var apiReady = false;

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  apiReady = true; // API is ready
  $('#fetch-button').removeClass('disabled');
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  $('#fetch-container').popover('destroy');
  $('#player').addClass('embed-responsive-item');
  $('#highlights-container .highlight #gamedataurl').focus();
  $('#highlights-container, #player-container').popover('show');
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    $('#highlights-container, #player-container').popover('destroy');
    updateChronos();
  }
}

function stopVideo() {
    player.stopVideo();
}

function fetchVideo() {
  if (apiReady){
    var urlField = document.getElementById('url-field');
    var normalUrlPattern = /\/watch?.*v=/;
    var shortenedUrlPattern = /youtu.be\//;
    var fullScreenUrlPattern = /\/v\//;
    var videoIdPattern = /([a-zA-Z0-9_\-]*)/;
    if (urlField.value.match(normalUrlPattern))
      videoIdString = urlField.value.match(new RegExp(normalUrlPattern.source + videoIdPattern.source))[1];
    else if (urlField.value.match(shortenedUrlPattern))
      videoIdString = urlField.value.match(new RegExp(shortenedUrlPattern.source + videoIdPattern.source))[1];
    else if (urlField.value.match(fullScreenUrlPattern))
      videoIdString = urlField.value.match(new RegExp(fullScreenUrlPattern.source + videoIdPattern.source))[1];
    else
      videoIdString = "";
    console.log("Video ID: "+videoIdString);

    if (player){
      done = false;
      player.loadVideoById({videoId: videoIdString}) 
    }
    else {
      $('#highlights-container').fadeIn(1500);
      $('#player-container').addClass('expanded');

      player = new YT.Player('player', {
        videoId: videoIdString,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }
  }
}

function resetVideo() {
  updateChronos();
  player.seekTo(0);
  player.playVideo();
}

function updateChronos() {
  chronos && chronos.destroy();
  chronos = new Chronos(player);

  if (globalHighlights.length == 0) {
    let highlights = getTimestamps($('#gamedataurl').val(), true);
    globalHighlights = highlights.slice();
  }

  let gameoffset = parseInt($('#gameoffset').val());
  for (var i = 0; i < globalHighlights.length; i++) {
    var highlight = globalHighlights[i];
    chronos.addHighlight(gameoffset + highlight.start, gameoffset + highlight.end);
  }
  // var highlights = document.getElementById('highlight-inputs-container').children;
  // for (var i = 0; i < highlights.length; i++) {
  //   var inputs = [];
  //   for (var j in highlights[i].children) {
  //     if (highlights[i].children[j].tagName == "INPUT")
  //       inputs.push(highlights[i].children[j]);
  //   }
  //   var startString = inputs[0].value;
  //   var endString = inputs[1].value;

  //   highlightBounds = [startString, endString].map(function(timeString) {
  //     var timeFactors = timeString.split(":").reverse();
  //     var timeInSeconds = 0;
  //     for (var i = 0; i < timeFactors.length; i++) {
  //       timeInSeconds += timeFactors[i] * Math.pow(60, i);
  //     }
  //     return timeInSeconds;
  //   });

  //   chronos.addHighlight(highlightBounds[0], highlightBounds[1]);
  // }

  chronos.startWatcher();
}

function getTimestamps(theUrl, raw = false) {
    var gameData;
    if (!raw) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", theUrl, false );
      xmlHttp.send( null );
      gameData = JSON.parse(xmlHttp.responseText);
    } else {
      gameData = JSON.parse(theUrl);
    }

    var killTimeStamps = new Array();


    for (var i=0;i<gameData.frames.length;i++){
        for (var j=0;j<gameData.frames[i].events.length;j++) {
            if (gameData.frames[i].events[j].type=="CHAMPION_KILL") {
                var startEndPair = {};
                startEndPair.start = Math.round((gameData.frames[i].events[j].timestamp - 10000)/1000);
                startEndPair.end = Math.round((gameData.frames[i].events[j].timestamp+5000)/1000);
                killTimeStamps.push(startEndPair);
            }
        }
    }
    return mergeTimestamps(killTimeStamps);
}

function mergeTimestamps(timestamps) {
    for (var i=0;i<timestamps.length-1;) {
        if (timestamps[i].end >= timestamps[i+1].end) {
            timestamps.splice(i+1,1);
        }

        else if (timestamps[i].end >= timestamps[i+1].start) {
            var newStart = timestamps[i].start;
            timestamps.splice(i,1);
            timestamps[i].start = newStart;
        }

        else {
            i++;
        }
    }
    return timestamps;
}

// Bindings
$(document).ready(function() {
  $('#fetch-container').popover('show');

  $('#highlights-container').hide();

  $('#url-field').keypress(function(e) {
    if (e.keyCode == 13)
    $('#fetch-button').click();
  });

  $('#fetch-button').click(function() {
    fetchVideo();
  });

  $('#url-field').click(function() {
    this.setSelectionRange(0, this.value.length)
  });

  function formatTimestamp() {
    var newVal = $(this).val();
    if(newVal.indexOf(':') == -1)
      newVal = Math.floor(newVal / 60) + ":" + ((newVal % 60).toString().length < 2 ? "0" : "") + (newVal % 60);
    $(this).val(newVal);
  }

  $('#process-highlights-button').click(function() {
  });

  $('#highlights-container .highlight .time-input').focusout(formatTimestamp);
});