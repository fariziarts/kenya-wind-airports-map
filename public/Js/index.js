
    const timeInfoContainer = document.getElementById("time-info");
    const timeTextDiv = document.getElementById("time-text");
    const timeSlider = document.getElementById("time-slider");
    const playPauseButton = document.getElementById("play-pause-bt");
    const pointerDataDiv = document.getElementById("pointer-data");
    const airportInfoDiv = document.getElementById("airport-info");
    const baseMapBtn = document.getElementById("base-map-btn");
    const satelliteBtn = document.getElementById("satellite-btn");
    let pointerLngLat = null;
    let isMobile = window.matchMedia("(max-width: 768px)").matches;
    let currentMapStyle = 'base';

    maptilersdk.config.apiKey = process.env.MAPTILER_API_KEY;

    // Select Kenya bounding box
    const kenyaBounds = [
      [27.8, -4.9],
      [48.2, 6.0]    
    ];
    // Major airports and airstrips in Kenya with IATA codes/ can be stored in the DB
    const kenyaAirports = [
      {
        name: "Jomo Kenyatta International Airport",
        iata: "NBO",
        city: "Nairobi",
        coordinates: [36.9258, -1.3215],
        elevation: 1624,
        runways: [
          { number: "06", direction: "L" },
          { number: "24", direction: "R" }
        ]
      },
      {
        name: "Moi International Airport",
        iata: "MBA",
        city: "Mombasa",
        coordinates: [39.5943, -4.0348],
        elevation: 61,
        runways: [
          { number: "03", direction: "L" },
          { number: "21", direction: "R" }
        ]
      },
      {
        name: "Kisumu International Airport",
        iata: "KIS",
        city: "Kisumu",
        coordinates: [34.7289, -0.0861],
        elevation: 1157,
        runways: [
          { number: "07", direction: "L" },
          { number: "25", direction: "R" }
        ]
      },
      {
        name: "Eldoret International Airport",
        iata: "EDL",
        city: "Eldoret",
        coordinates: [35.2389, 0.4044],
        elevation: 2116,
        runways: [
          { number: "01", direction: "L" },
          { number: "19", direction: "R" }
        ]
      },
      {
        name: "Wilson Airport",
        iata: "WIL",
        city: "Nairobi",
        coordinates: [36.8148, -1.3217],
        elevation: 1686,
        runways: [
          { number: "07", direction: "L" },
          { number: "25", direction: "R" }
        ]
      },
      {
        name: "Malindi Airport",
        iata: "MYD",
        city: "Malindi",
        coordinates: [40.1017, -3.2293],
        elevation: 24,
        runways: [
          { number: "05", direction: "L" },
          { number: "23", direction: "R" }
        ]
      },
      {
        name: "Lokichogio Airport",
        iata: "LKG",
        city: "Lokichogio",
        coordinates: [34.3482, 4.2041],
        elevation: 640,
        runways: [
          { number: "13", direction: "L" },
          { number: "31", direction: "R" }
        ]
      },
      {
        name: "Ukunda Airport",
        iata: "UKA",
        city: "Ukunda",
        coordinates: [39.5775, -4.2967],
        elevation: 24,
        runways: [
          { number: "03", direction: "L" },
          { number: "21", direction: "R" }
        ]
      },
      {
        name: "Nanyuki Airport",
        iata: "NYK",
        city: "Nanyuki",
        coordinates: [37.0333, 0.05],
        elevation: 1949,
        runways: [
          { number: "01", direction: "L" },
          { number: "19", direction: "R" }
        ]
      },
      {
        name: "Kitale Airport",
        iata: "KTL",
        city: "Kitale",
        coordinates: [35.0042, 1.0114],
        elevation: 1890,
        runways: [
          { number: "09", direction: "L" },
          { number: "27", direction: "R" }
        ]
      },
      {
        name: "Garissa Airport",
        iata: "GAS",
        city: "Garissa",
        coordinates: [39.6603, -0.4542],
        elevation: 150,
        runways: [
          { number: "05", direction: "L" },
          { number: "23", direction: "R" }
        ]
      }
    ];

    // Mobile-specific configuration for quick loading
    const mobileConfig = {
      bounds: kenyaBounds,
      padding: 10,
      maxZoom: 8,
      minZoom: 5,
      windLayerOptions: {
        coverage: [28.0, -12.0 , 52.0, 6.0] , // Only load data for Kenya
        detailFactor: 0.3, // Lower detail for mobile
        particleDensity: 0.3 // Fewer particles for better performance
      }
    };

    // Desktop configuration
    const desktopConfig = {
      bounds: kenyaBounds,
      padding: 20,
      maxZoom: 7,
      minZoom: 4,
      windLayerOptions: {
        coverage: null, // Global coverage
        detailFactor: 0.5, // Lower detail for faster loading
        particleDensity: 0.5 // Fewer particles for better performance
      }
    };

    const config = isMobile ? mobileConfig : desktopConfig;

    const map = new maptilersdk.Map({
      container: document.getElementById('map'),
      hash: true,
      style: maptilersdk.MapStyle.BACKDROP, // Start with base map
      bounds: config.bounds,
      fitBoundsOptions: {
        padding: config.padding,
        maxZoom: config.maxZoom
      },
      minZoom: config.minZoom,
      projectionControl: true,
      interactive: true
    });

    // Enable necessary interactions
    map.dragPan.enable();
    map.touchZoomRotate.enable();

    // Initialize wind layer with optimized settings
    const layer = new maptilerweather.WindLayer(config.windLayerOptions);

    map.on('load', function () {
      // Darkening the water layer to make the land stand out
      map.setPaintProperty("Water", 'fill-color', "rgba(0, 0, 0, 0.4)");
      map.addLayer(layer, 'Water');

      // Constrain the map view to Kenya's bounds
      map.setMaxBounds(kenyaBounds);

      // Add airport markers
      addAirportMarkers();

      // Adjust view for mobile
      if (isMobile) {
        map.fitBounds(kenyaBounds, {
          padding: 20,
          maxZoom: 5.5
        });
      }
    });

    // Toggle between base map and satellite
    baseMapBtn.addEventListener('click', () => {
      if (currentMapStyle !== 'base') {
        map.setStyle(maptilersdk.MapStyle.BACKDROP);
        currentMapStyle = 'base';
        baseMapBtn.classList.add('active');
        baseMapBtn.classList.remove('inactive');
        satelliteBtn.classList.add('inactive');
        satelliteBtn.classList.remove('active');

        // Re-add wind layer
        map.once('styledata', () => {
          map.setPaintProperty("Water", 'fill-color', "rgba(0, 0, 0, 0.4)");
          map.addLayer(layer, 'Water');
        });
      }
    });

    satelliteBtn.addEventListener('click', () => {
      if (currentMapStyle !== 'satellite') {
        map.setStyle(maptilersdk.MapStyle.SATELLITE);
        currentMapStyle = 'satellite';
        satelliteBtn.classList.add('active');
        satelliteBtn.classList.remove('inactive');
        baseMapBtn.classList.add('inactive');
        baseMapBtn.classList.remove('active');

        // Re-add wind layer
        map.once('styledata', () => {
          // Add wind layer
          map.addLayer(layer, 'road-label');

          // Adjust satellite imagery
          if (map.getLayer('satellite')) {
            map.setPaintProperty('satellite', 'raster-brightness-max', 0.7);
            map.setPaintProperty('satellite', 'raster-contrast', 0.8);
          }
        });
      }
    });

    function addAirportMarkers() {
      kenyaAirports.forEach(airport => {
        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.className = 'airport-marker';
        el.title = `${airport.name} (${airport.iata})`;

        // Add marker to map
        new maptilersdk.Marker(el)
          .setLngLat(airport.coordinates)
          .setPopup(new maptilersdk.Popup({ offset: 25 })
            .setHTML(`
              <h3>${airport.name} (${airport.iata})</h3>
              <p><strong>City:</strong> ${airport.city}</p>
              <p><strong>Elevation:</strong> ${airport.elevation}m</p>
              <p><strong>Runways:</strong> ${airport.runways.map(runway => `${runway.number}${runway.direction}`).join(', ')}</p>
              <button class="show-wind-btn" data-lng="${airport.coordinates[0]}" data-lat="${airport.coordinates[1]}">
                Show weather report
              </button>
            `))
          .addTo(map);

        // Add click event to show wind data
        el.addEventListener('click', () => {
          showAirportWindData(airport);
        });
      });
    }

    function showAirportWindData(airport) {
      const windData = layer.pickAt(airport.coordinates[0], airport.coordinates[1]);

      if (windData) {
        airportInfoDiv.innerHTML = `
          <h3>${airport.name} (${airport.iata})</h3>
          <p><strong>Wind Direction:</strong> ${windData.compassDirection}</p>
          <p><strong>Wind Speed:</strong> ${windData.speedKilometersPerHour.toFixed(1)} km/h</p>
          <p><strong>Coordinates:</strong> ${airport.coordinates[1].toFixed(4)}°N, ${airport.coordinates[0].toFixed(4)}°E</p>
          <p><strong>Elevation:</strong> ${airport.elevation}m</p>
          <p><strong>Runways:</strong> ${airport.runways.map(runway => `${runway.number}${runway.direction}`).join(', ')}</p>
        `;
        airportInfoDiv.style.display = 'block';
      } else {
        airportInfoDiv.innerHTML = `<p>No wind data available for ${airport.name}</p>`;
        airportInfoDiv.style.display = 'block';
      }

      // Center map on airport with a slight zoom
      map.flyTo({
        center: airport.coordinates,
        zoom: 8,
        essential: true
      });
    }

    timeSlider.addEventListener("input", (evt) => {
      layer.setAnimationTime(parseInt(timeSlider.value));
    });

    layer.on("sourceReady", event => {
      const startDate = layer.getAnimationStartDate();
      const endDate = layer.getAnimationEndDate();
      const currentDate = layer.getAnimationTimeDate();
      refreshTime();

      timeSlider.min = +startDate;
      timeSlider.max = +endDate;
      timeSlider.value = +currentDate;
    });

    layer.on("tick", event => {
      refreshTime();
      updatePointerValue(pointerLngLat);
    });

    layer.on("animationTimeSet", event => {
      refreshTime();
    });

    let isPlaying = false;
    playPauseButton.addEventListener("click", () => {
      if (isPlaying) {
        layer.animateByFactor(0);
        playPauseButton.innerText = "Play 3600x";
      } else {
        layer.animateByFactor(3600);
        playPauseButton.innerText = "Pause";
      }
      isPlaying = !isPlaying;
    });

    function refreshTime() {
      const d = layer.getAnimationTimeDate();
      timeTextDiv.innerText = d.toString();
      timeSlider.value = +d;
    }

    function updatePointerValue(lngLat) {
      if (!lngLat) return;
      pointerLngLat = lngLat;
      const value = layer.pickAt(lngLat.lng, lngLat.lat);
      if (!value) {
        pointerDataDiv.innerText = "";
        return;
      }
      pointerDataDiv.innerHTML = `<div id="arrow" style="transform: rotate(${value.directionAngle}deg);">↑</div>
      ${value.compassDirection} ${value.speedKilometersPerHour.toFixed(1)} km/h`;
    }

    timeInfoContainer.addEventListener("mouseenter", () => {
      pointerDataDiv.innerText = "";
    });

    map.on('mousemove', (e) => {
      updatePointerValue(e.lngLat);
    });

    // Handle touch events for mobile
    map.on('touchmove', (e) => {
      if (e.points.length > 0) {
        updatePointerValue(e.lngLat);
      }
    });

    // Close airport info when clicking on the map
    map.on('click', () => {
      airportInfoDiv.style.display = 'none';
    });

    // Prevent page scrolling when interacting with the map
    document.addEventListener('touchmove', function(e) {
      if (e.target === map.getCanvas()) {
        e.preventDefault();
      }
    }, { passive: false });

    // Handle window resize
    window.addEventListener('resize', () => {
      isMobile = window.matchMedia("(max-width: 768px)").matches;
      map.fitBounds(kenyaBounds, {
        padding: isMobile ? 20 : 30,
        maxZoom: isMobile ? 5.5 : 6
      });
    });
 