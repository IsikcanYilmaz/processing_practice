var DEFAULT_DT = 1/30;
var DEFAULT_IMPULSE_DECAY = 1/10;

class Impulse
{
  constructor(dt, decay)
  {
    this.dt = (dt) ? dt : DEFAULT_DT;
    this.decay = (decay) ? decay : DEFAULT_IMPULSE_DECAY;
    this.val = 1.0;
    this.t = 0;
  }

  reset()
  {
    this.t = 0;
    this.val = 1.0;
  }

  update()
  {
    this.t += this.dt;
    this.val = this.runFunc();
  }

  runFunc()
  {
    return this.val - (this.val * this.decay);
  }

  getVal()
  {
    return (this.val > 0) ? this.val : 0;
  }
}

class Constant
{
  constructor(val)
  {
    this.val = (val) ? val : 1.0;
  }

  reset()
  {
  }

  update()
  {
  }

  runFunc()
  {
  }

  getVal()
  {
    return this.val;
  }
}

class Oscillator
{
  constructor(phase, freq, dt)
  {
    this.dt = (dt) ? dt : DEFAULT_DT;
    this.initPhase = phase;
    this.freq = freq;
    this.period = 1/freq;
    this.t = 0;
    this.val = this.runFunc();
  }

  reset()
  {
    this.t = 0;
    this.val = this.runFunc();
  }

  runFunc()
  {
    return Math.sin(2 * PI * this.freq * this.t + this.initPhase);
  }

  update()
  {
    this.t += this.dt;
    this.val = this.runFunc();
  }

  setFreq(freq)
  {
    this.freq = freq;
  }

  setDt(dt)
  {
    this.dt = dt;
  }

  getVal()
  {
    return this.val;
  }
}
