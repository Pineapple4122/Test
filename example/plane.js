import * as cesium_map from './map';
import * as Cesium from 'cesium'

const viewer = cesium_map.getViewer()

const xhr = new XMLHttpRequest();
//var flightData = [];
//xhr.responseType = 'json';
xhr.open('GET', 'http://127.0.0.1:9001/getdata');
xhr.send();
xhr.onreadystatechange = function () {
   if (xhr.readyState == 4 && xhr.status == 200) {
      let flightData = JSON.parse(xhr.response);

      const timeStepInSeconds = 30;
      const totalSeconds = timeStepInSeconds * (flightData.length - 1);
      const start = Cesium.JulianDate.fromIso8601("2021-10-05T13:10:00Z");
      const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
      viewer.clock.startTime = start.clone();
      viewer.clock.stopTime = stop.clone();
      viewer.clock.currentTime = start.clone();
      viewer.timeline.zoomTo(start, stop);
      // Speed up the playback speed 50x.
      viewer.clock.multiplier = 7;
      // Start playing the scene.
      viewer.clock.shouldAnimate = true;

      // The SampledPositionedProperty stores the position and timestamp for each sample along the radar sample series.
      const positionProperty = new Cesium.SampledPositionProperty();

      for (let i = 0; i < flightData.length; i++) {
         const dataPoint = flightData[i];

         // Declare the time for this individual sample and store it in a new JulianDate instance.
         const time = Cesium.JulianDate.addSeconds(start, i * timeStepInSeconds, new Cesium.JulianDate());
         const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
         // Store the position along with its timestamp.
         // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
         positionProperty.addSample(time, position);

         viewer.entities.add({
            description: `经度: ${dataPoint.longitude}, 
                                    纬度: ${dataPoint.latitude},
                                    海拔高度: ${dataPoint.height}`,
            position: position,
            point: { pixelSize: 10, color: Cesium.Color.RED }
         });
      }

      // STEP 6 CODE (airplane entity)
      async function loadModel() {
         // Load the glTF model from Cesium ion.
         const airplaneUri = await Cesium.IonResource.fromAssetId(704227);
         const airplaneEntity = viewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start: start, stop: stop })]),
            position: positionProperty,
            // Attach the 3D model instead of the green point.
            model: {
               uri: airplaneUri,
               minimumPixelSize: 108,
               maximumScale: 10800,
            },
            // Automatically compute the orientation from the position.
            orientation: new Cesium.VelocityOrientationProperty(positionProperty),
            //path: new Cesium.PathGraphics({ width: 2 })
         });
         // Make the camera track this moving entity.
         viewer.trackedEntity = airplaneEntity;
      }
      loadModel();
   }
}