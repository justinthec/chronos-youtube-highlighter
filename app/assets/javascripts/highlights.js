$(document).ready( function() {
    $('#urlField').keypress( function(e) {
      if (e.keyCode == 13)
      $('#fetchButton').click();
    });
});

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
var chronos;
function onYouTubeIframeAPIReady() {
  apiReady = true; // API is ready
  var fetchButton = document.getElementById('fetchButton');
  fetchButton.classList.remove('disabled');
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  playerElement = document.getElementById('player');
  playerElement.classList.add('embed-responsive-item');
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    var highlightChildren = [].slice.call(document.getElementById('highlight1').children);
    var inputs = highlightChildren.filter(function(child){return child.tagName == 'INPUT';});
    var starth = inputs[0].value;
    var startm = inputs[1].value;
    var starts = inputs[2].value;
    var endh = inputs[3].value;
    var endm = inputs[4].value;
    var ends = inputs[5].value;

    chronos && chronos.destroy();
    chronos = new Chronos(player);
    chronos.addHighlight(starth, startm, starts, endh, endm, ends);
    chronos.startWatcher();
  }
}

function stopVideo() {
    player.stopVideo();
}

function onFetchUrlClick() {
  if (apiReady){
    var urlField = document.getElementById('urlField');
    var normalUrlPattern = /\/watch?.*v=/;
    var shortenedUrlPattern = /youtu.be\//;
    var fullScreenUrlPattern = /\/v\//;
    var videoIdPattern = /([a-zA-Z0-9_]*)/;
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
      document.getElementById('player-container').classList.add('expanded');

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
