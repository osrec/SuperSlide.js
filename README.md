# superslide.js

![SuperSlide.js Logo](https://osrec.github.io/superslide.js/logo.png)

A flexible, smooth, GPU accelerated sliding menu for your next PWA. Makes use of promises and very lightweight.

Created by the [Bx team](https://usebx.com) at [OSREC Technologies](https://osrec.co.uk). 

![Bx](https://www.usebx.com/web/img/Bx64.png)

The library was developed as part of our business and project management app called Bx ([you can check it out here](https://usebx.com)).

Live Demo: https://osrec.github.io/superslide.js/demo.html

A pro version, with more animations is available at https://osrec.co.uk/products/superslidejs

Enjoy :)

## Quickstart

Reference the library in a script tag

```html
<script src='superslide.js'></script>
```
Add basic HTML markup

```html
<body>
  <div id='content'>Content</div>
  <div id='menu'>Menu</div>
</body>
```

Add styles (so we can see what's going on!)

```html
<style>
  body     { padding: 0px; margin: 0px; }
  #menu    { background: #ccc; }
  #content { min-height: 100vh; min-width: 100vw; }
</style>
```

Initialise the menu

```javascript
var myMenu = new OSREC.superslide
({
    slider: document.getElementById('menu'),
    content: document.getElementById('content'),
    // Set additional parameters (see full docs)
});

// Promise resolves once menu is open
var openPromise = myMenu.open();
```

## Full Documentation

There are a large number of configurable parameters and callbacks you can use to control the menu (including animation, behaviours and a variety of tolerances).

[Click here for superslide.js documentation](https://osrec.co.uk/products/superslidejs#docs)
