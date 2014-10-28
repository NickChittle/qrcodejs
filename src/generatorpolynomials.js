




gf_exp = new Array(512+1).join('0').split('');
gf_log = new Array(256+1).join('0').split('');

initGaliosFieldNums = function() {
  gf_exp[0] = 1;
  gf_log[0] = 0;
  gf_log[1] = 0;
  x = 1;
  for (var i = 1; i < 254; ++i) {
     x <<= 1;
     if (x & 0x100) {
        x ^= 0x11d;
     }
     gf_exp[i] = x;
     gf_log[x] = i;
  }
  for (var i = 255; i < 512; ++i) {
     gf_exp[i] = gf_exp[i-255];
  }
  gf_log[gf_exp[255]] = 255;
};

gf_mul = function(x, y) {
  if (x == 0 || y == 0) {
    return 0;
  }
  return gf_exp[gf_log[x] + gf_log[y]];
};

gf_poly_mul = function(p, q) {
  r = new Array(p.length + q.length - 1);
  for (var i = 0; i < r.length; ++i) {
    r[i] = 0;
  }
  for (var j = 0; j < q.length; ++j) {
    for (var i = 0; i < p.length; ++i) {
      r[i+j] ^= gf_mul(p[i], q[j]);
    }
  }
  return r;
};

create_generatory_poly = function(n) {
  g = [1];
  for (var i = 0; i < n; ++i) {
    g = gf_poly_mul(g, [1, gf_exp[i]]);
  }
  return g;
};

initGaliosFieldNums();
for (i = 0; i < 20; ++i) {
  //console.warn("i " + gf_exp[i]);
  console.warn(i, gf_exp[i], gf_log[i]);
}
console.warn(create_generatory_poly(7));
