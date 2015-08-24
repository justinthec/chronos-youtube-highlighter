// Constructor
function Chronos(player, frameInterval) {
  this.player = player;
  this.frameInterval = typeof frameInterval !== 'undefined' ? frameInterval : 1000; // Defaults to 1 second if none passed in.
  this.highlights = [];
}

// Class methods
Chronos.prototype.addHighlight = function(startSeconds, endSeconds) {
  var highlight = new Highlight(startSeconds, endSeconds);
  this.highlights.push(highlight);
  this.highlights.sort(function(a, b) {
    return a.start - b.start;
  });
};

Chronos.prototype.startWatcher = function() {
  this.watcher = window.setInterval(this.handleFrame, frameInterval, this);
}

Chronos.prototype.withinHighlight = function(time) {
  for (var i in this.highlights){
    if ((this.highlights[i].start <= time) && (time <= this.highlights[i].end))
      return true;
  }
  return false;
};

Chronos.prototype.handleFrame = function(instance) {
  var currentTime = instance.player.getCurrentTime();
  console.log("CurrentTime: " + currentTime +
    ", highlights:" + instance.highlights.length +
    ", withinHighlight: " + instance.withinHighlight(currentTime) +
    ", findNextHighlight: " + instance.findNextHighlight(currentTime));
  if ((instance.player.getPlayerState() == 1) && !(instance.withinHighlight(currentTime))) {
    instance.player.seekTo(instance.findNextHighlight(currentTime), true);
  }
};

Chronos.prototype.findNextHighlight = function(time) {
  for (var i in this.highlights){
    if (time <= this.highlights[i].start)
      return this.highlights[i].start;
  }
  return this.player.getDuration();
};

Chronos.prototype.destroy = function() {
  window.clearInterval(this.watcher);
};

// Constructor
function Highlight(start, end) {
  this.start = start;
  this.end = end;
}
