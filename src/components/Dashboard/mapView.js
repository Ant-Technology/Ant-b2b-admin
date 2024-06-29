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
  padding: '0 15px 0 15px'
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

const MapView = ({ value }) => {
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
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

    if (value === 'Retailer' || value === null) {
      geo = geo.concat(data.retailersNonPaginated.filter(({ _geo }) => _geo));
    }
    if (value === 'Distributor' || value === null) {
      geo = geo.concat(data.distributorsNonPaginated.filter(({ _geo }) => _geo));
    }
    if (value === 'Warehouse' || value === null) {
      geo = geo.concat(data.warehousesNonPaginated.filter(({ _geo }) => _geo));
    }
    
    geo.forEach(({ _geo }) => bounds.extend(_geo));
    map.fitBounds(bounds);
  };

  const renderMap = () => {
    const retailers = data?.retailersNonPaginated?.filter(({ _geo }) => _geo) || [];
    const distributors = data?.distributorsNonPaginated?.filter(({ _geo }) => _geo) || [];
    const warehouses = data?.warehousesNonPaginated?.filter(({ _geo }) => _geo) || [];

    return (
      <GoogleMap
        center={center}
        zoom={14}
        onClick={() => setActiveMarker(null)}
        mapContainerStyle={containerStyle}
        onLoad={mapLoadHandler}
      >
        {(value === 'Retailer' || value === null) && retailers.map(({ id, _geo, name, region, address }) => (
          <MarkerF
            key={id}
            position={_geo}
            onClick={() => handleActiveMarker(id, _geo)}
            icon={retailerIcon}
          >
            {activeMarker === id ? (
              <InfoWindow position={_geo}>
                <div style={divStyle}>
                  <p><span style={{ marginRight: "10px", color: "rgb(20, 61, 89)" }}>Name</span>{name}</p>
                  <p><span style={{ marginRight: "10px", color: "rgb(20, 61, 89)" }}>Region</span>{region.name}</p>
                  <p><span style={{ marginRight: "10px", color: "rgb(20, 61, 89)" }}>Address</span>{address}</p>
                  <p><span style={{ marginRight: "10px", color: "rgb(20, 61, 89)" }}>Type</span>Retailer</p>
                </div>
              </InfoWindow>
            ) : null}
          </MarkerF>
        ))}

        {(value === 'Distributor' || value === null) && distributors.map(({ id, _geo, name, region, address }) => (
          <MarkerF
            key={id}
            position={_geo}
            onClick={() => handleActiveMarker(id, _geo)}
            icon={distributerIcon}
          >
            {activeMarker === id ? (
              <InfoWindow position={_geo}>
                <div style={divStyle}>
                  <p><span style={{ marginRight: "10px", color: "rgb(20, 61, 89)" }}>Name</span>{name}</p>
                  <p><span style={{ marginRight: "10px", color: "rgb(20, 61, 89)" }}>Region</span>{region.name}</p>
                  <p><span style={{ marginRight: "10px", color: "rgb(20, 61, 89)" }}>Address</span>{address}</p>
                  <p><span style={{ marginRight: "10px", color: "rgb(20, 61, 89)" }}>Type</span>Distributor</p>
                </div>
              </InfoWindow>
            ) : null}
          </MarkerF>
        ))}

        {(value === 'Warehouse' || value === null) && warehouses.map(({ id, _geo, name, region }) => (
          <MarkerF
            key={id}
            position={_geo}
            onClick={() => handleActiveMarker(id, _geo)}
            icon={warehouseIcon}
          >
            {activeMarker === id ? (
              <InfoWindow position={_geo}>
                <div style={divStyle}>
                  <p><span style={{ marginRight: "10px", color: "rgb(20, 61, 89)" }}>Name</span>{name}</p>
                  <p><span style={{ marginRight: "10px", color: "rgb(20, 61, 89)" }}>Region</span>{region.name}</p>
                  <p><span style={{ marginRight: "10px", color: "rgb(20, 61, 89)" }}>Type</span>Warehouse</p>
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

export default MapView;
