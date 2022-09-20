mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: listing.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

const marker = new mapboxgl.Marker({
        color: "#98D8D5",
        draggable: true
    })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<p>${listing.streetNumber} ${listing.streetName}</p>`
        )
    )
    .addTo(map);

    map.addControl(new mapboxgl.NavigationControl());   