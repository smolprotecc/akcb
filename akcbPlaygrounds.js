/*
   credits:
     close button - https://codepen.io/JeromeRenders/pen/GqjxVL
     arrows       - https://codepen.io/varystrategic/pen/zGrMQK
 */

akcbPlaygrounds = (function() {

  let body; 
  // Statics
  let CSSIdentifier = 'akcb-playgrounds'
  let provider      = 'https://ipfs.io/ipfs/'
  let metadataURL   = provider + 'QmRiP1c1j5Lobzb6SpP5pJfC1kyHjnGyGNRg5kfgiUTgSD/FILENUMBER'
  let marketplaceURL= 'https://opensea.io/collection/akidcalledbeast?search[sortAscending]=true&search[sortBy]=UNIT_PRICE&search[stringTraits][0][name]=REPLACELABEL&search[stringTraits][0][values][0]=REPLACEITEM'

  let floors = [
  {name: 'floor',
   file: 'issa_floor.glb',
   url : 'https://sketchfab.com/3d-models/issa-floor-3b4cce01aff84d4498cd2d405e74d970',
   auth: 'nasimi',
   scale   : 0.06,
  },
  {name: 'marble',
   file: 'marble_tile_floors.glb',
   url : 'https://sketchfab.com/3d-models/marble-tile-floors-9317c3a26b00470d9a0e3cb000607a87',
   auth: 'berg.holmgren',
  },
  /*
  {name: 'stein',
   file: 'stein_low_fbx.glb',
   url : 'https://sketchfab.com/3d-models/stein-low-fbx-553bc76396af4af2bf8a334d815935df',
   auth: 'EvenBridge',
  },*/
  {name: 'tile',
   file: 'tile.glb',
   url : 'https://sketchfab.com/3d-models/tile-3762fe67374949838d948766cb1ddb65',
   auth: 'Lusans2002',
   scale   : 0.08,
   rotation: Math.PI,
  },
  {name: 'castle',
   file: 'castle_stone_floor.glb',
   url : 'https://sketchfab.com/3d-models/castle-stone-floor-68ddb29e025e43f7ae0993010b7dd7cb',
   auth: 'Paul (paul3uk)',
   scale   : 0.3,
   rotation: -Math.PI/2,
   y       : -0.4,
  },
  ]

  // Computational/State
  let interactable  = true
  let details;
  let attributePriority = ['DNA', 'Beasthood'] // not sure why this is inverted but we will get what we want: Beasthood > DNA
  let floorPosition = 0

  let events = {
    newAKCBNumber: 'new-akcb-number',
    loadingModelStart   : 'loading-model-start',
    loadingModelComplete: 'loading-model-complete',
    reloadFloor         : 'reload-floor',
    loadingFloorStart   : 'loading-floor-start',
    loadingFloorComplete: 'loading-floor-complete',
  }

  let raiseEvent = function(target, event, datum) { target.dispatchEvent(new CustomEvent(event, {detail: datum})) }
  /* Custom Sorting */
  /* https://stackoverflow.com/a/27645164 */
  let sort_by = function(field, reverse, primer){
    var key = primer ? 
      function(x) {return primer(x[field]); }:
      function(x) {return x[field] };
    reverse = [-1, 1][+!!reverse];
    return function (a, b) {
      a = key(a);
      b = key(b);
      return a==b ? 0 : reverse * ((a > b) - (b > a));
      //^ Return a zero if the two fields are equal!
    }
  }

  let chainSortBy = function(sortByArr) {
    return function(a, b) {
      for (var i=0; i<sortByArr.length; i++) {
        var res = sortByArr[i](a,b);
        if (res != 0)
          return res; //If the individual sort_by returns a non-zero,
                      //we found inequality, return the value from the comparator.
        }
        return 0;
    }
  }

  let retrieveFloor = async function() {
    raiseEvent(body, events.loadingFloorStart)
    let uri = 'environment/' + floors[floorPosition].file
    return await retrieve(uri)
      .then((url)  => {
        raiseEvent(body, events.reloadFloor, [url, floors[floorPosition]]) 
        raiseEvent(body, events.loadingFloorComplete)
        return url
      })
  }

  let updateFloor = function(dir) {
    if (dir == 'right') {
      floorPosition++
      if (floorPosition >= floors.length) { floorPosition = 0 }
    } else if (dir == 'left') {
      floorPosition--
      if (floorPosition < 0) { floorPosition = floors.length - 1 }
    }
    let floor = floors[floorPosition]
    console.log(floor)
    retrieveFloor()
  }

  let toggleHUD = function() {
    let toggle = document.querySelector('#akcb-minimise')
    let children = document.querySelector('#akcb-hud').children

    let state = toggle.classList.contains('near-invisible')

    for (var i = 0; i < children.length; i++) {
      let child = children[i]
      if (child.id != 'akcb-minimise') {
        if (!state) { child.classList.add('hidden') } else { child.classList.remove('hidden') }
      }
    }
    if (state) { toggle.classList.remove('near-invisible') } else { toggle.classList.add('near-invisible') }
  }

  let searchFor = function(key, trait) {
    let url = marketplaceURL.replace('REPLACELABEL', key.replace(/\s/g,'%20')).replace('REPLACEITEM', trait.replace(/\s/g,'%20'))
    console.log('Opening...' + url)
    window.open(url, '_blank').focus()
  }

  let updateAttributes = function() {
    if (!details) { return }
  
    let contentPanel = document.querySelector('#akcb-attribute-panel-content')
    // Clear previous panel
    contentPanel.innerHTML = ''

    // We need a neater sorting algorithm, too sleepy to do this now
    let list = details.attributes
    list.sort(chainSortBy([
      sort_by('trait_type', false, function(a, b) { return attributePriority.indexOf(a) - attributePriority.indexOf(b) }),
      sort_by('trait_type', true, null)
    ]))
    console.log(list)

    let template = '<div class="attribute-item"><div class="attribute-label">REPLACELABEL</div><div class="attribute-value" onclick="akcbPlaygrounds.searchFor(\'REPLACELABEL\',\'REPLACEITEM\')">REPLACEITEM</div></div>'
    let output = ''
    list.forEach(item => {
      output += template.replace(/REPLACELABEL/g, item.trait_type).replace(/REPLACEITEM/g, item.value)
    })
    contentPanel.insertAdjacentHTML('beforeend', output)
  }

  let loadingFloorStart = function() {

  }

  let loadingFloorComplete = function() {

  }

  let loadingModelStart = function() {
    console.log('Loading model...')
    // deactivate the Enter keys and GO button
    interactable = false
    // add the loader
    document.querySelector('#akcb-hud-number').insertAdjacentHTML('beforeend', '<div class="loader"></div>')
    // remove ability to interact with number
    document.querySelector('#akcb-hud-number input').disabled = true
    // defocus
    document.querySelector('#akcb-hud-number input').blur()
  }

  let loadingModelComplete = function() {
    console.log('Model loaded.')
    // reactivate the Enter keys and GO button
    interactable = true
    // remove the loader
    document.querySelector('#akcb-hud-number .loader').remove()
    // restore ability to interact with the number 
    document.querySelector('#akcb-hud-number input').disabled = false
    // populate the attribute panel
    updateAttributes()
  }

  let remember = function(data) {
    details = data
  }

  let retrieve = async function(url) {
    return await fetch(url)
      .then((res)  => { console.log(res); return res.body })
      .then((body) => {
        const reader = body.getReader()
        return new ReadableStream({
          start(controller) {
            return pump()
            function pump() {
              return reader.read().then(({done, value}) => {
                if (done) {
                  controller.close()
                  return
                }
                controller.enqueue(value)
                return pump()
              })
            }
          }
        })
      })
      .then((stream) => new Response(stream))
      .then((res)  => res.blob())
      .then((blob) => URL.createObjectURL(blob))
  }

  let retrieveAKCB = async function(which) {
    raiseEvent(body, events.loadingModelStart)
    return await fetch(metadataURL.replace('FILENUMBER', which))
      .then((res)  => res.json())
      .then((data) => { remember(data); return data })
      .then((data) => { console.log(data); return data.animation_url })
      .then((uri)  => retrieve(uri.replace('ipfs://', provider)))
      .then((url)  => {
        raiseEvent(body, events.loadingModelComplete)
        return url
      })
  }

  let update = async function(which) {
    if (!interactable) { return }
    let n;
    if (which) {
      n = which
    } else {
      n = document.querySelector('#akcb-hud-number input').value
    }
    if (typeof n == 'string' && n.match(/\D+/)) { console.log('Non-digit request'); return false }
    if (typeof n == 'string' && n.length <= 0)  { console.log('Too short'); return false }
    
    let datum = await retrieveAKCB(n)
    console.log(datum)

    raiseEvent(body, events.newAKCBNumber, datum) 
  }

  let markup = `
    <div id='akcb-hud'>
    <!-- Selector -->
    <div id='akcb-hud-number'><input placeholder="6262"></input><div id='akcb-hud-number-go' onclick='akcbPlaygrounds.update()'>go</div></div>
    <!-- Attribute panel -->
    <div id='akcb-attribute-panel'>
      <div id='akcb-attribute-panel-background'></div>
      <div id='akcb-attribute-panel-content'></div>
    </div>
    <!-- Minimise button -->
    <div id='akcb-minimise'>
      <div id='akcb-minimise-background'></div>
      <button id='akcb-minimise-button' class='on' onclick='akcbPlaygrounds.toggleHUD()'><span></span><span></span><span></span></button>
    </div>
    <!-- Floor arrows -->
    <div id='akcb-floors'>
      <a href='#' class='akcb-arrow left'  onclick='akcbPlaygrounds.updateFloor(\"left\")'></a>
      <a href='#' class='akcb-arrow right' onclick='akcbPlaygrounds.updateFloor(\"right\")'></a>
    </div>
    </div>
  `
  let cssRules = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans&display=swap');
    canvas {
     outline: none;
     -webkit-tap-highlight-color: rgba(255, 255, 255, 0); /* mobile webkit */
    }
    .hidden {
      opacity: 0;
      pointer-events: none !important;
    }
    .near-invisible {
      opacity: 0.13;
    }
    .center {
      position: absolute;
      left    : 50%;
      top     : 50%;
      transform: translate( -50%, -50% );
    }
    #akcb-hud {
      position: absolute;
      left: 0%;
      top : 0%;
      height: 100%;
      width : 100%;
    }
    #akcb-hud {
      z-index: 50;
      pointer-events:none; 
    }
    #akcb-hud-number {
      pointer-events:all; 
      position: absolute;
      right   : 1.1em;
      top     : 0.6em;
      width   : 7.0em;
      height  : 3.6em;
      /* styling */
      font-size : 16pt;
      border-radius: 6px;
      overflow: hidden;
      font-family: 'Nunito Sans', sans-serif;
    }
    #akcb-hud-number input {
      /* reset style */
      border  : none;
      outline : none;
      padding : 0em;
      /* positioning */
      width   : 60%;
      height  : 100%;
      /* styling */
      font-size : 16pt;
      text-align: center;
      background: rgba( 255, 255, 255, 0.45 );
      transition: all 120ms;
    }
    #akcb-hud-number:hover input,
    #akcb-hud-number input:focus {
      background: rgba( 255, 255, 255, 0.95 );
    }
    #akcb-hud-number-go {
      /* positioning */
      position: absolute;
      right   : 0%;
      top     : 0%;
      height  : 100%;
      width   : 40%;
      /* styling */
      background : rgba( 1, 1, 1, 0.11 );
      text-align : center;
      line-height: 3.5em;
      color      : rgba( 188, 188, 188, 1.00 );
      font-size  : 16pt;
      cursor     : pointer;
      transition : all 120ms;
      user-select: none;
    }
    #akcb-hud-number-go:hover {
      background : rgba( 1, 1, 1, 0.23 );
    }

    #akcb-hud-number .loader {
      position   : absolute;
      top        : calc((100% - 50px)/3);
      left       : calc(60%/6);
      transform  : translate( -50%, -50% );
    }

    .loader {
      border    : 5px solid #f3f3f3; /* Light grey */
      border-top: 5px solid #555; /* Grey */
      border-radius: 50%;
      width    : 50px;
      height   : 50px;
      animation: loadingSpinner 2s linear infinite;
    }

    @keyframes loadingSpinner {
        0% { transform: rotate(0deg);   }
      100% { transform: rotate(360deg); }
    }

    .unselectable {
      user-select: none;
    }

    #akcb-attribute-panel {
      pointer-events: all;
      position: absolute;
      left    : 1.1em;
      top     : 0.6em;
      width   : 14em;
      height  : calc(100% - 0.6em*2);
      /* styling */
      font-size : 16pt;
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
      overflow: hidden;
      font-family: 'Nunito Sans', sans-serif;
    }
    #akcb-attribute-panel-background,
    #akcb-attribute-panel-content {
      position: absolute;
      left: 0%;
      top : 0%;
      height: 100%;
      width : 100%;
    }
    #akcb-attribute-panel-background {
      backdrop-filter: blur(13px);
    }
    #akcb-attribute-panel-content {
      opacity: 0.4;
      overflow-y: scroll;
      transition: all 120ms;
    }
    .attribute-item {
     position: relative;
     width   : 100%;
     height  : calc(1.1em + 2.3em);
     border-radius: 4px;
     background: rgba( 255, 255, 255, 0.04 );
     cursor: pointer;
    }
    .attribute-label {
     width     : 100%;
     font-size : 13pt;
     color     : rgba( 111, 111, 111, 0.69 );
     background: rgba( 1, 1, 1, 0.03 );
     text-align : center;
     line-height: 1.3em;
    }
    .attribute-value {
     width      : 100%;
     font-size  : 15pt;
     text-align : center;
     line-height: 2.5em;
     height     : 2.5em;
     color     : rgba( 14, 14, 14, 0.69 );
    }
    .attribute-label, .attribute-value {
     user-select: none;
    }
    #akcb-attribute-panel:hover {
    }
    #akcb-attribute-panel:hover #akcb-attribute-panel-content {
     opacity: 1;
    }
    .attribute-item:hover .attribute-label {
     color     : rgba( 154, 154, 154, 1.00 );
    }
    .attribute-item:hover .attribute-value {
     color     : rgba( 1, 1, 1, 1.00 );
    }

    #akcb-attribute-panel-content::-webkit-scrollbar {
     width: 5px;
    }
    #akcb-attribute-panel-content::-webkit-scrollbar-thumb {
     background: rgba( 82, 82, 82, 1.00 );
     border-radius: 10px;
    }
    #akcb-attribute-panel-content::-webkit-scrollbar-track {
     box-shadow: inset 0 0 5px grey;
     border-radius: 10px;
    }

    #akcb-minimise {
      pointer-events: all;
      position: absolute; 
      left: 50%;
      bottom: 100px;
      height: 80px;
      width : 80px;
      transform: translate( -50%, 100% );
      overflow: hidden;
      border-radius: 50%;
    }
    #akcb-minimise.near-invisible:hover {
      opacity: 0.23;
    }
    #akcb-minimise-background {
      height: 100%;
      width : 100$;
      background: rgba( 1, 1, 1, 0.13 );
      backdrop-filter: blur(13px);
      border-radius: 50%;
    }
    #akcb-minimise-button {
      position: absolute;
      width: 60px;
      height: 60px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;
      background: rgba(255,255,255,0.78);
      border-radius: 50%;
      border: none;
      outline: none;
    }
    #akcb-minimise-button span {
      position: absolute;
      width: 35px;
      height: 4px;
      top: 50%;
      left: 50%;
      background: #262626;
      border-radius: 2px;
      overflow: hidden;
      transition: all 0.3s linear;
    }
    #akcb-minimise-button span::before {
      content: "";
      position: absolute;
      width: 0;
      height: 100%;
      top: 0;
      right: 0;
      background: gray;
      transition: all 0.3s linear;
    }
    #akcb-minimise-button span:nth-child(1) {
      animation: span-first-off 0.5s ease-in-out;
      animation-fill-mode: forwards;
    }
    #akcb-minimise-button span:nth-child(2) {
      animation: span-second-off 0.5s ease-in-out;
      animation-fill-mode: forwards;
    }
    #akcb-minimise-button span:nth-child(3) {
      animation: span-third-off 0.5s ease-in-out;
      animation-fill-mode: forwards;
    }
    #akcb-minimise-button.on:hover span::before {
      width: 100%;
      transition: all 0.3s linear;
    }
    #akcb-minimise-button.on span:nth-child(1) {
      animation: span-first-on 0.5s ease-in-out;
      animation-fill-mode: forwards;
    }
    #akcb-minimise-button.on span:nth-child(2) {
      animation: span-second-on 0.5s ease-in-out;
      animation-fill-mode: forwards;
    }
    #akcb-minimise-button.on span:nth-child(3) {
      animation: span-third-on 0.5s ease-in-out;
      animation-fill-mode: forwards;
    }

    @keyframes span-first-on {
       0% { transform: translate(-50%, -300%); }
      30% { transform: translate(-50%, -50%); }
     100% { transform: translate(-50%, -50%) rotate(-45deg); }
    }
    @keyframes span-first-off {
       0% { transform: translate(-50%, -50%) rotate(-45deg); }
      30% { transform: translate(-50%, -50%) rotate(0deg); }
     100% { transform: translate(-50%, -300%); }
    }
    @keyframes span-second-on {
       0% { transform: translate(-50%, -50%); }
      25% { background: gray; }
      50% { transform: translate(-50%, -50%) scale(1); }
     100% { transform: translate(-150%, -50%) scale(0); }
    }
    @keyframes span-second-off {
       0% { transform: translate(-150%, -50%) scale(0); }
      25% { background: gray; }
      50% { transform: translate(-50%, -50%) scale(1); }
     100% { transform: translate(-50%, -50%); }
    }
    @keyframes span-third-on {
       0% { transform: translate(-50%, 200%); }
      30% { transform: translate(-50%, -50%); }
     100% { transform: translate(-50%, -50%) rotate(45deg); }
    }
    @keyframes span-third-off {
       0% { transform: translate(-50%, -50%) rotate(45deg); }
      30% { transform: translate(-50%, -50%) rotate(0deg); }
     100% { transform: translate(-50%, 200%); }
    }

    #akcb-floors {
      pointer-events: all;
      position: absolute;
      bottom  : 30px;
      right   : 1.4em;
      width   : 11vmin;
      height  : 5vmin;

      /* styling */
      font-size : 16pt;
      font-family: 'Nunito Sans', sans-serif;
    }
    .akcb-arrow {
     position: absolute;
     top: 50%;
     width: 3vmin;
     height: 3vmin;
     background: transparent;
     border-top: 1vmin solid white;
     border-right: 1vmin solid white;
     box-shadow: 0 0 0 lightgray;
     transition: all 200ms ease;
    }
    .akcb-arrow.left {
     left: 0;
     transform: translate3d(0, -50%, 0) rotate(-135deg);
    }
    .akcb-arrow.right {
     right: 0;
     transform: translate3d(0, -50%, 0) rotate(  45deg);
    }
    .akcb-arrow:hover {
     border-color: orange;
     box-shadow: 0.5vmin -0.5vmin 0 white;
    }
    .akcb-arrow:before {
     content: "";
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-40%, -60%) rotate(45deg);
     width: 200%;
     height: 200%;
    }
  `

  let addCSS = function(rule, container, ruleIdentifier) {
    let rc = ruleIdentifier ? ruleIdentifier : CSSIdentifier
    let output = '<div class="' + rc + '" style="display:none;">&shy;<style>' + rule + '</style></div>'
    document.querySelectorAll(rc).forEach(e => e.remove())
    if (container) {
      document.querySelector(container).insertAdjacentHTML('beforeend', output)
    } else {
      document.body.insertAdjacentHTML('beforeend', output)
    }
  }

  let render = function() {
    body = document.querySelector('body')
    body.insertAdjacentHTML('beforeend', markup)
  }

  let eventify = function() {
    let numberInput = document.querySelector('#akcb-hud-number input')
    numberInput.addEventListener('keyup', (e) => {
      if (!interactable) { return }
      if (e.code == 'Enter' || e.code == 'NumpadEnter') {
        update()
      } else {
        if (numberInput.value.length > 4) {
          numberInput.value = numberInput.value.substring(0, 4)
        }
      }
    })
    
    document.querySelector('body').addEventListener(events.loadingModelStart,    loadingModelStart   )
    document.querySelector('body').addEventListener(events.loadingModelComplete, loadingModelComplete)
    document.querySelector('body').addEventListener(events.loadingFloorStart,    loadingFloorStart   )
    document.querySelector('body').addEventListener(events.loadingFloorComplete, loadingFloorComplete)

    // button styling
    document.querySelector('#akcb-minimise-button').addEventListener('click', function() {
      if (this.classList.contains('on')) { this.classList.remove('on') } else {
        this.classList.add('on')
      }
    })
  }

  let start = function() {
    addCSS(cssRules)
    render()
    eventify()
  }

  return {
    start : start,
    render: render,
    update: update,
    
    searchFor  : searchFor,
    toggleHUD  : toggleHUD,
    updateFloor: updateFloor,
  }
})()
