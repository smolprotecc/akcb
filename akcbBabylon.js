
akcbBabylon = (function() {
  let dev = true

  let setup = function(size) {
    // some statics
    body = document.querySelector('body')

    // resize our canvas
    canvas = document.querySelector('#renderCanvas')
    canvas.height = size ? size : window.innerHeight
    canvas.width  = size ? size : window.innerWidth

    // create the engine
    engine = new BABYLON.Engine(canvas, false, {}, false)

    // prevent gltf files from auto-playing
    BABYLON.SceneLoader.OnPluginActivatedObservable.add((e) => {
      if (e.name === 'gltf' && e instanceof BABYLON.GLTFFileLoader) {
        e.animationStartMode = BABYLON.GLTFLoaderAnimationStartMode.NONE
      }
    })
    
    // add event listeners
    window.addEventListener('resize', function() { engine.resize() })
  }
  
  let defaultScene = async function() {
    // generate scene
    scene = await createScene()
    // animate
    engine.runRenderLoop(function() {
      scene.render()
    })
  }
  
  let createScene = async function(options) {

    // Initialise scene object
    var scene = new BABYLON.Scene(engine)
    
    // All camera options
    let cameraAlpha  = options?.cameraAlpha  || -Math.PI / 2
    let cameraBeta   = options?.cameraBeta   || Math.PI / 2.5
    let cameraRadius = options?.cameraRadius || 10
    let cameraTarget = options?.cameraTarget || new BABYLON.Vector3(0, 0, 0)
    
    let cameraWheelPrecision       = options?.cameraWheelPrecision || 11
    let cameraRangeLowerProximity  = options?.cameraRangeLowerProximity || 5
    let cameraRangeHigherProximity = options?.cameraRangeHigherProximity || 135
    let cameraStartPosition        = options?.cameraStartPosition || new BABYLON.Vector3(-3.5,4.0,8.5)
    
    // All camera instructions
    let camera = new BABYLON.ArcRotateCamera('viewport', cameraAlpha, cameraBeta, cameraRadius, cameraTarget)
    // Attach camera to canvas
    camera.attachControl(canvas, true, false, 0)
    // Adjust the camera movements
    scene.useRightHandedSystem = true
    // Camera target
    camera.setTarget(cameraTarget)
    // Wheel inputs
    camera.inputs.addMouseWheel()
    camera.wheelPrecision = cameraWheelPrecision
    // Restrict camera-to-target range
    camera.lowerRadiusLimit = cameraRangeLowerProximity
    camera.upperRadiusLimit = cameraRangeHigherProximity
    // Restrict camera to above ground level
    camera.upperBetaLimit = Math.PI / 2.2
    camera.lowerBetaLimit = Math.PI / (Math.PI * 1.7)
    // Restrict Y-axis movement to prevent compound movements allowing below-ground transposition
    camera.panningAxis = new BABYLON.Vector3(1.1,0,-1.6) // (2,0,3.3)
    // Change the speed of rotation
    camera.angularSensibilityX = 2000
    camera.angularSensibilityY = 2000
    // Set starting position
    camera.position = cameraStartPosition

    // All Light options
    let lightIntensity = options?.lightIntensity || 1

    // Set the Light
	let light = new BABYLON.HemisphericLight("Light", new BABYLON.Vector3(0, 4, 2), scene);
	light.diffuse  = new BABYLON.Color3(0.98, 0.97, 0.95);
	light.specular = new BABYLON.Color3(0.98, 0.97, 0.95);
	light.groundColor = new BABYLON.Color3(0, 0, 0);
    light.intensity = lightIntensity

    if (dev) {
      // Central sphere for orientation
      if (false) {
        let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1, segments: 32}, scene);
        sphere.position.y = 1;
      }
      // Compass points for orientation
      let compass = [
        {name: 'north', color: BABYLON.Color3.Teal(),  x: 0,     y: -49.5},
        {name: 'east',  color: BABYLON.Color3.Red(),   x: 49.5,  y: 0},
        {name: 'south', color: BABYLON.Color3.Green(), x: 0,     y:  49.5},
        {name: 'west',  color: BABYLON.Color3.Blue(),  x: -49.5, y: 0},
      ]
      compass.forEach(point => {
        let p = BABYLON.MeshBuilder.CreateBox(point.name, {}, scene)
        p.position.x = point.x
        p.position.z = point.y
        let m = new BABYLON.StandardMaterial('material-for-' + point.name, scene)
        m.diffuseColor = point.color
        p.material = m
      })
      if (false) {
        const axes = new BABYLON.AxesViewer(scene, 5)
      }
    }
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);
    
    if (false) {
      engine.runRenderLoop(function() {
        camera.alpha += 0.001
      })
    }
    
    return scene
  }

  return {
    setup         : setup,
    defaultScene  : defaultScene,
  }
})()
