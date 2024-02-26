import React, { useState } from "react";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  InfoWindow
} from "@react-google-maps/api";
import ContentLoader from "react-content-loader";
import { useQuery } from "@apollo/client";
import { GET_ALL_GEO_LOCATIONS } from "apollo/queries";

// TODO: change map key env variable

const Loader = () => (
    <ContentLoader
      width="100%"
      height={600}
      backgroundColor="#f0f0f0"
      foregroundColor="#dedede"
    >
      <rect width="100%" height="600px" />
    </ContentLoader>
  );
  
  const containerStyle = {
    width: "100%",
    height: "600px",
  };
  
  const divStyle = {
    background: `white`,
    border: `1px solid #E03131`,
    color: `#E03131`,
    padding: 15
  }
  
  const distributerIcon = {
    url: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/40/000000/external-distributor-sales-flaticons-lineal-color-flat-icons.png"
  };
  
  const retailerIcon = {
    url: "https://img.icons8.com/external-filled-outline-wichaiwi/40/000000/external-Retailer-business-filled-outline-wichaiwi.png"
  };
  
  const warehouseIcon = {
    url: "https://img.icons8.com/external-xnimrodx-lineal-color-xnimrodx/40/000000/external-warehouse-distribution-xnimrodx-lineal-color-xnimrodx-2.png"
  };
  
  const GOOGLE_API_KEY = "AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk";

const MapView = () => {
  const [center, setCenter] = useState({ lat: 90857.03, lng: 402955.92 });
  const [activeMarker, setActiveMarker] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
  });

  const { data, loading } = useQuery(GET_ALL_GEO_LOCATIONS, {
    fetchPolicy: "no-cache",
  });

  const handleActiveMarker = (marker, _geo) => {
    if (marker === activeMarker) {
      return;
    }
    setCenter(_geo);
    setActiveMarker(marker);
  };

  const mapLoadHandler = (map) => {
    const bounds = new window.google.maps.LatLngBounds();
    let geo = [];

    data.distributorsNonPaginated.forEach((_geo) => geo.push(_geo));
    data.warehousesNonPaginated.forEach((_geo) => geo.push(_geo));
    data.distributorsNonPaginated.forEach((_geo) => geo.push(_geo));

    geo.forEach(({ _geo }) => bounds.extend(_geo));
    map.fitBounds(bounds);
  };

  const renderMap = () => {
    return (
      <GoogleMap
        center={center}
        zoom={14}
        onClick={() => setActiveMarker(null)}
        mapContainerStyle={containerStyle}
        onLoad={mapLoadHandler}
      >

        {data.retailersNonPaginated.map(({ id, _geo, name }) => (
          <MarkerF
            key={name}
            position={_geo}
            onClick={() => handleActiveMarker(name, _geo)}
            icon={retailerIcon}
          >
            {activeMarker === name ? (
              <InfoWindow
                position={_geo}
              >
                <div style={divStyle}>
                  <p>{name}</p>
                </div>
              </InfoWindow>
            ) : null}
          </MarkerF>
        ))}

        {data.distributorsNonPaginated.map(({ id, _geo, name }) => (
          <MarkerF
            key={name}
            position={_geo}
            onClick={() => handleActiveMarker(name, _geo)}
            icon={distributerIcon}
          >
            {activeMarker === name ? (
              <InfoWindow
                position={_geo}
              >
                <div style={divStyle}>
                  <p>{name}</p>
                </div>
              </InfoWindow>
            ) : null}
          </MarkerF>
        ))}

        {data.warehousesNonPaginated.map(({ id, _geo, name }) => (
          <MarkerF
            key={name}
            position={_geo}
            onClick={() => handleActiveMarker(name, _geo)}
            icon={warehouseIcon}
          >
            {activeMarker === name ? (
              <InfoWindow
                position={_geo}
              >
                <div style={divStyle}>
                  <p>{name}</p>
                </div>
              </InfoWindow>
            ) : null}
          </MarkerF>
        ))}
      </GoogleMap>
    );
  };

  return isLoaded && !loading ? renderMap() : <Loader />;
}

export default MapView