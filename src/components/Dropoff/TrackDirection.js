import React, { useState } from "react";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  InfoWindow,
} from "@react-google-maps/api";
import ContentLoader from "react-content-loader";
import { useViewportSize } from "@mantine/hooks";
import { ScrollArea } from "@mantine/core";

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
  padding: 15,
};

// Replace this with your "care" icon URL
const careIcon = {
  url: "https://img.icons8.com/external-flaticons-flat-flat-icons/40/000000/external-care-hospital-flaticons-flat-flat-icons.png",
};

const GOOGLE_API_KEY = "AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk";

const DriverMapView = () => {
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Example coordinates
  const [activeMarker, setActiveMarker] = useState(null);
  
  // Create an object with geo data for one location
  const location = {
    id: 1,
    name: "Care Center",
    _geo: { lat: 37.7749, lng: -122.4194 }, // Example: San Francisco coordinates
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
  });

  const handleActiveMarker = (marker, _geo) => {
    if (marker === activeMarker) {
      return;
    }
    setCenter(_geo);
    setActiveMarker(marker);
  };
  const { height } = useViewportSize();


  const renderMap = () => {
    return (
      <ScrollArea style={{ height: height / 1.5 }} type="auto" offsetScrollbars>
        <ScrollArea style={{ height: "auto" }}>
      <GoogleMap
        center={center}
        zoom={14}
        onClick={() => setActiveMarker(null)}
        mapContainerStyle={containerStyle}
      >
        <MarkerF
          key={location.id}
          position={location._geo}
          onClick={() => handleActiveMarker(location.name, location._geo)}
          icon={careIcon} // Use the care icon here
        >
          {activeMarker === location.name && (
            <InfoWindow position={location._geo}>
              <div style={divStyle}>
                <p>{location.name}</p>
              </div>
            </InfoWindow>
          )}
        </MarkerF>
      </GoogleMap>
      </ScrollArea>
      </ScrollArea>
    );
  };

  return isLoaded ? renderMap() : <Loader />;
};

export default DriverMapView;