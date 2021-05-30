function key_entry(color, name)
{
  return {color, name};
}

// NOTE: changing these values will not change the colors used in on the map, and vice versa. Make sure they stay in sync
var biome_key = [
  key_entry("#b2b2b2", "Polar ice"),
  key_entry("#23357e","Cold ocean"),
  key_entry("#1828c6","Temprate ocean"),
  key_entry("#3075ca","Warm ocean"),
  
  key_entry("#a6a687","Gravel beach"),
  key_entry("#f4d0b3","Sand beach"),
  
  key_entry("#dddddd","In-land glacier"),
  key_entry("#8cccbd","Tundra"),
  key_entry("#00574e","Taiga"),
  key_entry("#c3d88b","Cold grasslands"),
  key_entry("#00714e","Subtemprate forest"),
  
  
  
  key_entry("#f5e759","Temprate steppe"),
  key_entry("#92d847","Temprate forest"),
  key_entry("#2e5900","Swamp"),
  key_entry("#697a41","Dry forest"),
  key_entry("#439537","Temprate rainforest"),
  
  key_entry("#066806","Jungle"),
  key_entry("#004600","Rainforest"),
  key_entry("#9b950e","Tree savanna"),
  key_entry("#c1bd3e","Grass savanna"),
  key_entry("#886f33","Dry steppe"),
  key_entry("#d6a972","Semiarid desert"),
  key_entry("#814229","Arid desert"),
  
  key_entry("#7b9168","Temprate mountains"),
  key_entry("#607a22","Jungle mountains"),
  key_entry("#e57a22","Desert mountains"),
  key_entry("#507156","Taiga mountains"),
  key_entry("#7e7e7e","Tundra mountains"),
];

function findClosestColor(color, palette)
{
  let closest = null;
  let dist = Infinity;
  for(let c of palette)
  {
    let color2 = hexToRgb(c.color);
    let newDist = getColorDistance(color, color2);
    if(newDist < dist)
    {
      dist = newDist;
      closest = c;
    }
  }
  
  return closest;
}

function getColorDistance(rgb1, rgb2)
{
  return Math.sqrt((rgb1.red - rgb2.red) ** 2 + (rgb1.green - rgb2.green) ** 2 + (rgb1.blue - rgb2.blue) ** 2);
}

function hexToRgb(hex)
{
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if(!result) console.log(hex)
  return result ? {
    red: parseInt(result[1], 16),
    green: parseInt(result[2], 16),
    blue: parseInt(result[3], 16)
  } : null;
  
}

function showData(e)
{
  let rect = e.target.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  
  
  let coord = GlobeNoise.pix_to_coord(x, y, e.target.width, e.target.height, settings.rotation);
  
  let lon = coord.lon * (180/Math.PI);
  let ew = lon > 0 ? "E" : "W";
  lon = Math.abs(lon);
  
  // a bit funkier because pix_to_coord is a but funky
  let lat = (coord.lat - Math.PI/2) * (180/Math.PI);
  let ns = lat > 0 ? "S" : "N";
  lat = Math.abs(lat);
  
  lon = lon.toFixed(2);
  lat = lat.toFixed(2);
  
  document.getElementById("location").innerHTML = `${lat}&deg ${ns}, ${lon}&deg; ${ew}`;
  
  let ctx = e.target.getContext('2d');
  let data = ctx.getImageData(x,y,1,1).data;
  
  let color = {red: data[0], green: data[1], blue: data[2]};
  let biome = findClosestColor(color, biome_key).name;
  
  document.getElementById("biome").innerText = biome;
  
  prepGenerators(gens, settings_on_last_gen);
  let hhh = get3h(coord, gens, settings_on_last_gen);

  let height_m = refit(hhh.height, -1, 1, -7000, 7000);
  let sealevel_m = refit(settings_on_last_gen.ocean_height, -1, 1, -10000, 10000);
  let m_above_sealevel = height_m - sealevel_m;
  let toSea = m_above_sealevel < 0 ? "below" : "above";
  m_above_sealevel = Math.abs(m_above_sealevel);
  let ft_above_sealevel = m_above_sealevel * 3.28084;
  
  let adjusted_heat = hhh.heat
  if(hhh.heat < -1)
  {
    let outside_range = hhh.heat + 1;
    adjusted_heat += outside_range * 2;
  }
  let temp_c = refit(adjusted_heat, -1, 1, -20, 40);
  let temp_f = (temp_c * 9/5) + 32;
  
  let rainfall_mm = refit(hhh.humidity, -1, 1, -500, 2500);
  rainfall_mm = Math.max(rainfall_mm, 0);
  let rainfall_in = rainfall_mm * 0.0393701;
  
  document.getElementById("height").innerText = `${m_above_sealevel.toFixed(0)} m (${ft_above_sealevel.toFixed(0)}') ${toSea} sea level`;
  document.getElementById("heat").innerHTML = `${temp_c.toFixed(0)}&deg;C (${temp_f.toFixed(0)}&deg;F) annual average temperature`;
  document.getElementById("humidity").innerText = `${rainfall_mm.toFixed(0)} mm (${rainfall_in.toFixed(0)}") annual average percipitation`;
}

function clearData()
{
  document.getElementById("location").innerText = "";
  document.getElementById("biome").innerText = "";
  document.getElementById("height").innerText = "";
  document.getElementById("heat").innerText = "";
  document.getElementById("humidity").innerText = "";
}
