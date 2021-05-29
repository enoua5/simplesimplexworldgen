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
  height = refit(height, -1, 1, 0, 255, true, true);
  heat = refit(heat, -1, 1, 0, 255, true, true);
  humidity = refit(humidity, -1, 1, 0, 255, true, true);
  
  return {red: heat, green: height, blue: humidity};
}

function draw(canvas, gens, settings)
{
  let ctx = canvas.getContext('2d');
  
  let newFrame = ctx.createImageData(canvas.width, canvas.height);
  let i = 0;
  
  for(let y = 0; y < canvas.height; y++)
  {
    for(let x = 0; x < canvas.width; x++)
    {
      let coord = GlobeNoise.pix_to_coord(x, y, settings.width, settings.height);
      let lat = coord.lat;
      let lon = coord.lon
      let height = gens.height.getValue(lat, lon, settings.height_octaves)
      let heat = gens.heat.getValue(lat, lon, settings.heat_octaves);
      let humidity = gens.humidity.getValue(lat, lon, settings.humidity_octaves);
      
      let color = getColor(height, heat, humidity, settings);
      
      newFrame.data[i++] = color.red;
      newFrame.data[i++] = color.green;
      newFrame.data[i++] = color.blue;
      newFrame.data[i++] = 255; // alpha
    }
  }
  ctx.putImageData(newFrame, 0, 0)
}
