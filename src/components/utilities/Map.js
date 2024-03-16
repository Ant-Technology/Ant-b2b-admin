import React, { useState, useEffect } from "react";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  Autocomplete,
} from "@react-google-maps/api";
import ContentLoader from "react-content-loader";

// TODO: change map key env variable

const Loader = () => (
  <ContentLoader
    width="100%"
    height={400}
    backgroundColor="#f0f0f0"
    foregroundColor="#dedede"
  >
    <rect width="100%" height="400px" />
  </ContentLoader>
);

const containerStyle = {
  width: "100%",
  height: "400px",
};

const inputStyle = {
  boxSizing: `border-box`,
  border: `1px solid transparent`,
  width: `40%`,
  height: `32px`,
  padding: `18px 12px`,
  borderRadius: `3px`,
  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
  fontSize: `14px`,
  outline: `none`,
  textOverflow: `ellipses`,
  position: "absolute",
  left: "50%",
  marginTop: "320px",
  marginLeft: "-120px",
  backgroundColor: `#fff`,
};

//AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk
const GOOGLE_API_KEY = "AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk";
const libraries = ["places"];

const Map = ({ location, setLocation }) => {
  const [center, setCenter] = useState({ lat: 8.9999645, lng: 38.7700539 });
  const [autocomplete, setAutocomplete] = useState();
  const [mapRef, setMapRef] = useState(null);
  useEffect(() => {
    if (
      location &&
      Object.keys(location) &&
      Object.keys(location)?.length > 0
    ) {
      setCenter({ lat: location.lat, lng: location.lng });
    }
  }, [location]);
console.log("Center",center)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
  });

  const mapLoadHandler = (map) => {
    setMapRef(map);
  };

  const onPlaceChangedHandler = () => {
    if (autocomplete !== null) {
      setCenter({
        lat: autocomplete.getPlace().geometry.location.lat(),
        lng: autocomplete.getPlace().geometry.location.lng(),
      });
    }
  };

  const autocompleteLoadHandler = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const renderMap = () => {
    return (
      <GoogleMap
        center={center}
        zoom={14}
        mapContainerStyle={containerStyle}
        onLoad={mapLoadHandler}
        onClick={() => mapRef && setCenter(mapRef.getCenter().toJSON())}
      >
        <MarkerF
          position={center}
          draggable
          onDragEnd={(a) => setLocation(a.latLng.toJSON())}
        />
        <Autocomplete
          onLoad={autocompleteLoadHandler}
          onPlaceChanged={onPlaceChangedHandler}
        >
          <input
            type="text"
            placeholder="Search for your city or business"
            style={inputStyle}
          />
        </Autocomplete>
      </GoogleMap>
    );
  };

  return isLoaded ? renderMap() : <Loader />;
};

export default Map;
