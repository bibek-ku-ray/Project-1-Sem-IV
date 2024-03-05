
  mapboxgl.accessToken = mapToken;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 10
  });

  console.log(coordinates)
  console.log(title)
  
  const marker = new mapboxgl.Marker({color: "red"}) 
  .setLngLat(coordinates) 
  .setPopup( 
      new mapboxgl.Popup({ offset: 25 }) 
      .setHTML(`<h4>${title}</h4><p>Happy Travel with Trip-Tide</p>`) 
  ) 
  .addTo(map);
 