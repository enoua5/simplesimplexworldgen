function createNDArray(dimensions, fill=undefined)
{
  if(dimensions.length==0)
    return fill;
    
  let a=new Array(dimensions[0]);
  a.fill(fill);
  for(let i in a)
    a[i]=createNDArray(dimensions.slice(1,a.length), fill);
  return a;
}
