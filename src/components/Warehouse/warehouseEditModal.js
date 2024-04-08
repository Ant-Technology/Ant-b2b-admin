import {
  TextInput,
  Grid,
  Button,
  ScrollArea,
  LoadingOverlay,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { customLoader } from "components/utilities/loader";
import { UPDATE_WARE_HOUSE } from "apollo/mutuations";
import ContentLoader from "react-content-loader";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  Autocomplete,
} from "@react-google-maps/api";
import { GET_REGIONS } from "apollo/queries";

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
//AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk
const GOOGLE_API_KEY = "AIzaSyARVREQA1z13d_alpkPt_LW_ajP_VfFiGk";
const libraries = ["places"];
const CategoryEditModal = ({
  setOpenedEdit,
  editId,
  getWarehouse,
  loading,
}) => {
  const [location, setLocation] = useState({});
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
  console.log("Center", center);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
  });

  const mapLoadHandler = (map) => {
    setMapRef(map);
  };

  const onPlaceChangedHandler = () => {
    if (autocomplete !== null) {
      console.log(autocomplete.getPlace().name);
      form.setFieldValue("specific_area", autocomplete.getPlace().name);
      setCenter({
        lat: autocomplete.getPlace().geometry.location.lat(),
        lng: autocomplete.getPlace().geometry.location.lng(),
      });
      setLocation({
        lat: autocomplete.getPlace().geometry.location.lat(),
        lng: autocomplete.getPlace().geometry.location.lng(),
      });
    }
  };

  const autocompleteLoadHandler = (autocomplete) => {
    setAutocomplete(autocomplete);
  };
  //form initialization and validation
  const form = useForm({
    name: "",
    region: { connect: "1" }, // Provide the default region ID here
    specific_area: "",
  });

  useEffect(() => {
    if (editId) {
      getWarehouse({
        variables: { id: editId },

        onCompleted(data) {
          // console.log(data)
          form.setValues({
            name: data.warehouse?.name,
            specific_area: data.warehouse?.specific_area,
            region: { connect: data.warehouse?.region?.id },
          });
          setLocation({ ...data.warehouse?._geo });
        },
      });
    }
    // eslint-disable-next-line
  }, []);

  const [regionsDropDownData, setRegionsDropDownData] = useState([]);

  // graphql queries
  const { loading: regionsLoading } = useQuery(GET_REGIONS, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let regions = data.regions;
      let regionsArray = [];

      // loop over regions data to structure the data for the use of drop down
      regions.data.forEach((region, index) => {
        regionsArray.push({
          label: region?.name,
          value: region?.id,
        });
      });

      // put it on the state
      setRegionsDropDownData([...regionsArray]);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });
  // mutation
  const [editWarehouse] = useMutation(UPDATE_WARE_HOUSE);

  const { height } = useViewportSize();

  const submit = () => {
    editWarehouse({
      variables: {
        id: editId,
        name: form.values.name, // Use form.values to access form fields
        _geo: {
          lat: +location.lat,
          lng: +location.lng,
        },
        region: { connect: form.values.region.connect }, // Access the region value correctly
        specific_area: form.values.specific_area,
      },

      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Warehouse Edited Successfully",
        });
        // refetch();
        form.reset();
        setOpenedEdit(false);
      },
      onError() {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Something went wrong while editing vehicle",
        });
      },
    });
  };
  const setRegionDropDownValue = (val) => {
    form.setFieldValue("region.connect", val);
  };
  return (
    <>
      <LoadingOverlay
        visible={loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Name"
                placeholder="Name"
                {...form.getInputProps("name")}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}>
              {" "}
              <Select
                data={regionsDropDownData}
                value={form.getInputProps("region.connect").value}
                onChange={setRegionDropDownValue}
                label="Region"
                placeholder="Pick a region this retailer belongs to"
              />
            </Grid.Col>
            {isLoaded && (
              <Grid.Col span={6}>
                <Autocomplete
                  onLoad={autocompleteLoadHandler}
                  onPlaceChanged={onPlaceChangedHandler}
                >
                  <TextInput
                    required
                    label="Specific Area"
                    placeholder="Specific Area"
                    {...form.getInputProps("specific_area")}
                  />
                </Autocomplete>
              </Grid.Col>
            )}
          </Grid>
          <Grid style={{ marginTop: "10px" }}>
            <Grid.Col span={12}>
              <ScrollArea style={{ height: "auto" }}>
                {isLoaded ? (
                  <GoogleMap
                    center={center}
                    zoom={14}
                    mapContainerStyle={containerStyle}
                    onLoad={mapLoadHandler}
                    onClick={() =>
                      mapRef && setCenter(mapRef.getCenter().toJSON())
                    }
                  >
                    <MarkerF
                      position={center}
                      draggable
                      onDragEnd={(a) => setLocation(a.latLng.toJSON())}
                    />
                  </GoogleMap>
                ) : (
                  <Loader />
                )}
              </ScrollArea>
            </Grid.Col>
          </Grid>
          <Grid style={{ marginTop: "10px", marginBottom: "20px" }}>
            <Grid.Col span={4}>
              <Button type="submit" color="blue" variant="outline" fullWidth>
                Submit
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </ScrollArea>
    </>
  );
};

export default CategoryEditModal;
