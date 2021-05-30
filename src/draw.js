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

function prepGenerators(gens, settings)
{
  gens.height.generator.seed =  settings.height_seed;
  gens.heat.generator.seed = settings.heat_seed;
  gens.humidity.generator.seed = settings.humidity_seed;
  
  gens.height.radius =  settings.height_radius;
  gens.heat.radius = settings.heat_radius;
  gens.humidity.radius = settings.humidity_radius;
}

function get3h(coords, gens, settings) // 3h = Height, Heat, Humidity
{
  let lat = coords.lat;
  let lon = coords.lon;
  
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
  
  return {height, heat, humidity};
}

function drawLine(ctx, frame, y, gens, settings)
{
  let w = frame.width;
  let i = 4 * w * y;
  
  for(let x = 0; x < w; x++)
  {
    let coord = GlobeNoise.pix_to_coord(x, y, settings.width, settings.height, settings.rotation);
    let hhh = get3h(coord, gens, settings);
    
    let color = getColor(hhh.height, hhh.heat, hhh.humidity, settings);
    
    frame.data[i++] = color.red;
    frame.data[i++] = color.green;
    frame.data[i++] = color.blue;
    frame.data[i++] = 255; // alpha
  }
  
  if(y + 1 >= frame.height)
  {
    document.getElementById("submit_button").disabled = false;
    document.getElementById("submit_button").innerText = "Redraw";
    ctx.putImageData(frame, 0, 0);
  }
  else
  {
    document.getElementById("submit_button").innerText = Math.floor(100*y/frame.height) + '%';
    // to avoid hanging the page
    setTimeout(function(){
      drawLine(ctx, frame, y+1, gens, settings);
    },0);
  }
}

function draw(canvas, gens, settings)
{
  prepGenerators(gens, settings);
  
  for(let i in settings) settings_on_last_gen[i] = settings[i];
  
  let ctx = canvas.getContext('2d');
  
  let h = canvas.height;
  let w = canvas.width;
  
  let newFrame = ctx.createImageData(w, h);
  let i = 0;
  
  document.getElementById("submit_button").disabled = true;
  // each calls the next line using setTimout to avoid hangs
  drawLine(ctx, newFrame, 0, gens, settings);
}
