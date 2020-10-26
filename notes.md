Some performance notes:
- array destructuring seems very slow. object destructuring is not problematic.
- Array.from({length}, fn) is slower than populating an array after settings its length
  - fastest seems to be new Array(length), then loop set entries
- array spread is slower than copying using via the above method
- array.slice is faster than [...original]
