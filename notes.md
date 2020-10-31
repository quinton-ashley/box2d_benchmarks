Some performance notes:
- array destructuring seems very slow. object destructuring is not problematic.
- Array.from({length}, fn) is slower than populating an array after settings its length
  - fastest seems to be new Array(length), then loop set entries
- array spread is slower than copying using via the above method
- array.slice is faster than [...original]
- reduce amount of new calls
- reduce amount of clone calls
- verify all usages of Copy are valid

Style notes:
- move out parameter of math functions to the start to have a = b + c order. i.e. add(out,a,b) rather than add(a,b,out)
- Make attributes and methods private or protected again as in the original.
