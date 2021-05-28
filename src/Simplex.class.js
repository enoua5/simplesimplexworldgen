class Simplex
{
  constructor(seed="", stretch={})
  {
    this.seed=seed.toString().hashCode();
    stretch.x=stretch.x!=undefined?stretch.x:1;
    stretch.y=stretch.y!=undefined?stretch.y:1;
    stretch.z=stretch.z!=undefined?stretch.z:1;
    this.stretch=stretch;
  }
  
  getValue(x, y, octaves=3)
  {
    noise.seed(this.seed);
    let xp=x;
    let yp=y;
    let total=0;
    for(let i=0; i<octaves; i++)
    {
      total+=(2**-i)*noise.perlin2((xp/this.stretch.x)+0.1, (yp/this.stretch.y)+0.1);
      
      xp*=2;
      yp*=2;
    }
    return total;
  }
  getValue3D(x, y, z, octaves=3)
  {
    noise.seed(this.seed);
    let xp=x;
    let yp=y;
    let zp=z;
    let total=0;
    for(let i=0; i<octaves; i++)
    {
      total+=(2**-i)*noise.perlin3((xp/this.stretch.x)+0.1, (yp/this.stretch.y)+0.1, (zp/this.stretch.z)+0.1);
      
      xp*=2;
      yp*=2;
      zp*=2;
    }
    return total;
  }
}
