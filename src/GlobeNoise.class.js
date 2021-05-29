class GlobeNoise
{
  constructor(radius=1, generator=new Simplex())
  {
    this.radius=radius;
    this.generator=generator;
  }
  
  getValue(lat, lon, octaves=3)
  {
    let x = this.radius * Math.cos(lon) * Math.sin(lat);
    let y = this.radius * Math.sin(lon) * Math.sin(lat);
    let z = this.radius * Math.cos(lat)
    
    return this.generator.getValue3D(x,y,z,octaves);
  }
  
  static pix_to_coord(x, y, w = 200, h = 100, r = 0)
  {
    // this shouldn't be correct, but aparantly it is?? 
    return {
      lon: refit(x/2, 0, w/2, -Math.PI, Math.PI),
      lat: refit(y/2, -h/2, h/2, -Math.PI, Math.PI)
    };
  }
}
