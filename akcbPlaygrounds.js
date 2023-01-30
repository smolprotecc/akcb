
akcbPlaygrounds = (function() {

  let body; 
  // Statics
  let CSSIdentifier = 'akcb-playgrounds'
  let glbURL        = 'https://cloudflare-ipfs.com/ipfs/QmNRK6ijPiNmsKiGxVRhTGczUEAFmAGVMNCgZqN4wzTkrT/FILENUMBER.glb'
  let metadataURL   = 'https://cloudflare-ipfs.com/ipfs/QmRiP1c1j5Lobzb6SpP5pJfC1kyHjnGyGNRg5kfgiUTgSD/FILENUMBER'

  let events = {
    newAKCBNumber: 'new-akcb-number',
  }

  let raiseEvent = function(target, event, datum) { target.dispatchEvent(new CustomEvent(event, {detail: datum})) }

  let retrieve = function(which) {
    return fetch(glbURL.replace('FILENUMBER',which))
      .then((res) => res.body)
      .then((body) => {

      })
      .then((stream) => new Response(stream))
      .then((res)  => res.blob())
      .then((blob) => URL.createObjectURL(blob))
      .then((url)  => { return url })
  }

  let update = async function() {
    let numberInput = document.querySelector('#akcb-hud-number input')
    let n = numberInput.value
    if (n.match(/\D+/)) {
      console.log('Non-digit request')
      return false
    }
    let datum = await retrieve(n)
    console.log(datum)

    raiseEvent(body, events.newAKCBNumber, numberInput.value) 
  }

  let markup = `
    <div id='akcb-hud'>
    <div id='akcb-hud-number'><input placeholder="6262"></input><div id='akcb-hud-number-go' onclick='akcbPlaygrounds.update()'>go</div></div>
    </div>
  `
  let cssRules = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans&display=swap');
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
      transition: all 120ms;
    }
    #akcb-hud-number-go:hover {
      background : rgba( 1, 1, 1, 0.23 );
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
      if (e.code == 'Enter') {
        update()
      } else {
        if (numberInput.value.length > 4) {
          numberInput.value = numberInput.value.substring(0, 4)
        }
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
  }
})()
