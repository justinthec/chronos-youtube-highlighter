// Chronos variable
var chronos;

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
  $('#highlights-container .highlight .time-input:eq(0)').val("0:00");
  $('#highlights-container .highlight .time-input:eq(1)').val(player.getDuration());
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

  var highlights = document.getElementById('highlight-inputs-container').children;
  for (var i = 0; i < highlights.length; i++) {
    var inputs = [];
    for (var j in highlights[i].children) {
      if (highlights[i].children[j].tagName == "INPUT")
        inputs.push(highlights[i].children[j]);
    }
    var startString = inputs[0].value;
    var endString = inputs[1].value;

    highlightBounds = [startString, endString].map(function(timeString) {
      var timeFactors = timeString.split(":").reverse();
      var timeInSeconds = 0;
      for (var i = 0; i < timeFactors.length; i++) {
        timeInSeconds += timeFactors[i] * Math.pow(60, i);
      }
      return timeInSeconds;
    });

    chronos.addHighlight(highlightBounds[0], highlightBounds[1]);
  }

  chronos.startWatcher();
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

  $('#add-highlight-button').click(function() {
    $('#highlight-inputs-container').append("<div class=\"form-group highlight\"><input class=\"form-control time-input\" type=\"text\" placeholder=\"Start\"><span class=\"time-to-line\">—</span><input class=\"form-control time-input\" type=\"text\" placeholder=\"End\"></div>");
  });
});