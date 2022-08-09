// This object expects an array of inputs, each element of which looks like
// [time, "type", x, y], where time is in Ms
// fn should be the function to be called per the input times
// [time, type<str>, data**]
// Programmer defines their own "type" and argument "data". They need to register
//  callbacks that will take the data in array form. Exception being "loop" keyword.
// for type == "loop"
//  data looks like <begin|end>, [time, "loop", "begin"|"end", loopFor (only for begin)]
//  once it reaches the "end" of the loop, it loops back to the start and loops for $loopFor times
// Can work based off of "time" or "frames". If it's based off of frames, one needs to call the updateFrame() member function continuously
class AutoInput
{
  constructor(inputList, mousein, keyin)
  {
    this.initTs = Date.now();
    this.inputList = inputList;
    this.idx = 0;
    this.playing = false;
    this.mousein = mousein;
    this.keyin = keyin;
    this.overallLoopEnabled = false;
    this.mode = "time";
    this.frame = 0;
    this.lastFiredFrame = 0;
    this.loopBeginIdx = null;
    this.loopCtr = 0;
    this.callbacks = {};
  }

  setCallbackFunction(name, callback)
  {
    if (name == "loop")
    {
      console.error("[!] Callback function name cannot be loop!");
      return;
    }
    this.callbacks[name] = callback;
  }

  setOverallLoopEnabled(l)
  {
    this.overallLoopEnabled = l;
  }

  setMode(modeStr)
  {
    if (modeStr != "time" && modeStr != "frame")
    {
      console.log("modeStr needs to be either \"time\" or \"frame\"");
      return;
    }
    this.mode = modeStr;
  }

  updateFrame()
  {
    if (this.mode != "frame")
    {
      console.log("updateFrame in invalid mode!");
      return;
    }
    if (this.playing = false)
    {
      return false;
    }
    if (this.idx >= this.inputList.length)
    {
      if (this.overallLoopEnabled)
      {
        this.idx = 0;
        this.frame = 0;
        this.lastFiredFrame = 0;
      }
      else
      {
        return false;
      }
    }

    this.frame++;
    if (this.frame >= this.lastFiredFrame + this.inputList[this.idx][0])
    {
      this.lastFiredFrame = this.frame;
      this.fire(this.inputList[this.idx]);
    }
  }

  start()
  {
    if (this.inputList.length == 0)
    {
      return;
    }
    this.playing = true;
    if (this.mode == "time")
    {
      this.initiateNext();
    }
    console.log("AUTO INPUT START");
  }

  stop()
  {
    this.playing = false;
    console.log("AUTO INPUT STOP");
  }

  initiateNext()
  {
    if (this.playing = false)
    {
      return false;
    }
    if (this.idx >= this.inputList.length)
    {
      if (this.overallLoopEnabled)
      {
        this.idx = 0;
      }
      else
      {
        return false;
      }
    }
    var time = this.inputList[this.idx][0];
    console.log("Initiating entry", this.idx, "for time", time, "at", this.initTs);
    var me = this;
    this.timer = setTimeout( function() { me.fire(me.inputList[me.idx]); } , time);
  }

  fire(entry)
  {
    console.log("FIRING ENTRY", entry, "CALLBACK FN", this.callbacks[entry[1]]);
    if (entry[1] == "loop")
    {
      if (entry[2] == "begin")
      {
        this.loopBeginIdx = this.idx;
        this.loopCtr = entry[3];
        this.idx++;
      }
      else if (entry[2] == "end")
      {
        this.loopCtr--;
        if (this.loopCtr != 0)
        {
          this.idx = this.loopBeginIdx + 1;
        }
        else
        {
          console.log("LOOP DONE");
          this.idx++;
        }
      }
    }
    else
    {
      this.callbacks[entry[1]](entry.slice(2));
      this.idx++;
    }
    
    if (this.mode == "time")
    {
      this.initiateNext();
    }
  }

  reset()
  {
    this.idx = 0;
    this.playing = false;
    this.frame = 0;
    clearTimeout(this.timer);
  }
}
