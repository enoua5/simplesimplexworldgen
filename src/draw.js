function refit(value, srcMin, srcMax, outMin, outMax, clamp = false, round = false)
{
  let srcSpan = srcMax - srcMin;
  let outSpan = outMax - outMin;
  
  let scaled = (value - srcMin) / srcSpan;
  
  let ret = outMin + (scaled * outSpan);
  
  if(round)
  {
    ret = Math.round(ret);
  }
  if(clamp)
  {
    ret = Math.min(ret, outMax);
    ret = Math.max(ret, outMin);
  }
  
  return ret;
}

function getColor(height, heat, humidity, settings)
{
  let ctx = colorPicker.getContext('2d');
  
  let palette = "ocean";
  if(height > settings.ocean_height)
    palette = "beach";
  if(height > settings.ocean_height + settings.beach_height)
    palette = "plains";
  if(height > settings.mountain_base)
    palette = "mountains"
  pal = pals[palette]
  
  heat = refit(heat, -1, 1, 0, 255, true, true);
  humidity = refit(humidity, -1, 1, 0, 255, true, true);
  let c = pal[humidity][heat];
  
  return {red: c.r, green: c.g, blue: c.b};
  
//  height = refit(height, -1, 1, 0, 255, true, true);
//  heat = refit(heat, -1, 1, 0, 255, true, true);
//  humidity = refit(humidity, -1, 1, 0, 255, true, true);
  
//  return {red: heat, green: height, blue: humidity};
}

function draw(canvas, gens, settings)
{
  let ctx = canvas.getContext('2d');
  
  let h = canvas.height;
  let w = canvas.width;
  
  let newFrame = ctx.createImageData(w, h);
  let i = 0;
  
  
  for(let y = 0; y < h; y++)
  {
    for(let x = 0; x < w; x++)
    {
      let coord = GlobeNoise.pix_to_coord(x, y, settings.width, settings.height);
      let lat = coord.lat;
      let lon = coord.lon;
      let height = gens.height.getValue(lat, lon, settings.height_octaves) + settings.height_bias;
      
      
      let heat = gens.heat.getValue(lat, lon, settings.heat_octaves) + settings.heat_bias;
      // -1 = at pole, 0 = 45th parallel, 1 = at equator
      let latHeatMult = Math.cos(2*lat);
      heat -= latHeatMult*settings.latHeat;
      
      
      if(height > settings.iceAltitude)
      {
        heat -= settings.iceAltitudeStrength;
      }
      
      
      let humidity = gens.humidity.getValue(lat, lon, settings.humidity_octaves) + settings.humidity_bias;
      
      let color = getColor(height, heat, humidity, settings);
      
      newFrame.data[i++] = color.red;
      newFrame.data[i++] = color.green;
      newFrame.data[i++] = color.blue;
      newFrame.data[i++] = 255; // alpha
    }
  }
  ctx.putImageData(newFrame, 0, 0)
}
