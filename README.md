QRCodeJS
========

Project can be easily demonstrated on a Linux computer by executing src/server.sh
and navigating to http://localhost:8080/page.html on a browser.

To test that the QR encodes correctly you can right-click on the image and
download it, and decode it using an online decoder. Such as
http://zxing.org/w/decode.jspx


## To Do:

Encoding
  - [ ] Determine the best mask pattern using the evaluations conditions. Currently we just use any mask pattern.

Decoding
  - [x] Visually Recognize the matrix in an image.
  - [ ] Use the Error Codewords to check for errors in the message.
