/**
 * The logic for doing Reed Solomon error correction.
 *
 * A lot of the information in this file is from this website:
 * http://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders
 *
 * In this file polynomials are represented as arrays where the nth power of x
 * is the nth element in the array.
 * Ex: 4x^4 + 2x^3 + 0x^2 + 6x^1 + 8 becomes
 * [8, 6, 0, 3, 4]
 * Note the zero is for the second power of x
 */

/**
 * The arrays for quickly findng 2^x and lg(x) (lg is log base 2)
 */
gf_exp = new Array(512+1).join('0').split('');
gf_log = new Array(256+1).join('0').split('');

/**
 * Initialize the gf_exp and gf_log arrays.
 */
initGaliosFieldNums = function() {
  gf_exp[0] = 1;
  gf_log[0] = 0;
  gf_log[1] = 0;
  x = 1;
  for (var i = 1; i < 255; ++i) {
     x <<= 1;
     if (x & 0x100) {
        x ^= 0x11d;
     }
     gf_exp[i] = x;
     gf_log[x] = i;
  }
  // Under Galois 256 we are only supposed to have 256 numbers, and are
  // therefore supposed to take any numbers bigger than 255 and use x % 255 to
  // get the appropriate number, but since numbers should never be greater than
  // 511, we can just copy the first half of the array into the last half and
  // avoid this modulo arithmetic.
  for (var i = 255; i < 512; ++i) {
     gf_exp[i] = gf_exp[i-255];
  }
  gf_log[gf_exp[255]] = 255;
};

/**
 * Multiply two numbers under Galois Arithmetic.
 */
gf_mul = function(x, y) {
  if (x == 0 || y == 0) {
    return 0;
  }
  return gf_exp[gf_log[x] + gf_log[y]];
};

/**
 * Divide two numbers under Galois Arithmetic.
 */
gf_div = function(x,y){
  if (y == 0) {
    return -1;
  }
  if (x == 0) {
    return 0;
  }
  return gf_exp[gf_log[x] + 255 - gf_log[y]];
};

/**
 * Multiply a polynomial by the constant x.
 */
gf_poly_scale = function(p, x) {
  r = new Array(p.length);
  for (var i = 0; i < p.length; ++i) {
    r[i] = gf_mul(p[i], x);
  }
  return r;
}

/**
 * Add two polynomials together.
 */
gf_poly_add = function(p, q) {
  r = new Array(Math.max(p.length, q.length));
  for (var i = 0; i < r.length; ++i) {
    r[i] = 0;
  }
  for (var i = 0; i < p.length; ++i) {
    r[i + r.length - p.length] = p[i];
  }
  for (var i = 0; i < q.length; ++i) {
    r[i + r.length - q.length] ^= q[i]
  }
  return r
};

/**
 * Multiply two polynomials together.
 */
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

/**
 * Evaluate the polynomial 'p' with the input 'x'
 */
gf_poly_eval = function(p, x) {
  var y = p[0];
  for (var i = 1; i < p.length; ++i) {
    y = gf_mul(y, x) ^ p[i];
  }
  return y;
};

/**
 * Create the generator polynomial for 'n' error correction codewords.
 *
 * Ex: (x - α^0)(x - α^1) ... (x - α^n-1)
 */
create_generator_poly = function(n) {
  g = [1];
  for (var i = 0; i < n; ++i) {
    g = gf_poly_mul(g, [1, gf_exp[i]]);
  }
  return g;
};

/**
 * Encode the message with the given number of Error Correction Codewords.
 */
rs_encode_msg = function(msg_in, nsym) {
  gen = create_generator_poly(nsym);
  return rs_encode_msg_with_gen(msg_in, nsym, gen);
};

/**
 * Encode the message with the given number of Error Correction Codewords, and
 * generator polynomial.
 */
rs_encode_msg_with_gen = function(msg_in, nsym, gen){
  msg_out = new Array(msg_in.length + nsym);
  for (var i = 0; i < msg_out.length; ++i) {
    msg_out[i] = 0;
  }
  for (var i = 0; i < msg_in.length; ++i) {
    msg_out[i] = msg_in[i];
  }
  for (var i = 0; i < msg_in.length; ++i) {
    var coef = msg_out[i];
    if (coef != 0) {
      for (var j = 0; j < gen.length; ++j) {
        msg_out[i+j] ^= gf_mul(gen[j], coef);
      }
    }
  }
  return msg_out.slice(msg_in.length);
};

/**
 * Generates the error codewords for the given data blocks, version, and error correction level.
 */
generateErrorCodewords = function(blocks, version, ecl) {
  var errorCodewordsPerBlock = getErrorCodewordsPerBlock(version, ecl, blocks.length);
  for (var i = 0; i < blocks.length; ++i) {
    dataCW = blocks[i].dataCodewords;
    blocks[i].errorCodewords = rs_encode_msg(dataCW, errorCodewordsPerBlock);
  }
  return blocks;
};

/**
 * Calculates the 'syndromes' for the input message. Should evaluate to zero if
 * there are no errors.
 */
rs_calc_syndromes = function(msg, nsym) {
   var synd = new Array(nsym);
   for (var i = 0; i < nsym; ++i) {
     synd[i] = gf_poly_eval(msg, gf_exp[i])
   }
   return synd
};

/**
 * Corrects errors at known locations.
 */
rs_correct_errata = function(msg, synd, pos) {
  // calculate error locator polynomial
  var q = [1];
  for (var i = 0; i < pos.length; ++i) {
     var x = gf_exp[msg.length - 1 - pos[i]];
     q = gf_poly_mul(q.slice(0), [x,1]);
  }
  // calculate error evaluator polynomial
  var p = synd.slice(0, pos.length);
  p.reverse();
  p = gf_poly_mul(p.slice(0), q);
  p = p.slice(p.length - pos.length, p.length);
  // formal derivative of error locator eliminates even terms
  var qprime = [];
  // Grab every other element, skipping the first element if the length is odd.
  for (var i = q.length % 2; i < q.length; i += 2) {
    qprime.push(q[i]);
  }
  // compute corrections
  for (var i = 0; i < pos.length; ++i) {
    var x = gf_exp[pos[i] + 256 - msg.length];
    var y = gf_poly_eval(p, x);
    var z = gf_poly_eval(qprime, gf_mul(x,x));
    msg[pos[i]] ^= gf_div(y, gf_mul(x,z));
  }
};

/**
 * Finds the errors in a polynomial.
 */
rs_find_errors = function(synd, nmess){
  // find error locator polynomial with Berlekamp-Massey algorithm
  var err_poly = [1];
  var old_poly = [1];
  for (var i = 0; i < synd.length; ++i) {
    old_poly.push(0);
    var delta = synd[i];
    for (var j = 1; j < err_poly.length; ++j) {
      delta ^= gf_mul(err_poly[err_poly.length-1-j], synd[i-j]);
    }
    if (delta != 0) {
      if (old_poly.length > err_poly.length) {
         var new_poly = gf_poly_scale(old_poly, delta);
         old_poly = gf_poly_scale(err_poly, gf_div(1, delta));
         err_poly = new_poly;
      }
      err_poly = gf_poly_add(err_poly, gf_poly_scale(old_poly, delta))
    }
  }
  var errs = err_poly.length - 1;
  if (errs*2 > synd.length) {
    return null;    // too many errors to correct
  }
  // find zeros of error polynomial
  var err_pos = [];
  for (var i = 0; i < nmess; ++i) {
    if (gf_poly_eval(err_poly, gf_exp[255-i]) == 0) {
      err_pos.push(nmess-1-i);
    }
  }
  if (err_pos.length != errs) {
    return null;
  }

  return err_pos;
};

/**
 * Calculate the 'forney syndromes' to prevent the erasures from interfering
 * with the error location process.
 */
rs_forney_syndromes = function(synd, pos, nmess) {
  var fsynd = synd.slice(0);      // make a copy
  for (var i = 0; i < pos.length; ++i) {
    x = gf_exp[nmess-1-pos[i]];
    for (var j = 0; j < fsynd.length - 1; ++j) {
      fsynd[j] = gf_mul(fsynd[j], x) ^ fsynd[j+1];
    }
    fsynd.pop();
  }
  return fsynd;
}

/**
 * Attempts to correct the errors in a message.
 */
rs_correct_msg = function(msg_in, nsym) {
  var msg_out = msg_in.slice(0);     // copy of message
  // find erasures
  var erase_pos = [];
  for (var i = 0; i < msg_out.length; ++i) {
    if (msg_out[i] < 0) {
       msg_out[i] = 0;
       erase_pos.push(i);
    }
  }
  if (erase_pos.length > nsym) {
    console.warn("Too many erasures to correct");
    return false;     // too many erasures to correct
  }
  var synd = rs_calc_syndromes(msg_out, nsym);
  if (Math.max.apply(null, synd) == 0) {
    return msg_out;  // no errors
  }
  var fsynd = rs_forney_syndromes(synd, erase_pos, msg_out.length);
  var err_pos = rs_find_errors(fsynd, msg_out.length);
  if (err_pos == null || err_pos.length == 0) {
    console.warn("Error Location Failed");
    return false;    // error location failed
  }
  rs_correct_errata(msg_out, synd, erase_pos.concat(err_pos));
  synd = rs_calc_syndromes(msg_out, nsym);
  if (Math.max.apply(null, synd) > 0) {
    console.warn("Message still not right after correction");
    return false;     // message is still not right
  }
  return msg_out;
};

initGaliosFieldNums();
