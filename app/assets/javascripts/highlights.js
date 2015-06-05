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
function onYouTubeIframeAPIReady() {
  apiReady = true; // API is ready
  var fetchButton = document.getElementById('fetchButton');
  fetchButton.classList.remove('disabled');
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  playerElement = document.getElementById('player');
  playerElement.classList.add('embed-responsive-item');

  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 10000);
    done = true;
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
