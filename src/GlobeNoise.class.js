class GlobeNoise
{
  constructor(radius=1, generator=new Simplex())
  {
    this.radius=radius;
    this.generator=generator;
  }
  
  getValue(lat, lon, octaves=3)
  {
    let ls=((lat-Math.PI/2)%Math.PI)-Math.PI/2;//Math.atan(Math.tan(lat));
    
    let x=this.radius * Math.cos(ls) * Math.cos(lon);
    let y=this.radius * Math.cos(ls) * Math.sin(lon);
    let z=this.radius * Math.sin(ls);
    
    return this.generator.getValue3D(x,y,z,octaves)
  }
  
  static pix_to_coord(x, y, w = 200, h = 100, r = 0)
  {
    return {
      lon: (2*Math.PI*x)/w + r,
      lat:((Math.PI*y)/h)-Math.PI/2
    };
  }
}
