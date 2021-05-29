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
  
  let palette = "ocean_map";
  if(height > settings.ocean_height)
    palette = "beach_map";
  if(height > settings.ocean_height + settings.beach_height)
    palette = "plains_map";
  if(height > settings.mountain_base)
    palette = "mountains_map"
  ctx.drawImage(document.getElementById(palette), 0, 0, 256, 256);
  
  heat = refit(heat, -1, 1, 0, 255, true, true);
  humidity = refit(humidity, -1, 1, 0, 255, true, true);
  let c = ctx.getImageData(humidity, heat, 1, 1).data;
  
  return {red: c[0], green: c[1], blue: c[2]};
  
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
      // 0 = at pole, 1 = at equator
      let distanceToPole = 1-(2/h)*Math.abs(y-h/2);
      // if in icecap range...  
      if(distanceToPole < settings.ice/100)
      {
        // refit to a pole-to-edge-of-ice
        let distanceIntoIcecap = 1-refit(distanceToPole, 0, settings.ice/100, 0, 1);
        heat -= distanceIntoIcecap * settings.iceStrength;
      }
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
