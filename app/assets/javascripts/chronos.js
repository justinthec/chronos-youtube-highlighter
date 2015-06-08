// Constructor
function Chronos(player) {
  // always initialize all instance properties
  this.player = player;
  this.highlights = [];
}
// class methods
Chronos.prototype.addHighlight = function(starth, startm, starts, endh, endm, ends) {
  var highlight = new Highlight(starth, startm, starts, endh, endm, ends);
  this.highlights.push(highlight);
  this.highlights.sort(); 
};

Chronos.prototype.startWatcher = function() {
  this.watcher = window.setInterval(this.handleFrame, 1000, this);
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
  console.log("CurrentTime: "+currentTime+", highlights:"+instance.highlights.length+", withinHighlight: "+instance.withinHighlight(currentTime) + ", findNextHighlight: "+instance.findNextHighlight(currentTime));
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

function Highlight(starth, startm, starts, endh, endm, ends) {
  this.start = parseInt(starth) * 60 * 60 + parseInt(startm) * 60 + parseInt(starts);
  this.end = parseInt(endh) * 60 * 60 + parseInt(endm) * 60 + parseInt(ends);
}
// export the class
// module.exports = Chronos;